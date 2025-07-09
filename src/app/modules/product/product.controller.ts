import { RequestHandler } from 'express';
import { productService } from './product.service';
import httpStatus from 'http-status';
import sendResponse from '../../utils/sendResponse';
import catchAsync from '../../utils/catchAsync';

const getAllProduct: RequestHandler = catchAsync(async (req, res) => {
  const result = await productService.getAllProduct(req.query);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: 'Product retrieved successfully',
    meta: result.meta,
    data: result.result
  });
});

const getProductById: RequestHandler = catchAsync(async (req, res) => {
  const result = await productService.getProductById(req.params.id);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: 'Product retrieved successfully',
    data: result
  });
});

const productDetails: RequestHandler = catchAsync(async (req, res) => {
  const result = await productService.getProductDetails(req.params.id);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: 'Product details retrieved successfully',
    data: result
  });
});

const createProduct: RequestHandler = catchAsync(async (req, res) => {
  const result = await productService.createProduct(req);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.CREATED,
    message: 'Product created successfully',
    data: result
  });
});

const updateProduct: RequestHandler = catchAsync(async (req, res) => {
  const result = await productService.updateProduct(req.params.id, req);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: 'Product updated successfully',
    data: result
  });
});

const deleteProduct: RequestHandler = catchAsync(async (req, res) => {
  await productService.deleteProduct(req.params.id);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: 'Product deleted successfully',
    data: null
  });
});

const addFeaturedProducts: RequestHandler = catchAsync(async (req, res) => {
  const result = await productService.addFeaturedProducts(req);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: 'Products featured successfully',
    data: result
  });
});

const getShopProducts: RequestHandler = catchAsync(async (req, res) => {
  const result = await productService.getShopProducts(req);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: 'Shop products retrieved successfully',
    data: result
  });
});

export const productController = {
  getAllProduct,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  addFeaturedProducts,
  productDetails,
  getShopProducts
};
