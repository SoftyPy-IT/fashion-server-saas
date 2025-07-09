import * as z from 'zod';

export const createOffersSchema = z.object({
  title: z
    .string({
      required_error: 'Please provide an offer title',
      invalid_type_error: 'Title should be a string'
    })
    .min(3, { message: "Title can't be less than 3 characters" })
    .max(50, { message: "Title can't be more than 50 characters" }),

  subTitle: z
    .string({
      required_error: 'Please provide an offer subTitle',
      invalid_type_error: 'SubTitle should be a string'
    })
    .min(3, { message: "SubTitle can't be less than 3 characters" })
    .max(50, { message: "SubTitle can't be more than 50 characters" }),

  startDate: z.string({
    required_error: 'Please provide an offer startDate',
    invalid_type_error: 'startDate should be a string'
  }),
  endDate: z.string({
    required_error: 'Please provide an offer endDate',
    invalid_type_error: 'endDate should be a string'
  }),

  products: z
    .array(
      z.string({
        required_error: 'Please provide offer products',
        invalid_type_error: 'products should be a string'
      }),
      {
        required_error: 'Please provide offer products'
      }
    )
    .min(1, { message: 'Please provide at least one product' })
});

export const updateOffersSchema = z.object({
  title: z
    .string({
      invalid_type_error: 'Title should be a string'
    })
    .min(3, { message: "Title can't be less than 3 characters" })
    .max(20, { message: "Title can't be more than 20 characters" })
    .optional(),

  subTitle: z
    .string({
      invalid_type_error: 'SubTitle should be a string'
    })
    .min(3, { message: "SubTitle can't be less than 3 characters" })
    .max(50, { message: "SubTitle can't be more than 50 characters" })
    .optional(),

  startDate: z
    .string({
      invalid_type_error: 'startDate should be a string'
    })
    .optional(),

  endDate: z
    .string({
      invalid_type_error: 'endDate should be a string'
    })
    .optional(),

  products: z
    .array(
      z.string({
        invalid_type_error: 'products should be a string'
      })
    )
    .optional(),
  productId: z.string().optional(),
  action: z.string().optional()
});
