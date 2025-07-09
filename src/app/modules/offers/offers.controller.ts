import { RequestHandler } from 'express';
import { offersService } from './offers.service';
import httpStatus from 'http-status';
import sendResponse from '../../utils/sendResponse';
import catchAsync from '../../utils/catchAsync';

const getAllOffers: RequestHandler = catchAsync(async (req, res) => {
  const result = await offersService.getAllOffers(req.query);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: 'Offers retrieved successfully',
    data: result.result,
    meta: result.meta
  });
});

const getAllOffersProducts: RequestHandler = catchAsync(async (req, res) => {
  const result = await offersService.getOffersProducts(req.query);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: 'Offers products retrieved successfully',
    data: result.result,
    meta: result.meta
  });
});

const getOffersById: RequestHandler = catchAsync(async (req, res) => {
  const result = await offersService.getOffersById(req);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: 'Offers retrieved successfully',
    data: result
  });
});

const createOffers: RequestHandler = catchAsync(async (req, res) => {
  const result = await offersService.createOffers(req);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.CREATED,
    message: 'Offers created successfully',
    data: result
  });
});

const updateOffers: RequestHandler = catchAsync(async (req, res) => {
  const result = await offersService.updateOffers(req.params.id, req);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: 'Offers updated successfully',
    data: result
  });
});

const deleteOffers: RequestHandler = catchAsync(async (req, res) => {
  await offersService.deleteOffers(req.params.id);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: 'Offers deleted successfully',
    data: null
  });
});

export const offersController = {
  getAllOffers,
  getOffersById,
  createOffers,
  updateOffers,
  deleteOffers,
  getAllOffersProducts
};
