import { Document, Model } from 'mongoose';

export interface ICustomers extends Document {
  company: string;
  name: string;
  vatNumber?: string;
  gstNumber?: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state?: string;
  postalCode?: string;
  country: string;
  isDeleted: boolean;
  deletedAt: Date;
}

export interface ICustomersModel extends Model<ICustomers> {
  // Define model methods here
}
