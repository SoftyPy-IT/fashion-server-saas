
import { RequestHandler} from 'express';
import { comboService } from './combo.service';
import httpStatus from 'http-status';
import sendResponse from '../../utils/sendResponse';
import catchAsync from '../../utils/catchAsync';

const getAllCombo: RequestHandler = catchAsync(async (req, res) => {
  const result = await comboService.getAllCombo(req.query); 

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: 'Combo retrieved successfully',
    data: result.result,
    meta: result.meta
  });
});

const getComboById: RequestHandler = catchAsync(async (req, res) => {
  const result = await comboService.getComboById(req.params.id); 

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: 'Combo retrieved successfully',
    data: result
  });
});

const createCombo: RequestHandler = catchAsync(async (req, res) => {
  const result = await comboService.createCombo(req); 

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.CREATED,
    message: 'Combo created successfully',
    data: result
  });
});

const updateCombo: RequestHandler = catchAsync(async (req, res) => {
  const result = await comboService.updateCombo(req.params.id, req); 

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: 'Combo updated successfully',
    data: result
  });
});

const deleteCombo: RequestHandler = catchAsync(async (req, res) => {
  await comboService.deleteCombo(req.params.id); 

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: 'Combo deleted successfully',
    data: null
  });
});

export const comboController = {
  getAllCombo,
  getComboById,
  createCombo,
  updateCombo,
  deleteCombo
};
