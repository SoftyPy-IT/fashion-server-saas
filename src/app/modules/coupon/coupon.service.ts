import Coupon from './coupon.model';
import { ICoupon } from './coupon.interface';
import QueryBuilder from '../../builder/QueryBuilder';
import httpStatus from 'http-status';
import AppError from '../../errors/AppError';
import { Request } from 'express';

export const getAllCoupon = async (query: Record<string, unknown>): Promise<any> => {
  try {
    const couponSearchableFields = ['name'];

    const couponQuery = new QueryBuilder(Coupon.find({}), query)
      .search(couponSearchableFields)
      .filter()
      .sort()
      .paginate()
      .fields();

    const meta = await couponQuery.countTotal();
    const result = await couponQuery.queryModel;

    return { meta, result };
  } catch (error: any) {
    throw new AppError(httpStatus.INTERNAL_SERVER_ERROR, error.message || 'Internal Server Error');
  }
};

export const getCouponById = async (id: string): Promise<ICoupon | null> => {
  try {
    const coupon = await Coupon.findOne({ _id: id });
    if (!coupon) {
      throw new AppError(httpStatus.NOT_FOUND, 'This coupon is not found');
    }
    return coupon;
  } catch (error: any) {
    throw new AppError(httpStatus.INTERNAL_SERVER_ERROR, error.message || 'Internal Server Error');
  }
};

export const createCoupon = async (req: Request): Promise<ICoupon | null> => {
  try {
    const { name, code, expiryDate, discountType } = req.body;

    // Check if the coupon name and code already exist
    const existingCoupon = await Coupon.findOne({ $or: [{ name }, { code }] });
    if (existingCoupon) {
      throw new AppError(httpStatus.BAD_REQUEST, 'This coupon already exists');
    }

    if (discountType === 'percentage' && (req.body.discount < 0 || req.body.discount > 100)) {
      throw new AppError(httpStatus.BAD_REQUEST, 'Discount must be between 0 and 100');
    }

    // Check if the expiry date is in the future
    if (new Date(expiryDate) < new Date()) {
      throw new AppError(httpStatus.BAD_REQUEST, 'Expiry date must be in the future');
    }

    const result = await Coupon.create(req.body);
    return result;
  } catch (error: any) {
    throw new AppError(httpStatus.INTERNAL_SERVER_ERROR, error.message || 'Internal Server Error');
  }
};

export const updateCoupon = async (id: string, req: Request): Promise<ICoupon | null> => {
  try {
    const coupon = await Coupon.findOne({ _id: id });
    if (!coupon) {
      throw new AppError(httpStatus.NOT_FOUND, 'This coupon does not exist');
    }

    const { name, code, expiryDate, discountType } = req.body;

    // Check if the coupon name and code already exist
    const existingCoupon = await Coupon.findOne({ $or: [{ name }, { code }] });
    if (existingCoupon && existingCoupon._id.toString() !== id) {
      throw new AppError(httpStatus.BAD_REQUEST, 'This coupon already exists');
    }

    if (discountType === 'percentage' && (req.body.discount < 0 || req.body.discount > 100)) {
      throw new AppError(httpStatus.BAD_REQUEST, 'Discount must be between 0 and 100');
    }

    // Check if the expiry date is in the future
    if (new Date(expiryDate) < new Date()) {
      throw new AppError(httpStatus.BAD_REQUEST, 'Expiry date must be in the future');
    }

    const modifiedUpdatedData = {
      ...req.body,
      updatedAt: new Date()
    };

    const result = await Coupon.findByIdAndUpdate(id, modifiedUpdatedData, {
      new: true,
      runValidators: true
    });

    return result;
  } catch (error: any) {
    throw new AppError(httpStatus.INTERNAL_SERVER_ERROR, error.message || 'Internal Server Error');
  }
};

export const deleteCoupon = async (id: string): Promise<void | null> => {
  try {
    const coupon = await Coupon.findOne({ _id: id });
    if (!coupon) {
      throw new AppError(httpStatus.NOT_FOUND, 'This coupon is not found');
    }

    await Coupon.findByIdAndUpdate(id, { isDeleted: true, deletedAt: new Date() }, { new: true });

    return null;
  } catch (error: any) {
    throw new AppError(httpStatus.INTERNAL_SERVER_ERROR, error.message || 'Internal Server Error');
  }
};

export const applyCoupon = async (req: Request): Promise<any | null> => {
  try {
    const { code } = req.body;

    const coupon = await Coupon.findOne({
      code,
      isActive: true,
      expiryDate: { $gt: new Date().toISOString() }
    });
    if (!coupon) {
      throw new AppError(httpStatus.NOT_FOUND, 'This coupon is invalid or has expired');
    }

    // check if the coupon has reached its limit
    if (coupon.totalUsed >= coupon.limit) {
      throw new AppError(httpStatus.BAD_REQUEST, 'This coupon has reached its limit');
    }

    return coupon;
  } catch (error: any) {
    throw new AppError(httpStatus.INTERNAL_SERVER_ERROR, error.message || 'Internal Server Error');
  }
};

export const couponService = {
  getAllCoupon,
  getCouponById,
  createCoupon,
  updateCoupon,
  deleteCoupon,
  applyCoupon
};
