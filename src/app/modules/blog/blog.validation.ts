import * as z from 'zod';

export const createBlogSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().min(1, 'Description is required'),
  thumbnail: z.string().url('Thumbnail must be a valid URL'),
  content: z.string().min(1, 'Content is required'),
  category: z.string().min(1, 'Category is required')
});

export const updateBlogSchema = z.object({
  // Define updateBlog schema properties here
});
