import { Schema, model } from 'mongoose';
import { IOffers, IOffersModel } from './offers.interface';

const offersSchema = new Schema<IOffers, IOffersModel>(
  {
    title: {
      type: String,
      required: true,
      trim: true
    },
    subTitle: {
      type: String,
      required: true,
      trim: true
    },
    startDate: {
      type: Date,
      required: true
    },
    endDate: {
      type: Date,
      required: true
    },
    products: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Product'
      }
    ],
    status: {
      type: String,
      enum: ['active', 'inactive'],
      default: 'active'
    }
  },
  {
    timestamps: true
  }
);

const Offers = model<IOffers, IOffersModel>('Offers', offersSchema);
export default Offers;
