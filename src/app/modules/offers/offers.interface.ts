import { Document, Model, ObjectId } from 'mongoose';

export interface IOffers extends Document {
  title: string;
  subTitle: string;
  startDate: Date;
  endDate: Date;
  products: ObjectId[];
  status: 'active' | 'inactive';
  createdAt: Date;
  updatedAt: Date;
}

export interface IOffersModel extends Model<IOffers> {}
