import { Document, Model, ObjectId } from 'mongoose';

export interface IBrand extends Document {
  // Define document properties here
  name: string;
  description: string;
  slug: string;
  image: string;
  products: ObjectId[];
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date;
}

export interface IBrandModel extends Model<IBrand> {
  // Define model static methods here
  // eslint-disable-next-line no-unused-vars
  isBrandExists(name: string): Promise<boolean>;
}
