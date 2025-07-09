import { model, Schema } from 'mongoose';
import { ICategory, IMainCategory, ISubCategory } from './category.interface';

const SubCategorySchema = new Schema<ISubCategory>(
  {
    name: { type: String, required: true },
    slug: { type: String, required: true },
    category: { type: Schema.Types.ObjectId, ref: 'Category' }
  },
  {
    toJSON: { virtuals: true },
    timestamps: true
  }
);

const CategorySchema = new Schema<ICategory>(
  {
    name: { type: String, required: true },
    image: { type: String },
    slug: { type: String, required: true },
    subCategories: [
      {
        subCategory: { type: Schema.Types.ObjectId, ref: 'SubCategory' },
        serial: { type: Number, required: true }
      }
    ],
    mainCategory: { type: Schema.Types.ObjectId, ref: 'MainCategory' },
    isActive: { type: Boolean, default: true }
  },
  {
    toJSON: { virtuals: true },
    timestamps: true
  }
);

const MainCategorySchema = new Schema<IMainCategory>(
  {
    name: { type: String, required: true },
    image: { type: String },
    slug: { type: String, required: true },
    categories: [
      {
        category: { type: Schema.Types.ObjectId, ref: 'Category' },
        serial: { type: Number, required: true }
      }
    ],
    serial: { type: Number, default: 0 }
  },
  {
    toJSON: { virtuals: true },
    timestamps: true
  }
);

export const SubCategory = model<ISubCategory>('SubCategory', SubCategorySchema);
export const Category = model<ICategory>('Category', CategorySchema);
export const MainCategory = model<IMainCategory>('MainCategory', MainCategorySchema);
