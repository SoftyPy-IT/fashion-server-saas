/* eslint-disable no-undef */
import { Request } from 'express';
import httpStatus from 'http-status';
import { configureMediaService, getMediaService, UploadResponse } from 'softypy-media-service';
import AppError from '../../errors/AppError';

configureMediaService({
  baseUrl: 'https://media.fashion.com.bd/api/v1/media',
  apiKey: '27630336ccbaa1c735968a35471c6f4a5df7810f536314140ceb7d1eeec0b77b'
});

const mediaService = getMediaService();

import QueryBuilder from '../../builder/QueryBuilder';
import { imageValidator } from '../../utils/helper';
import { FolderModel, ImageGalleryModel } from './image-gallery.model';

const getAllImages = async (req: Request) => {
  try {
    const query = req.query;
    const galleryQuery = new QueryBuilder(ImageGalleryModel.find(), query)
      .filter()
      .sort()
      .paginate();

    const meta = await galleryQuery.countTotal();
    const result = await galleryQuery.queryModel;

    return { result, meta };
  } catch (error: any) {
    throw new AppError(httpStatus.BAD_REQUEST, error.message);
  }
};

const getImagesByFolder = async (req: Request) => {
  const { folder } = req.params;
  const limit = parseInt(req.query.limit as string, 10) || 10;
  const page = parseInt(req.query.page as string, 10) || 1;

  try {
    const folderExist = await FolderModel.findOne({ _id: folder });
    if (!folderExist) {
      throw new AppError(httpStatus.NOT_FOUND, 'Folder not found');
    }

    const totalImages = await ImageGalleryModel.countDocuments({
      folder: folderExist._id
    });

    const images = await ImageGalleryModel.find({
      folder: folderExist._id
    })
      .skip((page - 1) * limit)
      .limit(limit)
      .sort({ createdAt: -1 });

    return {
      images,
      folder: folderExist.name,
      meta: {
        total: totalImages,
        page,
        limit,
        totalPages: Math.ceil(totalImages / limit)
      }
    };
  } catch (error: any) {
    throw new AppError(httpStatus.BAD_REQUEST, error.message);
  }
};

// Function to create and upload images
const createImage = async (req: Request) => {
  try {
    const files = req.files as Express.Multer.File[];
    const { folder } = req.body;

    if (!files || Object.keys(files).length === 0) {
      throw new AppError(httpStatus.BAD_REQUEST, 'Please upload an image');
    }

    if (!folder) {
      throw new AppError(httpStatus.BAD_REQUEST, 'Please provide a folder name');
    }

    // Check if folder exists, otherwise create it
    const folderDoc = await FolderModel.findOne({ _id: folder });
    if (!folderDoc) {
      throw new AppError(httpStatus.NOT_FOUND, 'Folder not found');
    }

    const uploadedImages: any[] = [];

    for (const file of files as any) {
      const image = new File([file.buffer], file.originalname, { type: file.mimetype });
      const validationError = imageValidator(image.size, image.type);

      if (validationError) {
        throw new AppError(httpStatus.BAD_REQUEST, validationError);
      }
      const { thumbnailUrl, url, publicId } = (await mediaService.uploadFile(
        image as unknown as File
      )) as UploadResponse;

      uploadedImages.push({
        url: url,
        thumbnail_url: thumbnailUrl,
        public_id: publicId,
        folder: folderDoc._id
      });
    }

    // Insert all images at once to avoid duplicates
    if (uploadedImages.length > 0) {
      const insertedImages = await ImageGalleryModel.insertMany(uploadedImages);
      await FolderModel.findByIdAndUpdate(folderDoc._id, {
        $addToSet: {
          images: { $each: insertedImages.map((image) => image._id) }
        }
      });
    }

    return 'Images uploaded successfully';
  } catch (error: any) {
    throw new AppError(httpStatus.BAD_REQUEST, error.message || "Couldn't upload images");
  }
};

// Function to delete an image
const deleteImage = async (req: Request) => {
  try {
    const { id, public_id } = req.body;

    const image = await ImageGalleryModel.findById(id);
    if (!image) {
      throw new AppError(httpStatus.NOT_FOUND, 'Image not found');
    }

    // Delete image from Cloudinary
    await mediaService.deleteFile(public_id);
    // Delete image from database
    await ImageGalleryModel.findByIdAndDelete(id);

    return 'Image deleted successfully';
  } catch (error: any) {
    throw new AppError(httpStatus.BAD_REQUEST, error.message || 'Could not delete image');
  }
};

const getFolders = async (req: Request) => {
  try {
    const searchableFields = ['name'];
    const query = { ...req.query, type: req.query.type || 'image' || null };

    const folderQuery = new QueryBuilder(FolderModel.find(), query)
      .search(searchableFields)
      .filter()
      .sort()
      .paginate();
    const meta = await folderQuery.countTotal();
    const result = await folderQuery.queryModel;

    return {
      meta,
      result
    };
  } catch (error: any) {
    throw new AppError(httpStatus.BAD_REQUEST, error.message || 'Could not get folders');
  }
};

const getFolderById = async (req: Request) => {
  const { id } = req.params;

  try {
    const folder = await FolderModel.findById(id);
    if (!folder) {
      throw new AppError(httpStatus.NOT_FOUND, 'Folder not found');
    }

    return folder;
  } catch (error: any) {
    throw new AppError(httpStatus.BAD_REQUEST, error.message || 'Could not get folder');
  }
};

const updateFolder = async (req: Request) => {
  try {
    const { id } = req.params;
    const { name } = req.body;

    const folder = await FolderModel.findById(id);
    if (!folder) {
      throw new AppError(httpStatus.NOT_FOUND, 'Folder not found');
    }

    await FolderModel.findByIdAndUpdate(id, { name });

    return 'Folder updated successfully';
  } catch (error: any) {
    throw new AppError(httpStatus.BAD_REQUEST, error.message || 'Could not update folder');
  }
};

// Function to create a folder
const createFolder = async (req: Request) => {
  try {
    const { name, type } = req.body;
    if (!name) {
      throw new AppError(httpStatus.BAD_REQUEST, 'Please provide a folder name');
    }

    const folder = await FolderModel.create({ name, type: type || 'image' });
    return folder;
  } catch (error: any) {
    throw new AppError(httpStatus.BAD_REQUEST, error.message || 'Could not create folder');
  }
};

// Function to delete a folder
const deleteFolder = async (req: Request) => {
  try {
    const { id } = req.params;

    // check if folder has images if yes, then show error message else delete folder
    const folder = await FolderModel.findById(id);
    if (!folder) {
      throw new AppError(httpStatus.NOT_FOUND, 'Folder not found');
    }

    //  Check if folder has images in image model
    const images = await ImageGalleryModel.find({ folder: id });
    if (images.length > 0) {
      throw new AppError(httpStatus.BAD_REQUEST, 'Folder has images, please delete them first');
    }

    await FolderModel.findByIdAndDelete(id);

    return 'Folder deleted successfully';
  } catch (error: any) {
    throw new AppError(httpStatus.BAD_REQUEST, error.message || 'Could not delete folder');
  }
};

export const imageGalleryService = {
  getAllImages,
  getImagesByFolder,
  createImage,
  deleteImage,
  createFolder,
  deleteFolder,
  getFolders,
  updateFolder,
  getFolderById
};
