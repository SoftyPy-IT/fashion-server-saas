
import { RequestHandler} from 'express';
import { blogService } from './blog.service';
import httpStatus from 'http-status';
import sendResponse from '../../utils/sendResponse';
import catchAsync from '../../utils/catchAsync';

const getAllBlog: RequestHandler = catchAsync(async (req, res) => {
  const result = await blogService.getAllBlog(req.query); 

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: 'Blog retrieved successfully',
    data: result.result,
    meta: result.meta
  });
});

const getBlogById: RequestHandler = catchAsync(async (req, res) => {
  const result = await blogService.getBlogById(req.params.id); 

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: 'Blog retrieved successfully',
    data: result
  });
});

const createBlog: RequestHandler = catchAsync(async (req, res) => {
  const result = await blogService.createBlog(req); 

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.CREATED,
    message: 'Blog created successfully',
    data: result
  });
});

const updateBlog: RequestHandler = catchAsync(async (req, res) => {
  const result = await blogService.updateBlog(req.params.id, req); 

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: 'Blog updated successfully',
    data: result
  });
});

const deleteBlog: RequestHandler = catchAsync(async (req, res) => {
  await blogService.deleteBlog(req.params.id); 

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: 'Blog deleted successfully',
    data: null
  });
});

export const blogController = {
  getAllBlog,
  getBlogById,
  createBlog,
  updateBlog,
  deleteBlog
};
