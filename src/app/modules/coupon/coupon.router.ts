import { Router } from 'express';
import { couponController } from './coupon.controller';
import auth from '../../middlewares/auth';
import validateRequest from '../../middlewares/validateRequest';
import { applyCouponSchema, createCouponSchema, updateCouponSchema } from './coupon.validation';
import optionalAuth from '../../middlewares/optionalAuth';

const router = Router();

router.get('/all', auth('admin'), couponController.getAllCoupon);

router.get('/:id', couponController.getCouponById);

router.post(
  '/apply',
  optionalAuth('user', 'admin'),
  validateRequest(applyCouponSchema),
  couponController.applyCoupon
);
router.post(
  '/create',
  auth('admin'),
  validateRequest(createCouponSchema),
  couponController.createCoupon
);
router.put(
  '/update/:id',
  auth('admin'),
  validateRequest(updateCouponSchema),
  couponController.updateCoupon
);
router.delete('/:id', auth('admin'), couponController.deleteCoupon);

export const couponRoutes = router;
