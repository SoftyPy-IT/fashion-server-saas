import { Schema, model } from 'mongoose';
import { ICombo, IComboModel } from './combo.interface';

const comboSchema = new Schema<ICombo, IComboModel>({
  name: {
    type: String,
    required: true,
    trim: true
  },
  code: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  slug: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  items: [
    {
      type: Schema.Types.ObjectId,
      ref: 'Product'
    }
  ],
  price: {
    type: Number,
    required: true
  },
  discount_price: {
    type: Number,
    required: false,
    default: 0
  },
  description: {
    type: String,
    required: true,
    trim: true
  },
  short_description: {
    type: String,
    required: true,
    trim: true
  },
  thumbnail: {
    type: String,
    required: true
  },
  images: [
    {
      type: String
    }
  ],
  reviews: [
    {
      type: Schema.Types.ObjectId,
      ref: 'Review'
    }
  ],
  rating: {
    type: Number,
    default: 0
  },
  faq: [
    {
      question: {
        type: String,
        required: true,
        trim: true
      },
      answer: {
        type: String,
        required: true,
        trim: true
      }
    }
  ],
  meta_title: { type: String, required: false },
  meta_description: { type: String, required: false },
  meta_keywords: [{ type: String, required: false }],
  is_active: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  },
  deletedAt: {
    type: Date,
    default: null
  },
  isDeleted: {
    type: Boolean,
    default: false
  }
});

comboSchema.pre<ICombo>('save', function (next) {
  this.slug = this.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
  next();
});

const Combo = model<ICombo, IComboModel>('Combo', comboSchema);
export default Combo;
