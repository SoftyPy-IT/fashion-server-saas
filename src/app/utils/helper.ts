import * as path from 'path';
import ejs from 'ejs';
import AppError from '../errors/AppError';
import httpStatus from 'http-status';

export const renderEjs = async (fileName: string, payload: any) => {
  try {
    const filePath = `${process.cwd()}/views/${fileName}.ejs`;
    const html = await ejs.renderFile(filePath, payload);

    return html;
  } catch (error: any) {
    throw new AppError(
      httpStatus.INTERNAL_SERVER_ERROR,
      error.message || 'Something went wrong while rendering ejs file'
    );
  }
};

const supportedMimeTypes = ['image/png', 'image/jpg', 'image/jpeg', 'image/webp', 'image/gif'];

export const imageValidator = (size: number, mime: string): string | null => {
  if (bytesToMB(size) > 2) {
    return 'Image size should be less than 2MB';
  } else if (!supportedMimeTypes.includes(mime)) {
    return 'Image type not supported! Please upload a png or jpg/jpeg image';
  }

  return null;
};

export const bytesToMB = (bytes: number): number => {
  return bytes / (1024 * 1024);
};
