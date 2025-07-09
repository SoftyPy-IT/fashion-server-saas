import * as z from 'zod';

export const productSchema = z.object({
  productId: z.string(),
  productName: z.string(),
  productCode: z.string(),
  type: z.enum(['Subtraction', 'Addition']),
  quantity: z.string(),
  serialNumber: z.string().optional(),
  variant: z
    .object({
      name: z.string().optional(),
      value: z.string().optional()
    })
    .optional()
});

export const createQuantitySchema = z.object({
  date: z
    .string({
      required_error: 'Date is required'
    })
    .transform((str) => new Date(str)), // Transform to Date
  referenceNo: z.string({
    required_error: 'Reference number is required'
  }),
  products: z
    .array(productSchema, {
      required_error: 'Please add at least one product'
    })
    .min(1),
  note: z.string({
    required_error: 'Note is required'
  })
});

export const updateQuantitySchema = z.object({
  date: z
    .string()
    .transform((str) => new Date(str))
    .optional(), // Transform to Date
  referenceNo: z.string().optional(),
  attachDocument: z.string().optional(),
  products: z.array(productSchema).optional(),
  note: z.string().optional()
});
