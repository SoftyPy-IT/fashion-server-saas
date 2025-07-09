import QueryBuilder from '../../builder/QueryBuilder';
import httpStatus from 'http-status';
import AppError from '../../errors/AppError';
import { Request } from 'express';
import Billers from './Billers.model';
import { IBillers } from './Billers.interface';

export const getAllBillers = async (query: Record<string, unknown>): Promise<any> => {
  try {
    const billerSearchableFields = ['name'];

    const billerQuery = new QueryBuilder(
      Billers.find({
        isDeleted: false
      }),
      query
    )
      .search(billerSearchableFields)
      .filter()
      .sort()
      .paginate()
      .fields();

    const meta = await billerQuery.countTotal();
    const result = await billerQuery.queryModel;

    return { meta, result };
  } catch (error: any) {
    throw new AppError(httpStatus.INTERNAL_SERVER_ERROR, error.message || 'Internal Server Error');
  }
};

export const getBillerById = async (id: string): Promise<IBillers | null> => {
  try {
    const biller = await Billers.findOne({ _id: id, isDeleted: false });
    if (!biller) {
      throw new AppError(httpStatus.NOT_FOUND, 'This biller is not found');
    }
    return biller;
  } catch (error: any) {
    throw new AppError(httpStatus.INTERNAL_SERVER_ERROR, error.message || 'Internal Server Error');
  }
};

export const createBiller = async (req: Request): Promise<IBillers | null> => {
  try {
    const { name, email, phone } = req.body;
    const billerExists = await Billers.findOne({
      name,
      email,
      phone,
      isDeleted: false
    });

    if (billerExists) {
      throw new AppError(httpStatus.BAD_REQUEST, 'This biller already exists');
    }

    const result = await Billers.create(req.body);
    return result;
  } catch (error: any) {
    throw new AppError(httpStatus.INTERNAL_SERVER_ERROR, error.message || 'Internal Server Error');
  }
};

export const updateBiller = async (id: string, req: Request): Promise<IBillers | null> => {
  try {
    const biller = await Billers.findOne({ _id: id, isDeleted: false });
    if (!biller) {
      throw new AppError(httpStatus.NOT_FOUND, 'This biller does not exist');
    }

    const modifiedUpdatedData = { ...req.body, updatedAt: new Date() };

    const result = await Billers.findByIdAndUpdate(id, modifiedUpdatedData, {
      new: true,
      runValidators: true
    });

    return result;
  } catch (error: any) {
    throw new AppError(httpStatus.INTERNAL_SERVER_ERROR, error.message || 'Internal Server Error');
  }
};

export const deleteBiller = async (id: string): Promise<void | null> => {
  try {
    const biller = await Billers.findOne({ _id: id, isDeleted: false });
    if (!biller) {
      throw new AppError(httpStatus.NOT_FOUND, 'This biller is not found');
    }

    await Billers.findByIdAndUpdate(id, { isDeleted: true, deletedAt: new Date() }, { new: true });

    return null;
  } catch (error: any) {
    throw new AppError(httpStatus.INTERNAL_SERVER_ERROR, error.message || 'Internal Server Error');
  }
};

export const BillersService = {
  getAllBillers,
  getBillerById,
  createBiller,
  updateBiller,
  deleteBiller
};
