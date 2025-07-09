import { Router } from 'express';
import { reviewController } from './review.controller';
import auth from '../../middlewares/auth';
import validateRequest from '../../middlewares/validateRequest';
import {
  createReviewSchema,
  updateReviewSchema,
  addReplySchema,
  hideReviewOrReplySchema
} from './review.validation';

const router = Router();

router.get('/all', reviewController.getAllReviews);
router.get('/:id', reviewController.getReviewById);

router.post(
  '/create',
  auth('user', 'admin'),
  validateRequest(createReviewSchema),
  reviewController.createReview
);

router.put(
  '/update/:id',
  auth('user', 'admin'),
  validateRequest(updateReviewSchema),
  reviewController.updateReview
);

router.delete('/:id', auth('admin', 'user'), reviewController.deleteReview);

router.patch(
  '/hide/:id',
  auth('admin', 'user'),
  validateRequest(hideReviewOrReplySchema),
  reviewController.hideReview
);

router.post(
  '/reply/:id',
  auth('user', 'admin'),
  validateRequest(addReplySchema),
  reviewController.addReply
);

router.patch(
  '/reply/:reviewId/hide/:replyId',
  auth('admin', 'user'),
  validateRequest(hideReviewOrReplySchema),
  reviewController.hideReply
);

router.delete('/reply/:reviewId/:replyId', auth('admin', 'user'), reviewController.deleteReply);

export const reviewRoutes = router;
