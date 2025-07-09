import * as z from 'zod';
import mongoose from 'mongoose';

const objectIdSchema = z.string().refine((val) => mongoose.Types.ObjectId.isValid(val), {
  message: 'Invalid object ID'
});

const itemSchema = z.object({
  product_name: z
    .string({
      message: 'Please provide a product name'
    })
    .min(1, 'Product name is required'),
  product_code: z
    .string({
      message: 'Please provide a product code'
    })
    .min(1, 'Product code is required'),
  product_id: objectIdSchema,
  unit_price: z
    .string({
      message: 'Please provide a unit price'
    })
    .transform((val) => parseFloat(val))
    .refine((val) => !isNaN(val) && val >= 0, 'Unit price must be a non-negative number'),
  quantity: z
    .string({
      message: 'Please provide a quantity'
    })
    .transform((val) => parseFloat(val))
    .refine((val) => !isNaN(val) && val >= 0, 'Quantity must be a non-negative number'),
  discount: z
    .string({
      message: 'Please provide a discount'
    })
    .transform((val) => parseFloat(val))
    .refine((val) => !isNaN(val) && val >= 0, 'Discount must be a non-negative number'),
  tax: z
    .string({
      message: 'Please provide a tax'
    })
    .transform((val) => parseFloat(val))
    .refine((val) => !isNaN(val) && val >= 0, 'Tax must be a non-negative number'),
  sub_total: z
    .string({
      message: 'Please provide a sub total'
    })
    .transform((val) => parseFloat(val))
    .refine((val) => !isNaN(val) && val >= 0, 'Sub total must be a non-negative number')
});

export const createQuotationsSchema = z.object({
  date: z
    .string({ message: 'Please provide a date' })
    .transform((val) => new Date(val))
    .refine((val) => val instanceof Date && !isNaN(val.getTime()), {
      message: 'Date must be a valid date'
    }),
  reference: z
    .string({
      message: 'Please provide a reference'
    })
    .min(1, 'Reference is required'),
  biller: objectIdSchema,
  tax: objectIdSchema.optional(),
  discount: z
    .string()
    .transform((val) => parseFloat(val))
    .refine((val) => !isNaN(val) && val >= 0, 'Discount must be a non-negative number')
    .optional(),
  shipping: z
    .string({
      message: 'Please provide a shipping cost'
    })
    .transform((val) => parseFloat(val))
    .refine((val) => !isNaN(val) && val >= 0, 'Shipping must be a non-negative number'),
  status: z.enum(['Pending', 'Sent', 'Accepted', 'Rejected'], {
    message: 'Please provide a valid status'
  }),
  supplier: objectIdSchema,
  customer: objectIdSchema,
  items: z
    .array(itemSchema, {
      message: 'Please provide at least one item'
    })
    .min(1, 'At least one item is required'),
  note: z.string().optional()
});

export const updateQuotationsSchema = z
  .object({
    date: z
      .string({ message: 'Please provide a date' })
      .transform((val) => new Date(val))
      .refine((val) => val instanceof Date && !isNaN(val.getTime()), {
        message: 'Date must be a valid date'
      })
      .optional(),
    reference: z.string().min(1, 'Reference is required').optional(),
    biller: objectIdSchema.optional(),
    tax: objectIdSchema.optional(),
    discount: z
      .string()
      .transform((val) => parseFloat(val))
      .refine((val) => !isNaN(val) && val >= 0, 'Discount must be a non-negative number')
      .optional(),
    shipping: z
      .string()
      .transform((val) => parseFloat(val))
      .refine((val) => !isNaN(val) && val >= 0, 'Shipping must be a non-negative number')
      .optional(),
    status: z
      .enum(['Pending', 'Sent', 'Accepted', 'Rejected'], {
        message: 'Please provide a valid status'
      })
      .optional(),
    supplier: objectIdSchema.optional(),

    customer: objectIdSchema.optional(),
    items: z
      .array(itemSchema, {
        message: 'Please provide at least one item'
      })
      .min(1, 'At least one item is required')
      .optional(),
    note: z.string().optional()
  })
  .partial();
