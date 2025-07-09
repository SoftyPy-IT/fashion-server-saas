/* eslint-disable no-undef */
import { v2 as cloudinary, UploadApiErrorResponse, UploadApiResponse } from 'cloudinary';
import fs from 'fs';
import httpStatus from 'http-status';
import multer from 'multer';
import path from 'path';
import config from '../config';
import AppError from '../errors/AppError';

cloudinary.config({
  cloud_name: config.CLOUDINARY_CLOUD_NAME,
  api_key: config.CLOUDINARY_CLOUD_KEY,
  api_secret: config.CLOUDINARY_CLOUD_SECRET
});

const deleteFile = (path: string) => {
  fs.unlink(path, (err) => {
    if (err) {
      console.error(`Failed to delete file at ${path}:`, err);
    } else {
      console.log('File is deleted.');
    }
  });
};

export const sendImageToCloudinary = async (
  imageName: string,
  path: string,
  folder: string
): Promise<UploadApiResponse> => {
  try {
    const result = await cloudinary.uploader.upload(path, {
      public_id: imageName.trim(),
      folder: `softypy/${folder}`
    });
    deleteFile(path);
    return result;
  } catch (error) {
    deleteFile(path);
    throw new AppError(httpStatus.INTERNAL_SERVER_ERROR, 'Failed to upload image to Cloudinary');
  }
};

export const deleteImageFromCloudinary = async (
  publicId: string
): Promise<UploadApiResponse | UploadApiErrorResponse> => {
  try {
    const result = await cloudinary.uploader.destroy(publicId);
    return result;
  } catch (error) {
    throw new AppError(httpStatus.INTERNAL_SERVER_ERROR, 'Failed to delete image from Cloudinary');
  }
};

export const saveAttachment = async (file: Express.Multer.File): Promise<UploadApiResponse> => {
  const path = file.path;
  const uniqueFilename = new Date().toISOString();

  try {
    const result = await cloudinary.uploader.upload(path, {
      public_id: uniqueFilename,
      folder: 'softypy/attachments'
    });
    deleteFile(path);
    return result;
  } catch (error) {
    deleteFile(path);
    throw new AppError(
      httpStatus.INTERNAL_SERVER_ERROR,
      'Failed to upload attachment to Cloudinary'
    );
  }
};

export const deleteAttachment = async (
  publicId: string
): Promise<UploadApiResponse | UploadApiErrorResponse> => {
  try {
    const result = await cloudinary.uploader.destroy(publicId);
    return result;
  } catch (error) {
    throw new AppError(
      httpStatus.INTERNAL_SERVER_ERROR,
      'Failed to delete attachment from Cloudinary'
    );
  }
};

export const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 1024 * 1024 * 2, // 3MB
    files: 5
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|jpeg|png|webp|gif/;
    const mimeType = allowedTypes.test(file.mimetype);
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());

    if (mimeType && extname) {
      return cb(null, true);
    }
    cb(
      new AppError(
        httpStatus.BAD_REQUEST,
        'Only images are allowed. Supported formats are jpeg, jpg, png, webp and gif'
      )
    );
  }
});

export const cloudinaryConfig = cloudinary;
