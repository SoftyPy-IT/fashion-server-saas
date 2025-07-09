import { Schema, model } from 'mongoose';
import { IOrder, IOrderModel } from './order.interface';
import { number } from 'zod';

const orderSchema = new Schema<IOrder, IOrderModel>(
  {
    name: { type: String, required: true },
    company: { type: String, required: false },
    email: { type: String, required: false },
    phone: { type: String, required: true },
    hasCoupon: { type: Boolean, default: false },
    couponCode: { type: String },
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: false },
    isGuestCheckout: { type: Boolean, default: false },
    shippingAddress: {
      line1: { type: String, required: true },
      line2: { type: String },
      division: { type: String, required: true },
      district: { type: String },
      upazila: { type: String },
      country: { type: String, required: true },
      phone: { type: String, required: false }
    },
    shippingCharge: { type: Number, required: true },
    paymentMethod: {
      type: String,
      enum: ['PayPal', 'Bank-in', 'Cash On Delivery'],
      required: true,
      default: 'Cash On Delivery'
    },
    orderItems: [
      {
        productId: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
        quantity: { type: Number, required: true },
        price: { type: Number, required: true },
        name: { type: String, required: true },
        code: { type: String, required: true },
        thumbnail: { type: String, required: true },
        variants: [
          {
            name: { type: String, required: false },
            value: { type: String, required: false }
          }
        ]
      }
    ],
    subTotal: { type: Number, required: true },
    discount: { type: Number, required: false },
    total: { type: Number, required: true },
    status: {
      type: String,
      enum: ['pending', 'processing', 'shipped', 'delivered', 'cancelled', 'returned'],
      default: 'pending'
    }
  },
  {
    timestamps: true
  }
);

// Create and export the Order model
const Order = model<IOrder, IOrderModel>('Order', orderSchema);
export default Order;
