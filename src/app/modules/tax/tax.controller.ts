import { RequestHandler } from 'express';
import { taxService } from './tax.service';
import httpStatus from 'http-status';
import sendResponse from '../../utils/sendResponse';
import catchAsync from '../../utils/catchAsync';

const getAllTax: RequestHandler = catchAsync(async (req, res) => {
  const result = await taxService.getAllTax(req.query);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: 'Tax retrieved successfully',
    data: result.result,
    meta: result.meta
  });
});

const getTaxById: RequestHandler = catchAsync(async (req, res) => {
  const result = await taxService.getTaxById(req.params.id);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: 'Tax retrieved successfully',
    data: result
  });
});

const createTax: RequestHandler = catchAsync(async (req, res) => {
  const result = await taxService.createTax(req);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.CREATED,
    message: 'Tax created successfully',
    data: result
  });
});

const updateTax: RequestHandler = catchAsync(async (req, res) => {
  const result = await taxService.updateTax(req.params.id, req);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: 'Tax updated successfully',
    data: result
  });
});

const deleteTax: RequestHandler = catchAsync(async (req, res) => {
  await taxService.deleteTax(req.params.id);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: 'Tax deleted successfully',
    data: null
  });
});

export const taxController = {
  getAllTax,
  getTaxById,
  createTax,
  updateTax,
  deleteTax
};
