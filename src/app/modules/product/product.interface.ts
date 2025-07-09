/* eslint-disable no-unused-vars */
import { Document, Model, ObjectId, Types } from 'mongoose';
import { IReview } from '../review/review.interface';

// Define barcode symbology types
export type BARCODE = 'CODE128' | 'CODE39' | 'CODE25' | 'EAN13' | 'EAN8' | 'UPC-A' | 'UPC-E';

export interface IProduct extends Document {
  name: string;
  code: string;
  slug: string;
  barcodeSymbology: BARCODE;
  brand: ObjectId;
  mainCategory: ObjectId;
  category: ObjectId;
  subCategory: ObjectId;
  productUnit: ObjectId;
  defaultSaleUnit: ObjectId;
  defaultPurchaseUnit: ObjectId;
  reviews: Types.DocumentArray<IReview>;
  productCost: number;
  price: number;
  productTax: ObjectId;
  taxMethod: 'Exclusive' | 'Inclusive' | 'No Tax';
  description: string;
  short_description: string;
  thumbnail: string;
  images: string[];
  supplier: ObjectId;
  discount_price: number;
  tags: string[];
  stock: number;
  quantity: number;
  is_available: boolean;
  is_featured: boolean;
  is_active: boolean;
  total_sale: number;
  rating: number;
  faq: {
    question: string;
    answer: string;
  }[];
  variants: {
    name: string; // Name of the variant (e.g., "Color", "Size")
    values: {
      name: string;
      value: string;
      quantity?: number;
    };
  }[];
  size_chart: string;
  folder: ObjectId;
  hasVariants: boolean;
  meta_title: string;
  meta_description: string;
  meta_keywords: string[];
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
  isDeleted: boolean;
}

export interface IProductModel extends Model<IProduct> {
  isProductExistWithName(name: string): Promise<boolean>;
}
