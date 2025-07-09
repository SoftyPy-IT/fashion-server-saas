import * as z from 'zod';

export const createStockSchema = z.object({
  startDate: z
    .string({
      required_error: 'Start Date is required'
    })
    .transform((str) => new Date(str)),
  endDate: z
    .string({
      required_error: 'End Date is required'
    })
    .transform((str) => new Date(str)),
  reference: z.string(),
  type: z.enum(['Partial', 'Full']),
  brands: z.array(z.string()).optional(), // Assuming you use ObjectId as string for brands
  categories: z.array(z.string()).optional(), // Assuming you use ObjectId as string for categories
  initialStockCSV: z.string().optional(),
  finalStockCSV: z.string().optional(),
  isFinalCalculation: z.boolean().default(false),
  note: z.string().optional()
});

export const updateStockSchema = z.object({});
