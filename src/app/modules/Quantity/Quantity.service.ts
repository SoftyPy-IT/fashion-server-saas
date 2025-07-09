// file path: services/Quantity.service.ts

import Quantity from './Quantity.model';
import Product from '../product/product.model';
import { IQuantity } from './Quantity.interface';
import QueryBuilder from '../../builder/QueryBuilder';
import httpStatus from 'http-status';
import AppError from '../../errors/AppError';
import { Request } from 'express';
import { IProduct } from '../product/product.interface';
import { ObjectId, Types } from 'mongoose';
import { deleteAttachment, saveAttachment } from '../../utils/cloudinary';
import { UploadApiResponse } from 'cloudinary';
import { FolderModel, ImageGalleryModel } from '../image-gallery/image-gallery.model';

export const getAllQuantity = async (query: Record<string, unknown>): Promise<any> => {
  try {
    const QuantitySearchableFields = [
      'referenceNo',
      'products.productName',
      'products.productCode'
    ];

    const QuantityQuery = new QueryBuilder(Quantity.find(), query)
      .search(QuantitySearchableFields)
      .filter()
      .sort()
      .paginate()
      .fields();

    const meta = await QuantityQuery.countTotal();
    const result = await QuantityQuery.queryModel;

    return { meta, result };
  } catch (error: any) {
    throw new AppError(httpStatus.INTERNAL_SERVER_ERROR, error.message || 'Internal Server Error');
  }
};

export const getQuantityById = async (id: string): Promise<IQuantity | null> => {
  try {
    const result = await Quantity.findOne({ _id: id });
    if (!result) {
      throw new AppError(httpStatus.NOT_FOUND, 'This Quantity adjustment does not exist');
    }
    return result;
  } catch (error: any) {
    throw new AppError(httpStatus.INTERNAL_SERVER_ERROR, error.message || 'Internal Server Error');
  }
};

interface ProductStockAdjustment {
  productId: Types.ObjectId;
  type: 'Addition' | 'Subtraction';
  quantity: number;
  variantName?: string;
  variantValue?: string;
}

const adjustProductStock = async ({
  productId,
  type,
  quantity,
  variantName,
  variantValue
}: ProductStockAdjustment): Promise<void> => {
  const existingProduct = (await Product.findById(productId)) as any;

  if (!existingProduct) {
    throw new AppError(httpStatus.NOT_FOUND, `Product with id ${productId} not found`);
  }

  quantity = Number(quantity);

  // If variant information is provided and product has variants
  if (existingProduct.hasVariants && variantName && variantValue) {
    // Find the variant
    const variantIndex = existingProduct.variants.findIndex(
      (variant: any) => variant.name === variantName
    );

    if (variantIndex === -1) {
      throw new AppError(
        httpStatus.BAD_REQUEST,
        `Variant ${variantName} not found for product ${existingProduct.name}`
      );
    }

    // Find the specific variant value
    const valueIndex = existingProduct.variants[variantIndex].values.findIndex(
      (val: any) => val.name === variantValue || val.value === variantValue
    );

    if (valueIndex === -1) {
      throw new AppError(
        httpStatus.BAD_REQUEST,
        `Variant value ${variantValue} not found for variant ${variantName}`
      );
    }

    const currentVariantQuantity =
      existingProduct.variants[variantIndex].values[valueIndex].quantity;

    // Adjust variant-specific stock
    if (type === 'Addition') {
      existingProduct.variants[variantIndex].values[valueIndex].quantity =
        currentVariantQuantity + quantity;
    } else if (type === 'Subtraction') {
      if (currentVariantQuantity < quantity) {
        throw new AppError(
          httpStatus.BAD_REQUEST,
          `Insufficient stock for variant ${variantName}:${variantValue} of product ${existingProduct.name}`
        );
      }
      existingProduct.variants[variantIndex].values[valueIndex].quantity =
        currentVariantQuantity - quantity;
    }

    // Calculate total stock across all variants
    let totalVariantStock = 0;
    existingProduct.variants.forEach((variant: any) => {
      variant.values.forEach((value: any) => {
        totalVariantStock += value.quantity;
      });
    });

    // Update main product stock values
    existingProduct.stock = totalVariantStock;
    existingProduct.quantity = totalVariantStock;
  }
  // Handle regular product without variants
  else {
    const currentStock = Number(existingProduct.stock);
    const currentQuantity = Number(existingProduct.quantity);

    if (type === 'Addition') {
      existingProduct.stock = currentStock + quantity;
      existingProduct.quantity = currentQuantity + quantity;
    } else if (type === 'Subtraction') {
      if (currentStock < quantity) {
        throw new AppError(
          httpStatus.BAD_REQUEST,
          `Insufficient stock for product ${existingProduct.name}`
        );
      }
      existingProduct.stock = currentStock - quantity;
      existingProduct.quantity = currentQuantity - quantity;
    }
  }

  // Update stockout status
  // existingProduct.is_stockout = existingProduct.stock === 0;
  await existingProduct.save();
};

export const createQuantity = async (req: Request): Promise<IQuantity | null> => {
  try {
    const { products } = req.body;

    // Handle file upload if present
    if (req.file) {
      const folder = 'Attachments';
      const isFolderExist = await FolderModel.findOne({ name: folder });

      if (!isFolderExist) {
        await FolderModel.create({ name: folder });
      }

      const result = (await saveAttachment(req.file)) as UploadApiResponse;
      await ImageGalleryModel.create({
        folder: isFolderExist?._id,
        public_id: result.public_id,
        url: result.secure_url
      });

      req.body.attachDocument = result.secure_url;
    }

    // Process each product adjustment
    for (const product of products) {
      await adjustProductStock({
        productId: product.productId,
        type: product.type,
        quantity: product.quantity,
        variantName: product.variantName,
        variantValue: product.variantValue
      });
    }

    // Create the quantity record
    const result = await Quantity.create({
      ...req.body,
      products: products.map((product: any) => ({
        productId: product.productId,
        productName: product.productName,
        productCode: product.productCode,
        type: product.type,
        quantity: product.quantity,
        serialNumber: product.serialNumber,
        variant: {
          name: product.variantName,
          value: product.variantValue
        }
      }))
    });
    return result;
  } catch (error: any) {
    throw new AppError(httpStatus.INTERNAL_SERVER_ERROR, error.message || 'Internal Server Error');
  }
};

export const updateQuantity = async (id: string, req: Request): Promise<IQuantity | null> => {
  try {
    const quantityRecord = await Quantity.findOne({ _id: id });
    if (!quantityRecord) {
      throw new AppError(httpStatus.NOT_FOUND, 'This Quantity does not exist');
    }

    // // Reverse the previous quantity adjustments
    // for (const product of quantityRecord.products) {
    //   const { productId, type, quantity: qty } = product;

    //   await adjustProductStock(productId, type, qty);
    // }

    // Adjust the quantities of the new products
    // const { products } = req.body;
    // for (const product of products) {
    //   const { productId, type, quantity: qty } = product;
    //   await adjustProductStock(productId, type, qty);
    // }

    // Handle file attachment
    if (req.file) {
      // remove the previous attachment from cloudinary if it exists in the database, remove from cloudinary using public_id
      const image = await ImageGalleryModel.findOne({ url: quantityRecord.attachDocument });

      if (image) {
        await deleteAttachment(image.public_id);
      }

      const result = (await saveAttachment(req.file)) as UploadApiResponse;

      const folder = 'Attachments';

      const isFolderExist = await FolderModel.findOne({ name: folder });
      if (!isFolderExist) {
        await FolderModel.create({ name: folder });
      }

      await ImageGalleryModel.create({
        folder: isFolderExist?._id,
        public_id: result.public_id,
        url: result.secure_url
      });

      req.body.attachDocument = result.secure_url;
    }

    const { ...remainingQuantityData } = req.body;
    const modifiedUpdatedData: Record<string, unknown> = {
      ...remainingQuantityData
    };

    const result = await Quantity.findByIdAndUpdate(id, modifiedUpdatedData, {
      new: true,
      runValidators: true
    });

    return result;
  } catch (error: any) {
    throw new AppError(httpStatus.INTERNAL_SERVER_ERROR, error.message || 'Internal Server Error');
  }
};

export const deleteQuantity = async (id: string): Promise<void | null> => {
  try {
    const quantity = await Quantity.findOne({ _id: id });
    if (!quantity) {
      throw new AppError(httpStatus.NOT_FOUND, 'This Quantity adjustment does not exist');
    }

    // Reverse the quantity adjustments
    for (const product of quantity.products) {
      const { productId, type, quantity } = product;
      const existingProduct = await Product.findById(productId);
      if (!existingProduct) {
        throw new AppError(httpStatus.NOT_FOUND, `Product with id ${productId} not found`);
      }
      if (type === 'Addition') {
        existingProduct.stock -= quantity;
      } else if (type === 'Subtraction') {
        existingProduct.stock += quantity;
      }
      await existingProduct.save();
    }

    await Quantity.findByIdAndDelete(id);

    return null;
  } catch (error: any) {
    throw new AppError(httpStatus.INTERNAL_SERVER_ERROR, error.message || 'Internal Server Error');
  }
};

export const QuantityService = {
  getAllQuantity,
  getQuantityById,
  createQuantity,
  updateQuantity,
  deleteQuantity
};
