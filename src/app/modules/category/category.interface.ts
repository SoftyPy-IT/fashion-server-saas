import { Category } from './category.model';
import { Document, ObjectId } from 'mongoose';

export interface ISubCategory extends Document {
  _id: string;
  name: string;
  slug: string;
  category: string | ICategory;
  serial: number;
}

export interface ICategory extends Document {
  _id: ObjectId;
  name: string;
  image?: string;
  slug: string;
  subCategories: ISubCategory[];
  isActive: boolean;
  mainCategory: string | IMainCategory;
  serial: number;
}

export interface IMainCategory extends Document {
  _id: ObjectId;
  name: string;
  image?: string;
  slug: string;
  categories: { category: ICategory | null; serial: number }[];
  serial: number;
}
