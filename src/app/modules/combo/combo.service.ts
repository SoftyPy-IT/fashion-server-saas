import Combo from './combo.model';
import { ICombo } from './combo.interface';
import QueryBuilder from '../../builder/QueryBuilder';
import httpStatus from 'http-status';
import AppError from '../../errors/AppError';
import { Request } from 'express';
import Product from '../product/product.model';
import mongoose from 'mongoose';

export const getAllCombo = async (query: Record<string, unknown>): Promise<any> => {
  try {
    const comboSearchableFields = ['name'];

    const comboQuery = new QueryBuilder(
      Combo.find({
        isDeleted: false
      }).populate([
        {
          path: 'items',
          populate: {
            path: 'category',
            populate: {
              path: 'subCategories mainCategory',
              select: 'name'
            }
          }
        }
      ]),

      query
    )
      .search(comboSearchableFields)
      .filter()
      .sort()
      .paginate()
      .fields();

    const meta = await comboQuery.countTotal();
    const result = await comboQuery.queryModel;

    return { meta, result };
  } catch (error: any) {
    throw new AppError(httpStatus.INTERNAL_SERVER_ERROR, error.message || 'Internal Server Error');
  }
};

export const getComboById = async (id: string): Promise<ICombo | null> => {
  const isValidObjectId = mongoose.Types.ObjectId.isValid(id);
  const queryCondition = isValidObjectId ? { _id: id } : { slug: id };

  try {
    const combo = await Combo.findOne({ ...queryCondition, isDeleted: false }).populate([
      {
        path: 'items',
        populate: [
          {
            path: 'category',
            select: 'name'
          },
          {
            path: 'mainCategory',
            select: 'name'
          },
          {
            path: 'subCategory',
            select: 'name'
          }
        ]
      }
    ]);

    if (!combo) {
      throw new AppError(httpStatus.NOT_FOUND, 'This combo is not found');
    }
    return combo;
  } catch (error: any) {
    throw new AppError(httpStatus.INTERNAL_SERVER_ERROR, error.message || 'Internal Server Error');
  }
};

export const createCombo = async (req: Request): Promise<ICombo | null> => {
  try {
    const { items } = req.body;

    // Check if all product IDs exist
    await Promise.all(
      items.map(async (productId: string) => {
        const product = await Product.findOne({ _id: productId, isDeleted: false });
        if (!product) {
          throw new AppError(httpStatus.NOT_FOUND, `Product with ID ${productId} does not exist`);
        }
      })
    );

    const result = await Combo.create({
      ...req.body,
      slug: req.body.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')
    });
    return result;
  } catch (error: any) {
    throw new AppError(httpStatus.INTERNAL_SERVER_ERROR, error.message || 'Internal Server Error');
  }
};

export const updateCombo = async (id: string, req: Request): Promise<ICombo | null> => {
  try {
    const combo = await Combo.findOne({ _id: id, isDeleted: false });
    if (!combo) {
      throw new AppError(httpStatus.NOT_FOUND, 'This combo does not exist');
    }

    const { ...remainingStudentData } = req.body;
    const modifiedUpdatedData: Record<string, unknown> = {
      ...remainingStudentData
    };

    const result = await Combo.findByIdAndUpdate(id, modifiedUpdatedData, {
      new: true,
      runValidators: true
    });

    return result;
  } catch (error: any) {
    throw new AppError(httpStatus.INTERNAL_SERVER_ERROR, error.message || 'Internal Server Error');
  }
};

export const deleteCombo = async (id: string): Promise<void | null> => {
  try {
    const combo = await Combo.findOne({ _id: id });
    if (!combo) {
      throw new AppError(httpStatus.NOT_FOUND, 'This combo is not found');
    }

    await Combo.findByIdAndDelete(id);

    return null;
  } catch (error: any) {
    throw new AppError(httpStatus.INTERNAL_SERVER_ERROR, error.message || 'Internal Server Error');
  }
};

export const comboService = {
  getAllCombo,
  getComboById,
  createCombo,
  updateCombo,
  deleteCombo
};
