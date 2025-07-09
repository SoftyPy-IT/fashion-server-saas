import { RequestHandler } from 'express';
import { storefrontService } from './storefront.service';
import httpStatus from 'http-status';
import sendResponse from '../../utils/sendResponse';
import catchAsync from '../../utils/catchAsync';

const getAllStorefront: RequestHandler = catchAsync(async (req, res) => {
  const result = await storefrontService.getAllStorefront();

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: 'Storefront retrieved successfully',
    data: result
  });
});

const updateStorefront: RequestHandler = catchAsync(async (req, res) => {
  const result = await storefrontService.updateStorefront(req.params.id, req);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: 'Storefront updated successfully',
    data: result
  });
});

const manageBanners: RequestHandler = catchAsync(async (req, res) => {
  const result = await storefrontService.manageSliders(req.params.id, req);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: 'Banners managed successfully',
    data: result
  });
});

export const storefrontController = {
  getAllStorefront,
  updateStorefront,
  manageBanners
};
