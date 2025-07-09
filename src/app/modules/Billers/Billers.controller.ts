import { RequestHandler } from 'express';
import { BillersService } from './Billers.service';
import httpStatus from 'http-status';
import sendResponse from '../../utils/sendResponse';
import catchAsync from '../../utils/catchAsync';

const getAllBillers: RequestHandler = catchAsync(async (req, res) => {
  const result = await BillersService.getAllBillers(req.query);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: 'Billers retrieved successfully',
    data: result.result,
    meta: result.meta
  });
});

const getBillersById: RequestHandler = catchAsync(async (req, res) => {
  const result = await BillersService.getBillerById(req.params.id);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: 'Billers retrieved successfully',
    data: result
  });
});

const createBillers: RequestHandler = catchAsync(async (req, res) => {
  const result = await BillersService.createBiller(req);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.CREATED,
    message: 'Billers created successfully',
    data: result
  });
});

const updateBillers: RequestHandler = catchAsync(async (req, res) => {
  const result = await BillersService.updateBiller(req.params.id, req);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: 'Billers updated successfully',
    data: result
  });
});

const deleteBillers: RequestHandler = catchAsync(async (req, res) => {
  await BillersService.deleteBiller(req.params.id);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: 'Billers deleted successfully',
    data: null
  });
});

export const BillersController = {
  getAllBillers,
  getBillersById,
  createBillers,
  updateBillers,
  deleteBillers
};
