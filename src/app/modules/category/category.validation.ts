import * as z from 'zod';

const SubCategorySchema = z.object({
  name: z.string(),
  category: z.string().optional(),
  serial: z.number().optional()
});

const CategorySchema = z.object({
  name: z.string(),
  image: z.string().optional()
});

const MainCategorySchema = z.object({
  name: z.string(),
  image: z
    .string({
      required_error: 'Please provide an image'
    })
    .min(1, { message: 'Please provide an image' })
    .optional()
});

export const SubCategoryValidation = SubCategorySchema;
export const CategoryValidation = CategorySchema;
export const MainCategoryValidation = MainCategorySchema;

export const updateCategoryZodSchema = CategorySchema.partial().optional();
export const updateSubCategoryZodSchema = SubCategorySchema.partial().optional();
export const updateMainCategoryZodSchema = MainCategorySchema.partial().optional();
