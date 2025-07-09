import { Document, Model } from 'mongoose';

export interface ISupplier extends Document {
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

export interface ISupplierModel extends Model<ISupplier> {
  // Define model methods here
}
