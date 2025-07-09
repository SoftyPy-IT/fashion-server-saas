import Customer from './Customers.model';
import { ICustomers } from './Customers.interface';
import QueryBuilder from '../../builder/QueryBuilder';
import httpStatus from 'http-status';
import AppError from '../../errors/AppError';
import { Request } from 'express';

export const getAllCustomers = async (query: Record<string, unknown>): Promise<any> => {
  try {
    const searchableFields = ['name', 'email', 'phone'];

    const customerQuery = new QueryBuilder(Customer.find({ isDeleted: false }), query)
      .search(searchableFields)
      .filter()
      .sort()
      .paginate()
      .fields();

    const meta = await customerQuery.countTotal();
    const result = await customerQuery.queryModel;

    return { meta, result };
  } catch (error: any) {
    throw new AppError(httpStatus.INTERNAL_SERVER_ERROR, error.message || 'Internal Server Error');
  }
};

export const getCustomerById = async (id: string): Promise<ICustomers | null> => {
  try {
    const customer = await Customer.findOne({ _id: id, isDeleted: false });
    if (!customer) {
      throw new AppError(httpStatus.NOT_FOUND, 'This customer is not found');
    }
    return customer;
  } catch (error: any) {
    throw new AppError(httpStatus.INTERNAL_SERVER_ERROR, error.message || 'Internal Server Error');
  }
};

export const createCustomer = async (req: Request): Promise<ICustomers | null> => {
  try {
    const { email } = req.body;
    const customerExists = await Customer.findOne({
      email,
      isDeleted: false
    });

    if (customerExists) {
      throw new AppError(httpStatus.BAD_REQUEST, 'This customer already exists');
    }

    const result = await Customer.create(req.body);
    return result;
  } catch (error: any) {
    throw new AppError(httpStatus.INTERNAL_SERVER_ERROR, error.message || 'Internal Server Error');
  }
};

export const updateCustomer = async (id: string, req: Request): Promise<ICustomers | null> => {
  try {
    const customer = await Customer.findOne({ _id: id, isDeleted: false });
    if (!customer) {
      throw new AppError(httpStatus.NOT_FOUND, 'This customer does not exist');
    }

    const updatedData = { ...req.body, updatedAt: new Date() };

    const result = await Customer.findByIdAndUpdate(id, updatedData, {
      new: true,
      runValidators: true
    });

    return result;
  } catch (error: any) {
    throw new AppError(httpStatus.INTERNAL_SERVER_ERROR, error.message || 'Internal Server Error');
  }
};

export const deleteCustomer = async (id: string): Promise<void | null> => {
  try {
    const customer = await Customer.findOne({ _id: id, isDeleted: false });
    if (!customer) {
      throw new AppError(httpStatus.NOT_FOUND, 'This customer is not found');
    }

    await Customer.findByIdAndUpdate(id, { isDeleted: true, deletedAt: new Date() }, { new: true });

    return null;
  } catch (error: any) {
    throw new AppError(httpStatus.INTERNAL_SERVER_ERROR, error.message || 'Internal Server Error');
  }
};

export const CustomersService = {
  getAllCustomers,
  getCustomerById,
  createCustomer,
  updateCustomer,
  deleteCustomer
};
