import { RequestHandler } from 'express';
import { purchaseService } from './purchase.service';
import httpStatus from 'http-status';
import sendResponse from '../../utils/sendResponse';
import catchAsync from '../../utils/catchAsync';

const getAllPurchase: RequestHandler = catchAsync(async (req, res) => {
  const result = await purchaseService.getAllPurchases(req.query);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: 'Purchase retrieved successfully',
    data: result.result,
    meta: result.meta
  });
});

const getPurchaseById: RequestHandler = catchAsync(async (req, res) => {
  const result = await purchaseService.getPurchaseById(req.params.id);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: 'Purchase retrieved successfully',
    data: result
  });
});

const createPurchase: RequestHandler = catchAsync(async (req, res) => {
  const result = await purchaseService.createPurchase(req);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.CREATED,
    message: 'Purchase created successfully',
    data: result
  });
});

const updatePurchase: RequestHandler = catchAsync(async (req, res) => {
  const result = await purchaseService.updatePurchase(req.params.id, req);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: 'Purchase updated successfully',
    data: result
  });
});

const deletePurchase: RequestHandler = catchAsync(async (req, res) => {
  await purchaseService.deletePurchase(req.params.id);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: 'Purchase deleted successfully',
    data: null
  });
});

const generatePurchasePdf: RequestHandler = catchAsync(async (req, res) => {
  const result = await purchaseService.generatePurchasePdf(req.params.id);

  res.set({
    'Content-Type': 'application/pdf',
    'Content-Disposition': `attachment; filename="quotation-${req.params.id}.pdf"`
  });
  res.send(result);
});

export const purchaseController = {
  getAllPurchase,
  getPurchaseById,
  createPurchase,
  updatePurchase,
  deletePurchase,
  generatePurchasePdf
};
