import { NextFunction, Request, Response } from 'express';
import { upload } from '../utils/cloudinary';
import AppError from '../errors/AppError';
import httpStatus from 'http-status';

export const uploadFileWithData = (schema: any) => {
  return (req: Request, res: Response, next: NextFunction) => {
    upload.single('file')(req, res, (err: any) => {
      if (err) {
        return next(new AppError(httpStatus.BAD_REQUEST, err.message));
      }
      try {
        if (req.body.data) {
          req.body = schema.parse(JSON.parse(req.body.data));
        }
        return next();
      } catch (error: any) {
        return next(
          new AppError(httpStatus.BAD_REQUEST, error.errors ?? error.message ?? 'Invalid data')
        );
      }
    });
  };
};
