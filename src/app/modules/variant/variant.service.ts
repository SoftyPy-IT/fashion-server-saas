import Variant from './variant.model';
import { IVariant } from './variant.interface';
import QueryBuilder from '../../builder/QueryBuilder';
import httpStatus from 'http-status';
import AppError from '../../errors/AppError';
import { Request } from 'express';

export const getAllVariant = async (query: Record<string, unknown>): Promise<any> => {
  try {
    const variantSearchableFields = ['name'];

    const variantQuery = new QueryBuilder(
      Variant.find({
        isDeleted: false
      }),
      query
    )
      .search(variantSearchableFields)
      .filter()
      .sort()
      .paginate()
      .fields();

    const meta = await variantQuery.countTotal();
    const result = await variantQuery.queryModel;

    return { meta, result };
  } catch (error) {
    throw new AppError(httpStatus.INTERNAL_SERVER_ERROR, 'Internal Server Error');
  }
};

export const getVariantById = async (id: string): Promise<IVariant | null> => {
  try {
    const variant = await Variant.findOne({ _id: id, isDeleted: false });
    if (!variant) {
      throw new AppError(httpStatus.NOT_FOUND, 'This variant is not found');
    }
    return variant;
  } catch (error) {
    throw new AppError(httpStatus.INTERNAL_SERVER_ERROR, 'Internal Server Error');
  }
};

export const createVariant = async (req: Request): Promise<IVariant | null> => {
  try {
    const { name, items } = req.body;
    const variant = await Variant.findOne({ name, isDeleted: false });

    if (variant) {
      throw new AppError(
        httpStatus.BAD_REQUEST,
        'This variant already exists. Please choose another name'
      );
    }

    const result = await Variant.create({
      name,
      items
    });

    return result;
  } catch (error: any) {
    throw new AppError(httpStatus.INTERNAL_SERVER_ERROR, error.message || 'Internal Server Error');
  }
};

export const updateVariant = async (id: string, req: Request): Promise<IVariant | null> => {
  try {
    const variant = await Variant.findOne({ _id: id, isDeleted: false });
    if (!variant) {
      throw new AppError(httpStatus.NOT_FOUND, 'This variant does not exist');
    }

    const { name, items, ...remainingStudentData } = req.body;
    const modifiedUpdatedData: Record<string, unknown> = {
      ...remainingStudentData
    };

    if (name) {
      const variantName = await Variant.findOne({ name });
      if (variantName && variantName._id.toString() !== id) {
        throw new AppError(
          httpStatus.BAD_REQUEST,
          'This variant already exists. Please choose another name'
        );
      } else {
        modifiedUpdatedData.name = name;
      }
    }
    if (items) {
      modifiedUpdatedData.items = items;
    }

    const result = await Variant.findByIdAndUpdate(id, modifiedUpdatedData, {
      new: true,
      runValidators: true
    });

    return result;
  } catch (error: any) {
    throw new AppError(httpStatus.INTERNAL_SERVER_ERROR, error.message || 'Internal Server Error');
  }
};

export const deleteVariant = async (id: string): Promise<void | null> => {
  try {
    const variant = await Variant.findOne({ _id: id, isDeleted: false });
    if (!variant) {
      throw new AppError(httpStatus.NOT_FOUND, 'This variant is not found');
    }

    await Variant.findByIdAndUpdate(id, { isDeleted: true, deletedAt: new Date() }, { new: true });

    return null;
  } catch (error: any) {
    throw new AppError(httpStatus.INTERNAL_SERVER_ERROR, error.message || 'Internal Server Error');
  }
};

export const variantService = {
  getAllVariant,
  getVariantById,
  createVariant,
  updateVariant,
  deleteVariant
};
