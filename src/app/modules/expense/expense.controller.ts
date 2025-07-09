
import { RequestHandler} from 'express';
import { expenseService } from './expense.service';
import httpStatus from 'http-status';
import sendResponse from '../../utils/sendResponse';
import catchAsync from '../../utils/catchAsync';

const getAllExpense: RequestHandler = catchAsync(async (req, res) => {
  const result = await expenseService.getAllExpense(req.query); 

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: 'Expense retrieved successfully',
    data: result.result,
    meta: result.meta
  });
});

const getExpenseById: RequestHandler = catchAsync(async (req, res) => {
  const result = await expenseService.getExpenseById(req.params.id); 

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: 'Expense retrieved successfully',
    data: result
  });
});

const createExpense: RequestHandler = catchAsync(async (req, res) => {
  const result = await expenseService.createExpense(req); 

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.CREATED,
    message: 'Expense created successfully',
    data: result
  });
});

const updateExpense: RequestHandler = catchAsync(async (req, res) => {
  const result = await expenseService.updateExpense(req.params.id, req); 

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: 'Expense updated successfully',
    data: result
  });
});

const deleteExpense: RequestHandler = catchAsync(async (req, res) => {
  await expenseService.deleteExpense(req.params.id); 

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: 'Expense deleted successfully',
    data: null
  });
});

export const expenseController = {
  getAllExpense,
  getExpenseById,
  createExpense,
  updateExpense,
  deleteExpense
};
