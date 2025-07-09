import * as z from 'zod';

export const createCouponSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  code: z.string().min(1, 'Code is required'),
  discount: z.number().positive('Discount must be a positive number'),
  discountType: z.enum(['percentage', 'flat']),
  expiryDate: z.string({
    required_error: 'Please provide coupon expiryDate',
    invalid_type_error: 'expiryDate should be a string'
  }),
  isActive: z.boolean().optional().default(true),
  limit: z.number().optional().default(50),
  totalUsed: z.number().optional().default(0)
});

export const updateCouponSchema = z.object({
  name: z.string().min(1, 'Name is required').optional(),
  code: z.string().min(1, 'Code is required').optional(),
  discount: z.number().positive('Discount must be a positive number').optional(),
  discountType: z.enum(['percentage', 'flat']).optional(),
  expiryDate: z
    .string({
      invalid_type_error: 'expiryDate should be a string'
    })
    .optional(),
  isActive: z.boolean().optional(),
  limit: z.number().optional()
});

export const applyCouponSchema = z.object({
  code: z.string().min(1, 'Code is required')
});
