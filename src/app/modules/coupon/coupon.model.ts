import { Schema, model, ObjectId } from 'mongoose';
import { ICoupon, ICouponModel } from './coupon.interface';

const couponSchema = new Schema<ICoupon, ICouponModel>(
  {
    name: { type: String, required: true },
    code: { type: String, required: true, unique: true, trim: true },
    discount: { type: Number, required: true },
    discountType: { type: String, enum: ['percentage', 'flat'], required: true },
    expiryDate: { type: String, required: true },
    isActive: { type: Boolean, default: true },
    limit: { type: Number, default: 50 },
    totalUsed: { type: Number, default: 0 }
  },
  {
    timestamps: true
  }
);

couponSchema.statics.findActiveCoupons = async function (): Promise<ICoupon[]> {
  return this.find({ isActive: true, expiryDate: { $gt: new Date() } });
};

couponSchema.statics.applyCoupon = async function (
  userId: ObjectId,
  orderId: ObjectId,
  code: string
): Promise<ICoupon | null> {
  const coupon = await this.findOne({
    code,
    isActive: true,
    expiryDate: { $gt: new Date().toISOString() }
  });

  if (coupon) {
    coupon.totalUsed += 1;
    coupon.users.push(userId);
    coupon.orders.push(orderId);
    await coupon.save();
  }

  return coupon;
};

const Coupon = model<ICoupon, ICouponModel>('Coupon', couponSchema);
export default Coupon;
