import { Document, Model } from 'mongoose';

export interface IOrder extends Document {
  name: string;
  company: string;
  email?: string;
  phone: string;
  hasCoupon: boolean;
  couponCode?: string;
  userId?: string;
  isGuestCheckout: boolean;
  shippingAddress: {
    line1: string;
    line2?: string;
    country: string;
    district: string;
    division?: string;
    upazila: string;
    phone: string;
  };
  shippingCharge: number;
  paymentMethod: 'Cash On Delivery';
  orderItems: {
    productId: string;
    name: string;
    code: string;
    thumbnail: string;
    price: number;
    quantity: number;
    variants: {
      name: string;
      value: string;
    }[];
  }[];
  subTotal: number;
  discount: number;
  total: number;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'returned';
}

export interface IOrderModel extends Model<IOrder> {
  // Define model methods here if needed
}
