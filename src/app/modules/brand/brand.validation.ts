import * as z from 'zod';

export const createBrandSchema = z.object({
  name: z
    .string({
      required_error: 'Name is required',
      invalid_type_error: 'Name must be a string'
    })
    .min(3, 'Name must be at least 3 characters')
    .max(100, 'Name must be at most 100 characters'),
  image: z
    .string({
      required_error: 'Image is required',
      invalid_type_error: 'Image must be a string'
    })
    .refine((value) => value.startsWith('http'), {
      message: 'Image must be a valid URL'
    }),
  description: z
    .string({
      required_error: 'Description is required',
      invalid_type_error: 'Description must be a string'
    })
    .min(10, 'Description must be at least 10 characters')
    .max(255, 'Description must be at most 255 characters')
});

export const updateBrandSchema = z.object({
  name: z
    .string({
      required_error: 'Name is required',
      invalid_type_error: 'Name must be a string'
    })
    .min(3, 'Name must be at least 3 characters')
    .max(100, 'Name must be at most 100 characters')
    .optional(),

  image: z
    .string({
      required_error: 'Image is required',
      invalid_type_error: 'Image must be a string'
    })
    .refine((value) => value.startsWith('http'), {
      message: 'Image must be a valid URL'
    })
    .optional(),
  description: z
    .string({
      required_error: 'Description is required',
      invalid_type_error: 'Description must be a string'
    })
    .min(10, 'Description must be at least 10 characters')
    .max(255, 'Description must be at most 255 characters')
    .optional()
});
