import * as z from 'zod';

export const createVariantSchema = z.object({
  name: z.string({
    required_error: 'You must provide a variant name',
    invalid_type_error: 'Variant name must be a string'
  }),
  items: z
    .array(
      z.object({
        name: z.string({
          required_error: 'You must provide a variant item name',
          invalid_type_error: 'Variant item name must be a string'
        }),
        value: z.string({
          required_error: 'You must provide a variant item value',
          invalid_type_error: 'Variant item value must be a string'
        })
      }),
      {
        required_error: 'You must provide at least one variant item'
      }
    )
    .min(1, 'You must provide at least one variant item')
});

export const updateVariantSchema = z.object({
  name: z
    .string({
      required_error: 'You must provide a variant name',
      invalid_type_error: 'Variant name must be a string'
    })
    .optional(),
  items: z
    .array(
      z.object({
        name: z.string({
          required_error: 'You must provide a variant item name',
          invalid_type_error: 'Variant item name must be a string'
        }),
        value: z.string({
          required_error: 'You must provide a variant item value',
          invalid_type_error: 'Variant item value must be a string'
        })
      })
    )
    .min(1, 'You must provide at least one variant item')
    .optional()
});
