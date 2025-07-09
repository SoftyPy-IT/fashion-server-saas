/* eslint-disable no-unused-vars */
import { Model, Document, Types } from 'mongoose';

// Interface for ImageGallery Document
export interface IImageGallery extends Document {
  public_id: string;
  url: string;
  thumbnail_url?: string;
  folder: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
}

export interface IFolder extends Document {
  _id: Types.ObjectId;
  name: string;
  images: Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
  parentFolder?: Types.ObjectId;
  products: Types.ObjectId[];
  type: 'image' | 'product';
}

export interface IImageGalleryModel extends Model<IImageGallery> {
  isImageExists(public_id: string): Promise<boolean>;
}

export interface IFolderModel extends Model<IFolder> {
  createFolder(name: string): Promise<IFolder>;
  deleteFolder(name: string): Promise<void>;
}
