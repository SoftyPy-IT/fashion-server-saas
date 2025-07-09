import { Document, Model, ObjectId } from 'mongoose';

export interface IQuotations extends Document {
  date: Date;
  reference: string;
  biller: ObjectId;
  tax: ObjectId;
  discount: number;
  shipping: number; // Changed to number
  status: 'Pending' | 'Sent' | 'Accepted' | 'Rejected';
  supplier: ObjectId;
  attachDocument?: {
    url: string;
    publicId: string;
  };
  customer: ObjectId;
  items: {
    product_name: string;
    product_code: string;
    product_id: ObjectId;
    unit_price: number;
    quantity: number;
    discount: number;
    tax: number;
    sub_total: number;
  }[];
  note?: string;
  createdAt?: Date;
  updatedAt?: Date;

  // Virtuals
  total: number;
  total_tax: number;
  total_discount: number;
  grand_total: number;
  total_quantity: number;
  total_sub_total: number;
}

export interface IQuotationsModel extends Model<IQuotations> {
  calculateTotalTax(): Promise<number>;
}
