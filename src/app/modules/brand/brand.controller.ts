import { RequestHandler } from 'express';
import { brandService } from './brand.service';
import httpStatus from 'http-status';
import sendResponse from '../../utils/sendResponse';
import catchAsync from '../../utils/catchAsync';

const getAllBrand: RequestHandler = catchAsync(async (req, res) => {
  const result = await brandService.getAllBrand(req.query);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: 'Brand retrieved successfully',
    meta: result.meta,
    data: result.result
  });
});

const getBrandById: RequestHandler = catchAsync(async (req, res) => {
  const result = await brandService.getBrandById(req.params.id);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: 'Brand retrieved successfully',
    data: result
  });
});

const createBrand: RequestHandler = catchAsync(async (req, res) => {
  const result = await brandService.createBrand(req);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.CREATED,
    message: 'Brand created successfully',
    data: result
  });
});

const updateBrand: RequestHandler = catchAsync(async (req, res) => {
  const result = await brandService.updateBrand(req.params.id, req);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: 'Brand updated successfully',
    data: result
  });
});

const deleteBrand: RequestHandler = catchAsync(async (req, res) => {
  await brandService.deleteBrand(req.params.id);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: 'Brand deleted successfully',
    data: null
  });
});

export const brandController = {
  getAllBrand,
  getBrandById,
  createBrand,
  updateBrand,
  deleteBrand
};
