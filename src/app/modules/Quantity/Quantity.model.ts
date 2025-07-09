import { Schema, model } from 'mongoose';
import { IQuantity } from './Quantity.interface';

const QuantitySchema = new Schema<IQuantity>(
  {
    date: { type: Date, required: true },
    referenceNo: { type: String, required: true },
    attachDocument: { type: String, required: false },
    products: [
      {
        productId: { type: Schema.Types.ObjectId, required: true },
        productName: { type: String, required: true },
        productCode: { type: String, required: true },
        type: { type: String, enum: ['Subtraction', 'Addition'], required: true },
        quantity: { type: Number, required: true },
        serialNumber: { type: String, required: false },
        variant: {
          name: { type: String, required: false },
          value: { type: String, required: false }
        }
      }
    ],
    note: { type: String, required: true }
  },
  {
    timestamps: true
  }
);

const Quantity = model<IQuantity>('Quantity', QuantitySchema);

export default Quantity;
