import { RequestHandler } from 'express';
import { CustomersService } from './Customers.service';
import httpStatus from 'http-status';
import sendResponse from '../../utils/sendResponse';
import catchAsync from '../../utils/catchAsync';

const getAllCustomers: RequestHandler = catchAsync(async (req, res) => {
  const result = await CustomersService.getAllCustomers(req.query);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: 'Customers retrieved successfully',
    data: result.result,
    meta: result.meta
  });
});

const getCustomersById: RequestHandler = catchAsync(async (req, res) => {
  const result = await CustomersService.getCustomerById(req.params.id);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: 'Customers retrieved successfully',
    data: result
  });
});

const createCustomers: RequestHandler = catchAsync(async (req, res) => {
  const result = await CustomersService.createCustomer(req);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.CREATED,
    message: 'Customers created successfully',
    data: result
  });
});

const updateCustomers: RequestHandler = catchAsync(async (req, res) => {
  const result = await CustomersService.updateCustomer(req.params.id, req);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: 'Customers updated successfully',
    data: result
  });
});

const deleteCustomers: RequestHandler = catchAsync(async (req, res) => {
  await CustomersService.deleteCustomer(req.params.id);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: 'Customers deleted successfully',
    data: null
  });
});

export const CustomersController = {
  getAllCustomers,
  getCustomersById,
  createCustomers,
  updateCustomers,
  deleteCustomers
};
