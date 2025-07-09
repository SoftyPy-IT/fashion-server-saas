import * as z from 'zod';

export const createReviewSchema = z.object({
  rating: z.number().min(1).max(5),
  comment: z.string().min(1),
  product: z.string().min(1),
  user: z.string().min(1)
});

export const updateReviewSchema = z.object({
  rating: z.number().min(1).max(5).optional(),
  comment: z.string().min(1).optional(),
  isHidden: z.boolean().optional()
});

export const addReplySchema = z.object({
  user: z.string().min(1),
  comment: z.string().min(1)
});

export const hideReviewOrReplySchema = z.object({
  isHidden: z.boolean()
});
