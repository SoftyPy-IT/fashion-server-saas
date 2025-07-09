
import { RequestHandler} from 'express';
import { supplierService } from './supplier.service';
import httpStatus from 'http-status';
import sendResponse from '../../utils/sendResponse';
import catchAsync from '../../utils/catchAsync';

const getAllSupplier: RequestHandler = catchAsync(async (req, res) => {
  const result = await supplierService.getAllSupplier(req.query); 

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: 'Supplier retrieved successfully',
    data: result.result,
    meta: result.meta
  });
});

const getSupplierById: RequestHandler = catchAsync(async (req, res) => {
  const result = await supplierService.getSupplierById(req.params.id); 

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: 'Supplier retrieved successfully',
    data: result
  });
});

const createSupplier: RequestHandler = catchAsync(async (req, res) => {
  const result = await supplierService.createSupplier(req); 

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.CREATED,
    message: 'Supplier created successfully',
    data: result
  });
});

const updateSupplier: RequestHandler = catchAsync(async (req, res) => {
  const result = await supplierService.updateSupplier(req.params.id, req); 

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: 'Supplier updated successfully',
    data: result
  });
});

const deleteSupplier: RequestHandler = catchAsync(async (req, res) => {
  await supplierService.deleteSupplier(req.params.id); 

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: 'Supplier deleted successfully',
    data: null
  });
});

export const supplierController = {
  getAllSupplier,
  getSupplierById,
  createSupplier,
  updateSupplier,
  deleteSupplier
};
