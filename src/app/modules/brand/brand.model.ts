import { Schema, model } from 'mongoose';
import { IBrand, IBrandModel } from './brand.interface';

const brandSchema = new Schema<IBrand, IBrandModel>(
  {
    name: { type: String, required: true, unique: true },
    description: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    image: {
      type: String,
      required: true
    },
    products: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Product'
      }
    ],
    isDeleted: { type: Boolean, default: false },
    deletedAt: { type: Date, default: null }
  },
  {
    timestamps: true
  }
);

brandSchema.statics.isBrandExists = async function (name: string) {
  const brand = await this.findOne({ name, isDeleted: false });
  return !!brand;
};

const Brand = model<IBrand, IBrandModel>('Brand', brandSchema);
export default Brand;
