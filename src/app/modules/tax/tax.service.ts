import Tax from './tax.model';
import { ITax } from './tax.interface';
import QueryBuilder from '../../builder/QueryBuilder';
import httpStatus from 'http-status';
import AppError from '../../errors/AppError';
import { Request } from 'express';

export const getAllTax = async (query: Record<string, unknown>): Promise<any> => {
  try {
    const taxSearchableFields = ['name'];

    const taxQuery = new QueryBuilder(
      Tax.find({
        isDeleted: false
      }),
      query
    )
      .search(taxSearchableFields)
      .filter()
      .sort()
      .paginate()
      .fields();

    const meta = await taxQuery.countTotal();
    const result = await taxQuery.queryModel;

    return { meta, result };
  } catch (error: any) {
    throw new AppError(httpStatus.INTERNAL_SERVER_ERROR, error.message || 'Internal Server Error');
  }
};

export const getTaxById = async (id: string): Promise<ITax | null> => {
  try {
    const tax = await Tax.findOne({ _id: id, isDeleted: false });
    if (!tax) {
      throw new AppError(httpStatus.NOT_FOUND, 'This tax is not found');
    }
    return tax;
  } catch (error: any) {
    throw new AppError(httpStatus.INTERNAL_SERVER_ERROR, error.message || 'Internal Server Error');
  }
};

export const createTax = async (req: Request): Promise<ITax | null> => {
  try {
    const { code, name } = req.body;
    const isTaxExist = await Tax.findOne({
      code,
      name,
      isDeleted: false
    });
    if (isTaxExist) {
      throw new AppError(httpStatus.CONFLICT, 'This tax already exists');
    }

    const result = await Tax.create(req.body);
    return result;
  } catch (error: any) {
    throw new AppError(httpStatus.INTERNAL_SERVER_ERROR, error.message || 'Internal Server Error');
  }
};

export const updateTax = async (id: string, req: Request): Promise<ITax | null> => {
  try {
    const tax = await Tax.findOne({ _id: id, isDeleted: false });
    if (!tax) {
      throw new AppError(httpStatus.NOT_FOUND, 'Tax not found');
    }

    const updatedTax = await Tax.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true
    });

    if (!updatedTax) {
      throw new AppError(httpStatus.INTERNAL_SERVER_ERROR, 'Error updating tax');
    }

    return updatedTax;
  } catch (error: any) {
    throw new AppError(
      error.status || httpStatus.INTERNAL_SERVER_ERROR,
      error.message || 'Internal Server Error'
    );
  }
};

export const deleteTax = async (id: string): Promise<void | null> => {
  try {
    const tax = await Tax.findOne({ _id: id, isDeleted: false });
    if (!tax) {
      throw new AppError(httpStatus.NOT_FOUND, 'This tax is not found');
    }

    await Tax.findByIdAndUpdate(id, { isDeleted: true, deletedAt: new Date() }, { new: true });

    return null;
  } catch (error: any) {
    throw new AppError(httpStatus.INTERNAL_SERVER_ERROR, error.message || 'Internal Server Error');
  }
};

export const taxService = {
  getAllTax,
  getTaxById,
  createTax,
  updateTax,
  deleteTax
};
