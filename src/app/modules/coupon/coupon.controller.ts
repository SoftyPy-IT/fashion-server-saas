import { RequestHandler } from 'express';
import { couponService } from './coupon.service';
import httpStatus from 'http-status';
import sendResponse from '../../utils/sendResponse';
import catchAsync from '../../utils/catchAsync';

const getAllCoupon: RequestHandler = catchAsync(async (req, res) => {
  const result = await couponService.getAllCoupon(req.query);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: 'Coupon retrieved successfully',
    data: result.result,
    meta: result.meta
  });
});

const getCouponById: RequestHandler = catchAsync(async (req, res) => {
  const result = await couponService.getCouponById(req.params.id);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: 'Coupon retrieved successfully',
    data: result
  });
});

const createCoupon: RequestHandler = catchAsync(async (req, res) => {
  const result = await couponService.createCoupon(req);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.CREATED,
    message: 'Coupon created successfully',
    data: result
  });
});

const updateCoupon: RequestHandler = catchAsync(async (req, res) => {
  const result = await couponService.updateCoupon(req.params.id, req);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: 'Coupon updated successfully',
    data: result
  });
});

const deleteCoupon: RequestHandler = catchAsync(async (req, res) => {
  await couponService.deleteCoupon(req.params.id);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: 'Coupon deleted successfully',
    data: null
  });
});

const applyCoupon: RequestHandler = catchAsync(async (req, res) => {
  const result = await couponService.applyCoupon(req);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: 'Coupon applied successfully',
    data: result
  });
});

export const couponController = {
  getAllCoupon,
  getCouponById,
  createCoupon,
  updateCoupon,
  deleteCoupon,
  applyCoupon
};
