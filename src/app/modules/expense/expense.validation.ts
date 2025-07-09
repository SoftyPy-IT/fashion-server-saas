import * as z from 'zod';

export const createExpenseSchema = z.object({
  date: z
    .string({ message: 'Please provide a date' })
    .transform((val) => new Date(val))
    .refine((val) => val instanceof Date && !isNaN(val.getTime()), {
      message: 'Date must be a valid date'
    }),
  reference: z
    .string({
      invalid_type_error: 'Reference must be a string',
      required_error: 'Please provide a reference'
    })
    .min(1),
  category: z
    .string({
      invalid_type_error: 'Category must be a string',
      required_error: 'Please provide a category'
    })
    .refine((value) => /^[a-fA-F0-9]{24}$/.test(value), { message: 'Invalid ObjectId' }),
  amount: z.preprocess((value) => parseFloat(value as string), z.number().positive()),
  note: z.string().min(1).optional()
});

// Schema for updating an existing expense
export const updateExpenseSchema = z.object({
  date: z
    .string({ message: 'Please provide a date' })
    .transform((val) => new Date(val))
    .refine((val) => val instanceof Date && !isNaN(val.getTime()), {
      message: 'Date must be a valid date'
    }),
  reference: z
    .string({
      invalid_type_error: 'Reference must be a string',
      required_error: 'Please provide a reference'
    })
    .min(1)
    .optional(),
  category: z
    .string()
    .refine((value) => /^[a-fA-F0-9]{24}$/.test(value), { message: 'Invalid ObjectId' })
    .optional(),
  amount: z.preprocess(
    (value) => (value ? parseFloat(value as string) : undefined),
    z.number().positive().optional()
  ),
  note: z.string().min(1).optional()
});

export const createExpenseCategorySchema = z.object({
  name: z
    .string({
      invalid_type_error: 'Name must be a string',
      required_error: "Please provide the category's name"
    })
    .min(1, 'Name is required'),
  code: z
    .string({
      invalid_type_error: 'Code must be a string',
      required_error: "Please provide the category's code"
    })
    .min(1, 'Code is required'),
  expenses: z
    .array(
      z.string().refine((value) => /^[a-fA-F0-9]{24}$/.test(value), { message: 'Invalid ObjectId' })
    )
    .optional()
});

// Schema for updating an existing expense category
export const updateExpenseCategorySchema = z.object({
  name: z
    .string({
      invalid_type_error: 'Name must be a string'
    })
    .min(1, 'Name is required')
    .optional(),
  code: z
    .string({
      invalid_type_error: 'Code must be a string'
    })
    .min(1, 'Code is required')
    .optional(),
  expenses: z
    .array(
      z.string().refine((value) => /^[a-fA-F0-9]{24}$/.test(value), { message: 'Invalid ObjectId' })
    )
    .optional()
});
