import { RequestHandler } from 'express';
import { variantService } from './variant.service';
import httpStatus from 'http-status';
import sendResponse from '../../utils/sendResponse';
import catchAsync from '../../utils/catchAsync';

const getAllVariant: RequestHandler = catchAsync(async (req, res) => {
  const result = await variantService.getAllVariant(req.query);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: 'Variant retrieved successfully',
    data: result.result,
    meta: result.meta
  });
});

const getVariantById: RequestHandler = catchAsync(async (req, res) => {
  const result = await variantService.getVariantById(req.params.id);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: 'Variant retrieved successfully',
    data: result
  });
});

const createVariant: RequestHandler = catchAsync(async (req, res) => {
  const result = await variantService.createVariant(req);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.CREATED,
    message: 'Variant created successfully',
    data: result
  });
});

const updateVariant: RequestHandler = catchAsync(async (req, res) => {
  const result = await variantService.updateVariant(req.params.id, req);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: 'Variant updated successfully',
    data: result
  });
});

const deleteVariant: RequestHandler = catchAsync(async (req, res) => {
  await variantService.deleteVariant(req.params.id);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: 'Variant deleted successfully',
    data: null
  });
});

export const variantController = {
  getAllVariant,
  getVariantById,
  createVariant,
  updateVariant,
  deleteVariant
};
