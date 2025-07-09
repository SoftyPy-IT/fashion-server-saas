import * as z from 'zod';

export const createComboSchema = z.object({
  items: z.array(
    z.string({
      required_error: 'Items is required'
    }),
    {
      required_error: 'Items is required'
    }
  ),
  price: z.number({
    required_error: 'Price is required'
  }),
  description: z.string({
    required_error: 'Description is required'
  }),
  short_description: z.string({
    required_error: 'Short description is required'
  }),
  thumbnail: z.string({
    required_error: 'Thumbnail is required'
  }),
  images: z.array(
    z.string({
      required_error: 'Images is required'
    })
  )
});

export const updateComboSchema = z.object({
  // Define updateCombo schema properties here
});
