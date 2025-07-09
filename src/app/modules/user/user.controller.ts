import httpStatus from 'http-status';
import sendResponse from '../../utils/sendResponse';
import { RequestHandler } from 'express';
import catchAsync from '../../utils/catchAsync';
import { userService } from './user.service';

const changePassword: RequestHandler = catchAsync(async (req, res) => {
  const result = await userService.changePassword(req.user, req.body);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: 'Passowrd change successfull',
    data: result
  });
});

const updateProfile: RequestHandler = catchAsync(async (req, res) => {
  const result = await userService.updateProfile(req);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: 'Profile updated successfully',
    data: result
  });
});

const changeStatus: RequestHandler = catchAsync(async (req, res) => {
  const { id } = req.params;

  const result = await userService.changeStatus(id, req.body);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: 'Status changed successfully',
    data: result
  });
});

const chnageUserRole: RequestHandler = catchAsync(async (req, res) => {
  const { id } = req.params;

  const result = await userService.changeUserRole(id, req.body);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: 'Role changed successfully',
    data: result
  });
});

const getProlfile: RequestHandler = catchAsync(async (req, res) => {
  const result = await userService.getProlfile(req.user);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: 'User profile',
    data: result
  });
});

const getAllUsers: RequestHandler = catchAsync(async (req, res) => {
  const result = await userService.getAllUsers(req.query);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: 'All users',
    data: result.result,
    meta: result.meta
  });
});

const getUserById: RequestHandler = catchAsync(async (req, res) => {
  const result = await userService.getUserById(req.params.id);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: 'User',
    data: result
  });
});

const deleteUser: RequestHandler = catchAsync(async (req, res) => {
  const result = await userService.deleteUser(req.params.id);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: 'User deleted successfully',
    data: result
  });
});

const addProductToWishlist: RequestHandler = catchAsync(async (req, res) => {
  const result = await userService.addProductToWishlist(req);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: result,
    data: null
  });
});

const createUserByAdmin: RequestHandler = catchAsync(async (req, res) => {
  const result = await userService.createUserByAdmin(req.body);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.CREATED,
    message: 'User created successfully',
    data: result
  });
});

const updateUserByAdmin: RequestHandler = catchAsync(async (req, res) => {
  const { id } = req.params;
  const result = await userService.updateUserByAdmin(id, req.body);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: 'User updated successfully',
    data: result
  });
});

export const userController = {
  changePassword,
  updateProfile,
  changeStatus,
  chnageUserRole,
  getProlfile,
  getAllUsers,
  getUserById,
  deleteUser,
  addProductToWishlist,
  createUserByAdmin,
  updateUserByAdmin
};
