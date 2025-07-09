import { Schema, model } from 'mongoose';
import { ITax, ITaxModel } from './tax.interface';

const taxSchema = new Schema<ITax, ITaxModel>(
  {
    name: {
      type: String,
      required: [true, 'Tax name is required'],

      trim: true
    },
    code: {
      type: String,
      required: [true, 'Tax code is required'],

      trim: true,
      unique: true
    },
    rate: {
      type: Number,
      required: [true, 'Tax rate is required']
    },
    type: {
      type: String,
      required: [true, 'Tax type is required']
    },
    isDeleted: {
      type: Boolean,
      default: false
    },
    deletedAt: {
      type: Date
    }
  },
  {
    timestamps: true
  }
);

const Tax = model<ITax, ITaxModel>('Tax', taxSchema);
export default Tax;
