
import { RequestHandler} from 'express';
import { StockService } from './Stock.service';
import httpStatus from 'http-status';
import sendResponse from '../../utils/sendResponse';
import catchAsync from '../../utils/catchAsync';

const getAllStock: RequestHandler = catchAsync(async (req, res) => {
  const result = await StockService.getAllStock(req.query); 

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: 'Stock retrieved successfully',
    data: result.result,
    meta: result.meta
  });
});

const getStockById: RequestHandler = catchAsync(async (req, res) => {
  const result = await StockService.getStockById(req.params.id); 

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: 'Stock retrieved successfully',
    data: result
  });
});

const createStock: RequestHandler = catchAsync(async (req, res) => {
  const result = await StockService.createStock(req); 

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.CREATED,
    message: 'Stock created successfully',
    data: result
  });
});

const updateStock: RequestHandler = catchAsync(async (req, res) => {
  const result = await StockService.updateStock(req.params.id, req); 

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: 'Stock updated successfully',
    data: result
  });
});

const deleteStock: RequestHandler = catchAsync(async (req, res) => {
  await StockService.deleteStock(req.params.id); 

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: 'Stock deleted successfully',
    data: null
  });
});

export const StockController = {
  getAllStock,
  getStockById,
  createStock,
  updateStock,
  deleteStock
};
