import Quotations from './quotations.model';
import { IQuotations } from './quotations.interface';
import QueryBuilder from '../../builder/QueryBuilder';
import httpStatus from 'http-status';
import AppError from '../../errors/AppError';
import { Request } from 'express';
import { FolderModel, ImageGalleryModel } from '../image-gallery/image-gallery.model';
import { UploadApiResponse } from 'cloudinary';
import { deleteAttachment, saveAttachment } from '../../utils/cloudinary';
import Product from '../product/product.model';
import Billers from '../Billers/Billers.model';
import Customers from '../Customers/Customers.model';
import Supplier from '../supplier/supplier.model';
import Tax from '../tax/tax.model';
import puppeteer from 'puppeteer';
import Storefront from '../storefront/storefront.model';
import ejs from 'ejs';
import path from 'path';

export const attachDocumentToQuotations = async (req: Request) => {
  if (!req.file) return null;

  const folderName = 'Attachments';
  let folder = await FolderModel.findOne({ name: folderName });

  if (!folder) {
    folder = await FolderModel.create({ name: folderName });
  }

  const uploadResult = (await saveAttachment(req.file)) as UploadApiResponse;
  await ImageGalleryModel.create({
    folder: folder._id,
    public_id: uploadResult.public_id,
    url: uploadResult.secure_url
  });

  return {
    url: uploadResult.secure_url,
    publicId: uploadResult.public_id
  };
};

const checkExistence = async (id: string, model: any, entityName: string) => {
  const entity = await model.findById(id);
  if (!entity) {
    throw new AppError(httpStatus.NOT_FOUND, `${entityName} with ID ${id} not found`);
  }
};

export const getAllQuotations = async (query: Record<string, unknown>): Promise<any> => {
  try {
    const quotationsQuery = new QueryBuilder(Quotations.find({}), query)
      .search(['name'])
      .filter()
      .sort()
      .paginate()
      .fields();

    const meta = await quotationsQuery.countTotal();
    const result = await quotationsQuery.queryModel;

    return { meta, result };
  } catch (error: any) {
    throw new AppError(httpStatus.INTERNAL_SERVER_ERROR, error.message || 'Internal Server Error');
  }
};

export const getQuotationsById = async (id: string): Promise<IQuotations | null> => {
  try {
    const quotations = await Quotations.findById(id).populate('biller tax supplier customer');
    if (!quotations) {
      throw new AppError(httpStatus.NOT_FOUND, 'Quotation not found');
    }
    return quotations;
  } catch (error: any) {
    throw new AppError(httpStatus.INTERNAL_SERVER_ERROR, error.message || 'Internal Server Error');
  }
};

export const createQuotations = async (req: Request): Promise<IQuotations | null> => {
  try {
    const { items, biller, customer, supplier, tax } = req.body;

    // Check if each product, biller, customer, and supplier exist
    await Promise.all([
      ...items.map((item: any) => checkExistence(item.product_id, Product, 'Product')),
      checkExistence(biller, Billers, 'Biller'),
      checkExistence(customer, Customers, 'Customer'),
      checkExistence(supplier, Supplier, 'Supplier'),
      tax && checkExistence(tax, Tax, 'Tax')
    ]);

    // Apply product tax and discount to each item
    req.body.items = await Promise.all(
      items.map(async (item: any) => {
        const product = (await Product.findById(item.product_id).populate('productTax')) as any;

        if (!product) {
          throw new AppError(httpStatus.NOT_FOUND, 'Product not found');
        }

        // Calculate tax if applicable
        const tax = product?.productTax
          ? product.productTax.type === 'Fixed'
            ? product.productTax.rate
            : (product.productTax.rate / 100) * item.unit_price
          : 0;

        const discount = Number(product.discount_price) || 0;

        // Calculate sub_total
        item.sub_total = Number(item.unit_price) * Number(item.quantity) - discount + tax;
        item.tax = tax; // Include the tax in the item if applicable
        item.discount = discount;

        return item;
      })
    );

    req.body.attachDocument = await attachDocumentToQuotations(req);

    return await Quotations.create(req.body);
  } catch (error: any) {
    throw new AppError(httpStatus.INTERNAL_SERVER_ERROR, error.message || 'Internal Server Error');
  }
};

export const updateQuotations = async (id: string, req: Request): Promise<IQuotations | null> => {
  try {
    const { items, biller, customer, supplier, tax } = req.body;

    const quotations = await Quotations.findById(id);
    if (!quotations) {
      throw new AppError(httpStatus.NOT_FOUND, 'Quotation not found');
    }

    // Check if each product, biller, customer, and supplier exist
    await Promise.all([
      ...items.map((item: any) => checkExistence(item.product_id, Product, 'Product')),
      checkExistence(biller, Billers, 'Biller'),
      checkExistence(customer, Customers, 'Customer'),
      checkExistence(supplier, Supplier, 'Supplier'),
      checkExistence(tax, Tax, 'Tax')
    ]);

    if (req.file) {
      const image = await ImageGalleryModel.findOne({ url: quotations.attachDocument });
      if (image) {
        await deleteAttachment(image.public_id);
      }

      req.body.attachDocument = await attachDocumentToQuotations(req);
    }

    return await Quotations.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true
    });
  } catch (error: any) {
    throw new AppError(httpStatus.INTERNAL_SERVER_ERROR, error.message || 'Internal Server Error');
  }
};

export const deleteQuotations = async (id: string): Promise<void> => {
  try {
    const quotations = await Quotations.findById(id);
    if (!quotations) {
      throw new AppError(httpStatus.NOT_FOUND, 'Quotation not found');
    }

    const image = await ImageGalleryModel.findOne({ url: quotations.attachDocument });
    if (image) {
      await deleteAttachment(image.public_id);
    }

    await Quotations.findByIdAndDelete(id);
  } catch (error: any) {
    throw new AppError(httpStatus.INTERNAL_SERVER_ERROR, error.message || 'Internal Server Error');
  }
};

export const generateQuotationPdf = async (id: string) => {
  try {
    const quotation = (await Quotations.findById(id).populate('biller customer supplier')) as any;
    if (!quotation) {
      throw new AppError(httpStatus.NOT_FOUND, 'Quotation not found');
    }

    const storefront = await Storefront.findOne();
    if (!storefront) {
      throw new AppError(httpStatus.NOT_FOUND, 'Storefront not found');
    }

    // Render the EJS template to HTML
    const templatePath = path.join(__dirname, '../../templates/quotation-template.ejs');
    const htmlContent = await ejs.renderFile(templatePath, { quotation, storefront });

    // Launch Puppeteer and generate the PDF
    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    const page = await browser.newPage();
    await page.setContent(htmlContent, { waitUntil: 'networkidle0' });
    const pdfBuffer = await page.pdf({ format: 'A4' });
    await browser.close();

    return pdfBuffer;
  } catch (error: any) {
    throw new AppError(httpStatus.INTERNAL_SERVER_ERROR, error.message || 'Internal Server Error');
  }
};

export const quotationsService = {
  getAllQuotations,
  getQuotationsById,
  createQuotations,
  updateQuotations,
  deleteQuotations,
  generateQuotationPdf
};
