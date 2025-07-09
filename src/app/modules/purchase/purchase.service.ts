import Purchase from './purchase.model';
import { IPurchase } from './purchase.interface';
import QueryBuilder from '../../builder/QueryBuilder';
import httpStatus from 'http-status';
import AppError from '../../errors/AppError';
import { Request } from 'express';
import Product from '../product/product.model';
import Supplier from '../supplier/supplier.model';
import Tax from '../tax/tax.model';
import { FolderModel, ImageGalleryModel } from '../image-gallery/image-gallery.model';
import { UploadApiResponse } from 'cloudinary';
import { deleteAttachment, saveAttachment } from '../../utils/cloudinary';
import puppeteer from 'puppeteer';
import ejs from 'ejs';
import path from 'path';
import mongoose, { ClientSession } from 'mongoose';
import Storefront from '../storefront/storefront.model';

const attachDocumentToPurchase = async (req: Request) => {
  if (!req.file) return null;

  const folderName = 'PurchaseAttachments';
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

export const getAllPurchases = async (query: Record<string, unknown>): Promise<any> => {
  try {
    const purchaseQuery = new QueryBuilder(Purchase.find({}), query)
      .search(['reference'])
      .filter()
      .sort()
      .paginate()
      .fields();

    const meta = await purchaseQuery.countTotal();
    const result = await purchaseQuery.queryModel;

    return { meta, result };
  } catch (error: any) {
    throw new AppError(httpStatus.INTERNAL_SERVER_ERROR, error.message || 'Internal Server Error');
  }
};

export const getPurchaseById = async (id: string): Promise<IPurchase | null> => {
  try {
    const purchase = await Purchase.findById(id).populate('supplier orderTax');
    if (!purchase) {
      throw new AppError(httpStatus.NOT_FOUND, 'This purchase is not found');
    }
    return purchase;
  } catch (error: any) {
    throw new AppError(httpStatus.INTERNAL_SERVER_ERROR, error.message || 'Internal Server Error');
  }
};

export const createPurchase = async (req: Request): Promise<IPurchase | null> => {
  let session: ClientSession | null = null;

  try {
    const { items, supplier, orderTax } = req.body;

    // Start a session for transaction
    session = await mongoose.startSession();
    session.startTransaction();

    // Validate supplier and products
    await Promise.all([
      checkExistence(supplier, Supplier, 'Supplier'),
      ...items.map((item: any) => checkExistence(item.product_id, Product, 'Product')),
      orderTax && checkExistence(orderTax, Tax, 'Tax')
    ]);

    // Apply tax and discount to each item
    const updatedItems = await Promise.all(
      items.map(async (item: any) => {
        const product = (await Product.findById(item.product_id)
          .populate('productTax')
          .session(session)) as any;

        if (!product) {
          throw new AppError(httpStatus.NOT_FOUND, 'Product not found');
        }

        const tax = product?.productTax
          ? product.productTax.type === 'Fixed'
            ? product.productTax.rate
            : (product.productTax.rate / 100) * item.unit_price
          : 0;

        const discount = Number(item.discount) || 0;

        // Calculate sub_total
        item.sub_total = Number(item.unit_price) * Number(item.quantity) - discount + tax;
        item.tax = tax;
        item.discount = discount;

        return item;
      })
    );

    req.body.items = updatedItems;
    req.body.attachDocument = await attachDocumentToPurchase(req);

    // Increment the product quantity and stock value
    await Promise.all(
      items.map(async (item: any) => {
        const product = (await Product.findById(item.product_id).session(session)) as any;
        if (!product) {
          throw new AppError(httpStatus.NOT_FOUND, 'Product not found');
        }
        const quantity = Number(product.quantity) + Number(item.quantity);
        const stock = Number(product.quantity) + Number(item.quantity);

        // Update product fields
        product.quantity = quantity;
        product.stock = stock;

        // Save the updated product
        await product.save({ session });
      })
    );
    // Create the purchase
    const purchase = await Purchase.create([req.body], { session });

    // Commit the transaction
    await session.commitTransaction();
    session.endSession();

    return purchase[0];
  } catch (error: any) {
    if (session) {
      await session.abortTransaction();
      session.endSession();
    }
    throw new AppError(httpStatus.INTERNAL_SERVER_ERROR, error.message || 'Internal Server Error');
  }
};

export const updatePurchase = async (id: string, req: Request): Promise<IPurchase | null> => {
  try {
    const { items, supplier, orderTax } = req.body;

    const purchase = await Purchase.findById(id);
    if (!purchase) {
      throw new AppError(httpStatus.NOT_FOUND, 'This purchase does not exist');
    }

    // Check if supplier, products, and tax exist
    await Promise.all([
      checkExistence(supplier, Supplier, 'Supplier'),
      ...items.map((item: any) => checkExistence(item.product_id, Product, 'Product')),
      orderTax && checkExistence(orderTax, Tax, 'Tax')
    ]);

    if (req.file) {
      const image = await ImageGalleryModel.findOne({ url: purchase.attachDocument?.url });
      if (image) {
        await deleteAttachment(image.public_id);
      }

      req.body.attachDocument = await attachDocumentToPurchase(req);
    }

    return await Purchase.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true
    });
  } catch (error: any) {
    throw new AppError(httpStatus.INTERNAL_SERVER_ERROR, error.message || 'Internal Server Error');
  }
};

export const deletePurchase = async (id: string): Promise<void> => {
  try {
    const purchase = await Purchase.findById(id);
    if (!purchase) {
      throw new AppError(httpStatus.NOT_FOUND, 'This purchase is not found');
    }

    if (purchase.attachDocument?.url) {
      const image = await ImageGalleryModel.findOne({ url: purchase.attachDocument.url });
      if (image) {
        await deleteAttachment(image.public_id);
      }
    }

    await Purchase.findByIdAndDelete(id);
  } catch (error: any) {
    throw new AppError(httpStatus.INTERNAL_SERVER_ERROR, error.message || 'Internal Server Error');
  }
};

export const generatePurchasePdf = async (id: string): Promise<Buffer | null> => {
  try {
    const purchase = (await Purchase.findById(id).populate('supplier orderTax')) as any;
    if (!purchase) {
      throw new AppError(httpStatus.NOT_FOUND, 'Purchase not found');
    }

    const storefront = await Storefront.findOne();
    if (!storefront) {
      throw new AppError(httpStatus.NOT_FOUND, 'Storefront not found');
    }

    // Render the EJS template to HTML
    const templatePath = path.join(__dirname, '../../templates/purchase.ejs');
    const html = await ejs.renderFile(templatePath, { purchase, storefront });

    // Launch Puppeteer and generate the PDF
    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: 'networkidle0' });
    const pdfBuffer = await page.pdf({ format: 'A4' });
    await browser.close();

    return pdfBuffer;
  } catch (error: any) {
    throw new AppError(httpStatus.INTERNAL_SERVER_ERROR, error.message || 'Internal Server Error');
  }
};

export const purchaseService = {
  getAllPurchases,
  getPurchaseById,
  createPurchase,
  updatePurchase,
  deletePurchase,
  generatePurchasePdf
};
