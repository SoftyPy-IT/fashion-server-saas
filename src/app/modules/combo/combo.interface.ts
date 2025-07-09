import { Document, Model, ObjectId } from 'mongoose';
import { IProduct } from '../product/product.interface';

interface IComboProduct extends IProduct {
  items: ObjectId[];
}

export interface ICombo extends Document, IComboProduct {}

export interface IComboModel extends Model<ICombo> {
  // Define model methods here
}
