import { Document, Model, ObjectId } from 'mongoose';

export interface IPurchase extends Document {
  date: Date;
  reference: string;
  status: 'Pending' | 'Ordered' | 'Received';
  attachDocument?: {
    url: string;
    publicId: string;
  };
  supplier: ObjectId;
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
  orderTax?: ObjectId;
  discount?: number;
  shipping?: number;
  paymentTerms?: string;
  note?: string;

  // Virtuals
  total: number;
  total_tax: number;
  total_discount: number;
  grand_total: number;
  total_quantity: number;
  total_sub_total: number;
}

export interface IPurchaseModel extends Model<IPurchase> {
  // Define model methods here
}
