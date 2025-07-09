import { RequestHandler } from 'express';
import { reviewService } from './review.service';
import httpStatus from 'http-status';
import sendResponse from '../../utils/sendResponse';
import catchAsync from '../../utils/catchAsync';

const getAllReviews: RequestHandler = catchAsync(async (req, res) => {
  const result = await reviewService.getAllReviews(req.query);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: 'Reviews retrieved successfully',
    data: result.result,
    meta: result.meta
  });
});

const getReviewById: RequestHandler = catchAsync(async (req, res) => {
  const result = await reviewService.getReviewById(req.params.id);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: 'Review retrieved successfully',
    data: result
  });
});

const createReview: RequestHandler = catchAsync(async (req, res) => {
  const result = await reviewService.createReview(req);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.CREATED,
    message: 'Review created successfully',
    data: result
  });
});

const updateReview: RequestHandler = catchAsync(async (req, res) => {
  const result = await reviewService.updateReview(req.params.id, req);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: 'Review updated successfully',
    data: result
  });
});

const deleteReview: RequestHandler = catchAsync(async (req, res) => {
  await reviewService.deleteReview(req.params.id);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: 'Review deleted successfully',
    data: null
  });
});

const hideReview: RequestHandler = catchAsync(async (req, res) => {
  const result = await reviewService.hideReview(req.params.id, req.body.isHidden);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: 'Review visibility updated successfully',
    data: result
  });
});

const addReply: RequestHandler = catchAsync(async (req, res) => {
  const result = await reviewService.addReply(req.params.id, req);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.CREATED,
    message: 'Reply added successfully',
    data: result
  });
});

const hideReply: RequestHandler = catchAsync(async (req, res) => {
  const result = await reviewService.hideReply(
    req.params.reviewId,
    req.params.replyId,
    req.body.isHidden
  );

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: 'Reply visibility updated successfully',
    data: result
  });
});

const deleteReply: RequestHandler = catchAsync(async (req, res) => {
  const result = await reviewService.deleteReply(req.params.reviewId, req.params.replyId);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: 'Reply deleted successfully',
    data: result
  });
});

export const reviewController = {
  getAllReviews,
  getReviewById,
  createReview,
  updateReview,
  deleteReview,
  hideReview,
  addReply,
  hideReply,
  deleteReply
};
