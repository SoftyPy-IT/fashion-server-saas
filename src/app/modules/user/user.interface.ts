/* eslint-disable no-unused-vars */
import { Document, Model, ObjectId } from 'mongoose';

export interface IUser extends Document {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  password: string;
  avatar: {
    public_id: string;
    url: string;
  };
  dateOfBirth: Date;
  role: 'user' | 'admin';
  status: 'active' | 'inactive' | 'blocked';
  isVerified: boolean;
  passwordChangedAt: Date;
  address: {
    address: string;
    city: string;
    postalCode: string;
    country: string;
  };
  hasShippingAddress: boolean;
  shippingAddress: {
    address: string;
    city: string;
    postalCode: string;
    country: string;
  };
  orders: ObjectId[];
  wishlist: ObjectId[];
  paymentHistory: ObjectId[];
  reviews: ObjectId[];
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date;
}

export interface IUserModel extends Model<IUser> {
  comparePassword: (enteredPassword: string, userPassword: string) => Promise<string>;

  isUserExist: (email: string) => Promise<boolean>;
}

export type TUserRole = 'user' | 'admin';
