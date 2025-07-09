import { RequestHandler } from 'express';
import { sectionService } from './section.service';
import httpStatus from 'http-status';
import sendResponse from '../../utils/sendResponse';
import catchAsync from '../../utils/catchAsync';

const getAllSection: RequestHandler = catchAsync(async (req, res) => {
  const result = await sectionService.getAllSection(req.query);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: 'Section retrieved successfully',
    data: result.result,
    meta: result.meta
  });
});

const getSectionById: RequestHandler = catchAsync(async (req, res) => {
  const result = await sectionService.getSectionById(req.params.id, req);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: 'Section retrieved successfully',
    data: result
  });
});

const createSection: RequestHandler = catchAsync(async (req, res) => {
  const result = await sectionService.createSection(req);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.CREATED,
    message: 'Section created successfully',
    data: result
  });
});

const updateSection: RequestHandler = catchAsync(async (req, res) => {
  const result = await sectionService.updateSection(req.params.id, req);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: 'Section updated successfully',
    data: result
  });
});

const deleteSection: RequestHandler = catchAsync(async (req, res) => {
  await sectionService.deleteSection(req.params.id);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: 'Section deleted successfully',
    data: null
  });
});

export const sectionController = {
  getAllSection,
  getSectionById,
  createSection,
  updateSection,
  deleteSection
};
