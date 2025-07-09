/* eslint-disable no-unused-vars */
import { Document, Model, ObjectId } from 'mongoose';

export interface ICoupon extends Document {
  name: string;
  code: string;
  discount: number;
  discountType: 'percentage' | 'flat';
  expiryDate: string;
  isActive: boolean;
  limit: number;
  totalUsed: number;
  users: ObjectId[];
  orders: ObjectId[];
}

export interface ICouponModel extends Model<ICoupon> {
  findActiveCoupons(): Promise<ICoupon[]>;
  applyCoupon(userId: ObjectId, orderId: ObjectId, code: string): Promise<ICoupon>;
}
