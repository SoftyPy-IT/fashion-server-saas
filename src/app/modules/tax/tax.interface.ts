import { Document, Model } from 'mongoose';

export type TaxType = 'Fixed' | 'Percentage';

export interface ITax extends Document {
  name: string;
  code: string;
  rate: number;
  type: TaxType;
  isDeleted: boolean;
  deletedAt: Date;
}

export interface ITaxModel extends Model<ITax> {
  // Define model methods here
}
