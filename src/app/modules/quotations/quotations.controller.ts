import { RequestHandler } from 'express';
import { quotationsService } from './quotations.service';
import httpStatus from 'http-status';
import sendResponse from '../../utils/sendResponse';
import catchAsync from '../../utils/catchAsync';

const getAllQuotations: RequestHandler = catchAsync(async (req, res) => {
  const result = await quotationsService.getAllQuotations(req.query);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: 'Quotations retrieved successfully',
    data: result.result,
    meta: result.meta
  });
});

const getQuotationsById: RequestHandler = catchAsync(async (req, res) => {
  const result = await quotationsService.getQuotationsById(req.params.id);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: 'Quotations retrieved successfully',
    data: result
  });
});

const createQuotations: RequestHandler = catchAsync(async (req, res) => {
  const result = await quotationsService.createQuotations(req);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.CREATED,
    message: 'Quotations created successfully',
    data: result
  });
});

const updateQuotations: RequestHandler = catchAsync(async (req, res) => {
  const result = await quotationsService.updateQuotations(req.params.id, req);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: 'Quotations updated successfully',
    data: result
  });
});

const deleteQuotations: RequestHandler = catchAsync(async (req, res) => {
  await quotationsService.deleteQuotations(req.params.id);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: 'Quotations deleted successfully',
    data: null
  });
});

const generateQuotationPdf: RequestHandler = catchAsync(async (req, res) => {
  const result = await quotationsService.generateQuotationPdf(req.params.id);

  res.set({
    'Content-Type': 'application/pdf',
    'Content-Disposition': `attachment; filename="quotation-${req.params.id}.pdf"`
  });
  res.send(result);
});

export const quotationsController = {
  getAllQuotations,
  getQuotationsById,
  createQuotations,
  updateQuotations,
  deleteQuotations,
  generateQuotationPdf
};
