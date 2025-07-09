import * as z from 'zod';

const imageSchema = z.object({
  desktop: z
    .array(
      z.object({
        url: z.string({
          required_error: 'Desktop image URL must be a string'
        }),
        link: z.string({
          required_error: 'Desktop image link must be a string'
        })
      })
    )
    .optional(),
  mobile: z
    .array(
      z.object({
        url: z.string({
          required_error: 'Mobile image URL must be a string'
        }),
        link: z.string({
          required_error: 'Mobile image link must be a string'
        })
      })
    )
    .optional()
});

export const createSectionSchema = z.object({
  title: z
    .string({
      required_error: 'Section must have a title',
      invalid_type_error: 'Section title must be a string'
    })
    .optional(),
  subTitle: z
    .string({
      required_error: 'Section must have a subTitle',
      invalid_type_error: 'Section subTitle must be a string'
    })
    .optional(),
  description: z
    .string({
      invalid_type_error: 'Section description must be a string'
    })
    .optional(),
  image: z
    .string({
      invalid_type_error: 'Section imageUrl must be a string'
    })
    .nullable()
    .optional(),
  images: imageSchema.optional(),
  products: z
    .array(
      z.string({
        required_error: 'Section must have products',
        invalid_type_error: 'Section products must be an array of strings'
      })
    )
    .min(1, 'Section must have at least one product')
    .optional(),
  style: z.enum(['grid', 'carousel']).default('carousel').optional(),
  row: z.number().default(4).optional()
});

export const updateSectionSchema = z.object({
  title: z.string().optional(),
  subTitle: z.string().optional(),
  description: z.string().optional(),
  image: z.string().nullable().optional(),
  images: imageSchema.optional(),
  products: z.array(z.string()).optional(),
  style: z.enum(['grid', 'carousel']).optional(),
  row: z.number().optional()
});
