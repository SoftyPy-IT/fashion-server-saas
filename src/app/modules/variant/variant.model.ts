import { Schema, model } from 'mongoose';
import { IVariant, IVariantModel } from './variant.interface';

const VariantItemSchema: Schema = new Schema(
  {
    name: { type: String, required: true },
    value: { type: String, required: true }
  },
  { _id: false }
);

const variantSchema = new Schema<IVariant, IVariantModel>(
  {
    name: {
      type: String,
      required: true,
      unique: true
    },
    items: [VariantItemSchema],
    isDeleted: {
      type: Boolean,
      default: false
    },
    deletedAt: {
      type: Date,
      default: null
    }
  },
  {
    timestamps: true
  }
);

variantSchema.pre<IVariant>('save', function (next) {
  this.updatedAt = new Date();
  next();
});

const Variant = model<IVariant, IVariantModel>('Variant', variantSchema);
export default Variant;
