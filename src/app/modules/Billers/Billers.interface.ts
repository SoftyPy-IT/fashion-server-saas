import { Document, Model } from 'mongoose';

export interface IBillers extends Document {
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

export interface IBillersModel extends Model<IBillers> {
  // Define model methods here
}
