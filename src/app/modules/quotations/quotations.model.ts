import { Schema, model } from 'mongoose';
import { IQuotations, IQuotationsModel } from './quotations.interface';

const quotationsSchema = new Schema<IQuotations, IQuotationsModel>(
  {
    date: { type: Date, required: true },
    reference: { type: String, required: true },
    biller: { type: Schema.Types.ObjectId, ref: 'Billers', required: true },
    tax: { type: Schema.Types.ObjectId, ref: 'Tax', required: false },
    discount: { type: Number, required: true, default: 0 },
    shipping: { type: Number, required: true, default: 0 },
    status: {
      type: String,
      enum: ['Pending', 'Sent', 'Accepted', 'Rejected'],
      required: true,
      default: 'Pending'
    },
    supplier: { type: Schema.Types.ObjectId, ref: 'Supplier', required: true },
    attachDocument: {
      url: { type: String, required: false },
      publicId: { type: String, required: false }
    },
    customer: { type: Schema.Types.ObjectId, ref: 'Customers', required: true },
    items: [
      {
        product_name: { type: String, required: true },
        product_code: { type: String, required: true },
        product_id: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
        unit_price: { type: Number, required: true },
        quantity: { type: Number, required: true },
        discount: { type: Number, required: true, default: 0 },
        tax: { type: Number, required: true, default: 0 },
        sub_total: { type: Number, required: true }
      }
    ],
    note: { type: String, required: false }
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

quotationsSchema.virtual('total').get(function () {
  return this.items.reduce((total, item) => total + item.sub_total, 0);
});

quotationsSchema.virtual('total_quantity').get(function () {
  return this.items.reduce((total, item) => total + item.quantity, 0);
});

quotationsSchema.virtual('total_tax').get(function () {
  if (!this.tax) {
    return 0;
  }
  const thisModel = this as any;
  if (thisModel.tax.type === 'Fixed') {
    return thisModel.tax.rate;
  } else if (thisModel.tax.type === 'Percentage') {
    return parseFloat((thisModel.total * (thisModel.tax.rate / 100)).toFixed(2));
  }

  return 0;
});

quotationsSchema.virtual('total_discount').get(function () {
  return this.items.reduce((total, item) => total + (item.discount || 0), 0);
});

quotationsSchema.virtual('grand_total').get(function () {
  return this.total + this.shipping - this.total_discount + this.total_tax;
});

const Quotations = model<IQuotations, IQuotationsModel>('Quotations', quotationsSchema);
export default Quotations;
