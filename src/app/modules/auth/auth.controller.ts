import httpStatus from 'http-status';
import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import { authService } from './auth.service';
import { RequestHandler } from 'express';

const userRegistration: RequestHandler = catchAsync(async (req, res) => {
  const result = await authService.userRegistration(req);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: 'Check your email for verification',
    data: result
  });
});

const verifyUser: RequestHandler = catchAsync(async (req, res) => {
  const result = await authService.verifyEmail(req);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: 'User registration successful',
    data: result
  });
});

const userLogin: RequestHandler = catchAsync(async (req, res) => {
  const result = await authService.userLogin(req);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: 'User logged in successfully',
    data: result
  });
});

const refreshToken: RequestHandler = catchAsync(async (req, res) => {
  const result = await authService.refreshToken(req);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: 'Token refreshed successfully',
    data: result
  });
});

const forgetPassword: RequestHandler = catchAsync(async (req, res) => {
  const { email } = req.body;
  const result = await authService.forgetPasswordService(req, email);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: 'Reset password link is sent to your email',
    data: result
  });
});

const resetPassword: RequestHandler = catchAsync(async (req, res) => {
  const token = req.headers.authorization;
  if (!token) {
    throw new Error('Token is not found');
  }

  const result = await authService.resetPasswordService(req, token);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: 'Password reset successfull',
    data: result
  });
});

const logout: RequestHandler = catchAsync(async (req, res) => {
  const { refreshToken, accessToken } = req.cookies;

  if (!refreshToken || !accessToken) {
    throw new Error('User is not logged in');
  }

  res.clearCookie('refreshToken');
  res.clearCookie('accessToken');

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: 'User logged out successfully',
    data: {}
  });
});

export const authController = {
  userRegistration,
  verifyUser,
  userLogin,
  refreshToken,
  forgetPassword,
  resetPassword,
  logout
};
