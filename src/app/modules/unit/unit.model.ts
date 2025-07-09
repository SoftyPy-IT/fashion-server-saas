import { Schema, model } from 'mongoose';
import { IUnit, IUnitModel } from './unit.interface';

// Define the unit schema
const unitSchema = new Schema<IUnit, IUnitModel>(
  {
    unit_code: {
      type: String,
      required: true,
      trim: true
    },
    name: {
      type: String,
      required: true,
      trim: true
    },
    base_unit: {
      type: Schema.Types.ObjectId,
      ref: 'Unit'
    },
    operator: {
      type: String,
      enum: ['*', '/', '+', '-']
    },
    operation_value: {
      type: Number
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

// Create the model from the schema
const Unit = model<IUnit, IUnitModel>('Unit', unitSchema);

export default Unit;
