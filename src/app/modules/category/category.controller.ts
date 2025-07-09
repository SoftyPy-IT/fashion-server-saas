import { RequestHandler } from 'express';
import { categoryService } from './category.service';
import httpStatus from 'http-status';
import sendResponse from '../../utils/sendResponse';
import catchAsync from '../../utils/catchAsync';

const getAllMainCategory: RequestHandler = catchAsync(async (req, res) => {
  const result = await categoryService.getAllMainCategory(req.query);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: 'Main categories retrieved successfully',
    meta: result.meta,
    data: result.result
  });
});

const getAllCategory: RequestHandler = catchAsync(async (req, res) => {
  const result = await categoryService.getAllCategory(req.query);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: 'Categories retrieved successfully',
    meta: result.meta,
    data: result.groupedCategories
  });
});

const getAllSubCategory: RequestHandler = catchAsync(async (req, res) => {
  const result = await categoryService.getAllSubCategory(req.query);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: 'Subcategories retrieved successfully',
    meta: result.meta,
    data: result.result
  });
});

const createMainCategory: RequestHandler = catchAsync(async (req, res) => {
  const result = await categoryService.createMainCategory(req);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.CREATED,
    message: 'Main category created successfully',
    data: result
  });
});

const createCategory: RequestHandler = catchAsync(async (req, res) => {
  const result = await categoryService.createCategory(req);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.CREATED,
    message: 'Category created successfully',
    data: result
  });
});

const createSubCategory: RequestHandler = catchAsync(async (req, res) => {
  const result = await categoryService.createSubCategory(req);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.CREATED,
    message: 'Subcategory created successfully',
    data: result
  });
});

const updateMainCategory: RequestHandler = catchAsync(async (req, res) => {
  const result = await categoryService.updateMainCategory(req);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: 'Main category updated successfully',
    data: result
  });
});

const updateCategory: RequestHandler = catchAsync(async (req, res) => {
  const result = await categoryService.updateCategory(req);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: 'Category updated successfully',
    data: result
  });
});

const updateSubCategory: RequestHandler = catchAsync(async (req, res) => {
  const result = await categoryService.updateSubCategory(req);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: 'Subcategory updated successfully',
    data: result
  });
});

const deleteMainCategory: RequestHandler = catchAsync(async (req, res) => {
  await categoryService.deleteMainCategory(req.params.id);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: 'Main category deleted successfully',
    data: null
  });
});

const deleteCategory: RequestHandler = catchAsync(async (req, res) => {
  await categoryService.deleteCategory(req.params.id);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: 'Category deleted successfully',
    data: null
  });
});

const deleteSubCategory: RequestHandler = catchAsync(async (req, res) => {
  await categoryService.deleteSubCategory(req.params.id);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: 'Subcategory deleted successfully',
    data: null
  });
});

const getFullCategoryTree: RequestHandler = catchAsync(async (req, res) => {
  const result = await categoryService.getFullCategoryTree();

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: 'Full category tree retrieved successfully',
    data: result
  });
});

const getProductsByCategory: RequestHandler = catchAsync(async (req, res) => {
  const result = await categoryService.getProductsByCategory(req.query);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: 'Products retrieved successfully',
    data: result.result,
    meta: result.meta
  });
});

const updateCategoryOrder: RequestHandler = catchAsync(async (req, res) => {
  await categoryService.updateCategoryOrder(req);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: 'Category order updated successfully',
    data: null
  });
});

const updateCategoryTree: RequestHandler = catchAsync(async (req, res) => {
  await categoryService.updateCategoryTree(req);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: 'Category tree updated successfully',
    data: null
  });
});

const getMainCategories: RequestHandler = catchAsync(async (req, res) => {
  const result = await categoryService.getMainCategories();

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: 'Main categories retrieved successfully',
    data: result
  });
});

const getCategoriesByMainCategory: RequestHandler = catchAsync(async (req, res) => {
  const result = await categoryService.getCategoriesByMainCategory(req.params.id);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: 'Categories retrieved successfully',
    data: result
  });
});

const getSubCategoriesByCategory: RequestHandler = catchAsync(async (req, res) => {
  const result = await categoryService.getSubCategoriesByCategory(req.params.id);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: 'Subcategories retrieved successfully',
    data: result
  });
});

export const categoryController = {
  getAllMainCategory,
  getAllCategory,
  getAllSubCategory,
  createMainCategory,
  createCategory,
  createSubCategory,
  updateMainCategory,
  updateCategory,
  updateSubCategory,
  deleteMainCategory,
  deleteCategory,
  deleteSubCategory,
  getFullCategoryTree,
  getProductsByCategory,
  updateCategoryOrder,
  updateCategoryTree,
  getCategoriesByMainCategory,
  getSubCategoriesByCategory,
  getMainCategories
};
