import Supplier from './supplier.model';
import { ISupplier } from './supplier.interface';
import QueryBuilder from '../../builder/QueryBuilder';
import httpStatus from 'http-status';
import AppError from '../../errors/AppError';
import { Request } from 'express';

export const getAllSupplier = async (query: Record<string, unknown>): Promise<any> => {
  try {
    const supplierSearchableFields = ['name'];

    const supplierQuery = new QueryBuilder(
      Supplier.find({
        isDeleted: false
      }),
      query
    )
      .search(supplierSearchableFields)
      .filter()
      .sort()
      .paginate()
      .fields();

    const meta = await supplierQuery.countTotal();
    const result = await supplierQuery.queryModel;

    return { meta, result };
  } catch (error: any) {
    throw new AppError(httpStatus.INTERNAL_SERVER_ERROR, error.message || 'Internal Server Error');
  }
};

export const getSupplierById = async (id: string): Promise<ISupplier | null> => {
  try {
    const supplier = await Supplier.findOne({ _id: id, isDeleted: false });
    if (!supplier) {
      throw new AppError(httpStatus.NOT_FOUND, 'This supplier is not found');
    }
    return supplier;
  } catch (error: any) {
    throw new AppError(httpStatus.INTERNAL_SERVER_ERROR, error.message || 'Internal Server Error');
  }
};

export const createSupplier = async (req: Request): Promise<ISupplier | null> => {
  try {
    const { name, email, phone } = req.body;
    const supplierExists = await Supplier.findOne({
      name,
      email,
      phone,
      isDeleted: false
    });

    if (supplierExists) {
      throw new AppError(httpStatus.BAD_REQUEST, 'This supplier already exists');
    }

    const result = await Supplier.create(req.body);
    return result;
  } catch (error: any) {
    throw new AppError(httpStatus.INTERNAL_SERVER_ERROR, error.message || 'Internal Server Error');
  }
};

export const updateSupplier = async (id: string, req: Request): Promise<ISupplier | null> => {
  try {
    const supplier = await Supplier.findOne({ _id: id, isDeleted: false });
    if (!supplier) {
      throw new AppError(httpStatus.NOT_FOUND, 'This supplier does not exist');
    }

    const modifiedUpdatedData = { ...req.body, updatedAt: new Date() };

    const result = await Supplier.findByIdAndUpdate(id, modifiedUpdatedData, {
      new: true,
      runValidators: true
    });

    return result;
  } catch (error: any) {
    throw new AppError(httpStatus.INTERNAL_SERVER_ERROR, error.message || 'Internal Server Error');
  }
};

export const deleteSupplier = async (id: string): Promise<void | null> => {
  try {
    const supplier = await Supplier.findOne({ _id: id, isDeleted: false });
    if (!supplier) {
      throw new AppError(httpStatus.NOT_FOUND, 'This supplier is not found');
    }

    await Supplier.findByIdAndUpdate(id, { isDeleted: true, deletedAt: new Date() }, { new: true });

    return null;
  } catch (error: any) {
    throw new AppError(httpStatus.INTERNAL_SERVER_ERROR, error.message || 'Internal Server Error');
  }
};

export const supplierService = {
  getAllSupplier,
  getSupplierById,
  createSupplier,
  updateSupplier,
  deleteSupplier
};
