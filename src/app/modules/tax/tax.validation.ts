import * as z from 'zod';

export const createTaxSchema = z.object({
  name: z
    .string()
    .min(3, { message: 'Tax name must be at least 3 characters long' })
    .max(50, { message: 'Tax name cannot exceed 50 characters' })
    .trim(),
  code: z
    .string()
    .min(2, { message: 'Tax code must be at least 2 characters long' })
    .max(10, { message: 'Tax code cannot exceed 10 characters' })
    .trim(),
  rate: z.number().min(0, { message: 'Tax rate cannot be negative' }),
  type: z.enum(['Fixed', 'Percentage'], {
    errorMap: () => ({ message: 'Tax type must be either Fixed or Percentage' })
  })
});

export const updateTaxSchema = z.object({
  name: z
    .string()
    .min(3, { message: 'Tax name must be at least 3 characters long' })
    .max(50, { message: 'Tax name cannot exceed 50 characters' })
    .trim()
    .optional(),
  code: z
    .string()
    .min(2, { message: 'Tax code must be at least 2 characters long' })
    .max(10, { message: 'Tax code cannot exceed 10 characters' })
    .trim()
    .optional(),
  rate: z.number().min(0, { message: 'Tax rate cannot be negative' }).optional(),
  type: z
    .enum(['Fixed', 'Percentage'], {
      errorMap: () => ({ message: 'Tax type must be either Fixed or Percentage' })
    })
    .optional()
});
