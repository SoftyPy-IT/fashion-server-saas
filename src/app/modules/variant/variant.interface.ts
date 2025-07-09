import { Document, Model } from 'mongoose';

export interface IVariantItem {
  name: string;
  value: string;
}

export interface IVariant extends Document {
  name: string;
  items: IVariantItem[];
  isDeleted: boolean;
  deletedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface IVariantModel extends Model<IVariant> {}
