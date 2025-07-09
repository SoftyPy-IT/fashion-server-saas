import { RequestHandler } from 'express';
import { unitService } from './unit.service';
import httpStatus from 'http-status';
import sendResponse from '../../utils/sendResponse';
import catchAsync from '../../utils/catchAsync';

const getAllUnit: RequestHandler = catchAsync(async (req, res) => {
  const result = await unitService.getAllUnit(req.query);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: 'Unit retrieved successfully',
    data: result.result,
    meta: result.meta
  });
});

const getUnitById: RequestHandler = catchAsync(async (req, res) => {
  const result = await unitService.getUnitById(req.params.id);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: 'Unit retrieved successfully',
    data: result
  });
});

const createUnit: RequestHandler = catchAsync(async (req, res) => {
  const result = await unitService.createUnit(req);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.CREATED,
    message: 'Unit created successfully',
    data: result
  });
});

const updateUnit: RequestHandler = catchAsync(async (req, res) => {
  const result = await unitService.updateUnit(req.params.id, req);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: 'Unit updated successfully',
    data: result
  });
});

const deleteUnit: RequestHandler = catchAsync(async (req, res) => {
  await unitService.deleteUnit(req.params.id);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: 'Unit deleted successfully',
    data: null
  });
});

export const unitController = {
  getAllUnit,
  getUnitById,
  createUnit,
  updateUnit,
  deleteUnit
};
