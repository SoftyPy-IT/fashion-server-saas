
import { RequestHandler} from 'express';
import { QuantityService } from './Quantity.service';
import httpStatus from 'http-status';
import sendResponse from '../../utils/sendResponse';
import catchAsync from '../../utils/catchAsync';

const getAllQuantity: RequestHandler = catchAsync(async (req, res) => {
  const result = await QuantityService.getAllQuantity(req.query); 

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: 'Quantity retrieved successfully',
    data: result.result,
    meta: result.meta
  });
});

const getQuantityById: RequestHandler = catchAsync(async (req, res) => {
  const result = await QuantityService.getQuantityById(req.params.id); 

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: 'Quantity retrieved successfully',
    data: result
  });
});

const createQuantity: RequestHandler = catchAsync(async (req, res) => {
  const result = await QuantityService.createQuantity(req); 

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.CREATED,
    message: 'Quantity created successfully',
    data: result
  });
});

const updateQuantity: RequestHandler = catchAsync(async (req, res) => {
  const result = await QuantityService.updateQuantity(req.params.id, req); 

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: 'Quantity updated successfully',
    data: result
  });
});

const deleteQuantity: RequestHandler = catchAsync(async (req, res) => {
  await QuantityService.deleteQuantity(req.params.id); 

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: 'Quantity deleted successfully',
    data: null
  });
});

export const QuantityController = {
  getAllQuantity,
  getQuantityById,
  createQuantity,
  updateQuantity,
  deleteQuantity
};
