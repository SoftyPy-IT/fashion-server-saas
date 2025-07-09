import { Document, Model, ObjectId } from 'mongoose';

export interface IQuantity extends Document {
  date: Date;
  referenceNo: string;
  attachDocument?: string;
  products: {
    productId: ObjectId;
    productName: string;
    productCode: string;
    type: 'Subtraction' | 'Addition';
    quantity: number;
    serialNumber?: string;
    variant?: {
      name: string;
      value: string;
    };
  }[];
  note: string;
}

export interface IQuantityModel extends Model<IQuantity> {
  // Define model methods here
}
