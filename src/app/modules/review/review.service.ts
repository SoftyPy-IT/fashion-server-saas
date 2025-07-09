import Review from './review.model';
import { IReview } from './review.interface';
import QueryBuilder from '../../builder/QueryBuilder';
import httpStatus from 'http-status';
import AppError from '../../errors/AppError';
import { Request } from 'express';
import Product from '../product/product.model';
import mongoose from 'mongoose';

export const getAllReviews = async (query: Record<string, unknown>): Promise<any> => {
  try {
    const reviewSearchableFields = ['name'];
    const reviewQuery = new QueryBuilder(
      Review.find({})
        .populate('user', 'firstName lastName email avatar role')
        .populate({
          path: 'replies',
          populate: {
            path: 'user',
            select: 'firstName lastName email avatar'
          }
        }),
      query
    )
      .search(reviewSearchableFields)
      .filter()
      .sort()
      .paginate()
      .fields();

    const meta = await reviewQuery.countTotal();
    const result = await reviewQuery.queryModel;

    return { meta, result };
  } catch (error: any) {
    throw new AppError(httpStatus.INTERNAL_SERVER_ERROR, error.message || 'Internal Server Error');
  }
};

export const getReviewById = async (id: string): Promise<IReview | null> => {
  try {
    const review = await Review.findById(id);
    if (!review) {
      throw new AppError(httpStatus.NOT_FOUND, 'This review is not found');
    }
    return review;
  } catch (error: any) {
    throw new AppError(httpStatus.INTERNAL_SERVER_ERROR, error.message || 'Internal Server Error');
  }
};

export const createReview = async (req: Request): Promise<IReview | null> => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { product } = req.body;

    // Create the review
    const result = await Review.create([req.body], { session });

    // Push the review to the product's reviews array
    const productDoc = await Product.findByIdAndUpdate(
      product,
      { $push: { reviews: result[0]._id } },
      { new: true, session }
    ).populate('reviews');

    // Calculate the new average rating
    if (productDoc && productDoc.reviews.length > 0) {
      const totalRating = productDoc.reviews.reduce((sum, review) => sum + review.rating, 0);
      const averageRating = totalRating / productDoc.reviews.length;
      productDoc.rating = averageRating;
      await productDoc.save({ session });
    }

    await session.commitTransaction();
    session.endSession();

    return result[0];
  } catch (error: any) {
    await session.abortTransaction();
    session.endSession();
    throw new AppError(httpStatus.INTERNAL_SERVER_ERROR, error.message || 'Internal Server Error');
  }
};

export const updateReview = async (id: string, req: Request): Promise<IReview | null> => {
  try {
    const review = await Review.findById(id);
    if (!review) {
      throw new AppError(httpStatus.NOT_FOUND, 'This review does not exist');
    }

    const updatedData = req.body;
    const result = await Review.findByIdAndUpdate(id, updatedData, {
      new: true,
      runValidators: true
    });

    return result;
  } catch (error: any) {
    throw new AppError(httpStatus.INTERNAL_SERVER_ERROR, error.message || 'Internal Server Error');
  }
};

export const deleteReview = async (id: string): Promise<void> => {
  try {
    const review = await Review.findById(id);
    if (!review) {
      throw new AppError(httpStatus.NOT_FOUND, 'This review is not found');
    }

    // first delte the review from the product's reviews array
    await Product.findByIdAndUpdate(review.product, { $pull: { reviews: review._id } });

    await Review.deleteReview(id);
  } catch (error: any) {
    throw new AppError(httpStatus.INTERNAL_SERVER_ERROR, error.message || 'Internal Server Error');
  }
};

export const hideReview = async (id: string, isHidden: boolean): Promise<IReview | null> => {
  try {
    const review = await Review.hideReview(id, isHidden);
    if (!review) {
      throw new AppError(httpStatus.NOT_FOUND, 'This review is not found');
    }
    return review;
  } catch (error: any) {
    throw new AppError(httpStatus.INTERNAL_SERVER_ERROR, error.message || 'Internal Server Error');
  }
};

export const addReply = async (reviewId: string, req: Request): Promise<IReview | null> => {
  try {
    const review = await Review.findById(reviewId);
    if (!review) {
      throw new AppError(httpStatus.NOT_FOUND, 'This review is not found');
    }

    const reply = {
      user: req.body.user,
      comment: req.body.comment,
      createdAt: new Date(),
      updatedAt: new Date(),
      isHidden: false
    };

    review.replies.push(reply);
    await review.save();

    return review;
  } catch (error: any) {
    throw new AppError(httpStatus.INTERNAL_SERVER_ERROR, error.message || 'Internal Server Error');
  }
};

export const hideReply = async (
  reviewId: string,
  replyId: string,
  isHidden: boolean
): Promise<IReview | null> => {
  try {
    const review = await Review.hideReply(reviewId, replyId, isHidden);
    if (!review) {
      throw new AppError(httpStatus.NOT_FOUND, 'This review or reply is not found');
    }
    return review;
  } catch (error: any) {
    throw new AppError(httpStatus.INTERNAL_SERVER_ERROR, error.message || 'Internal Server Error');
  }
};

export const deleteReply = async (reviewId: string, replyId: string): Promise<IReview | null> => {
  try {
    const review = await Review.deleteReply(reviewId, replyId);
    if (!review) {
      throw new AppError(httpStatus.NOT_FOUND, 'This review or reply is not found');
    }
    return review;
  } catch (error: any) {
    throw new AppError(httpStatus.INTERNAL_SERVER_ERROR, error.message || 'Internal Server Error');
  }
};

export const reviewService = {
  getAllReviews,
  getReviewById,
  createReview,
  updateReview,
  deleteReview,
  hideReview,
  addReply,
  hideReply,
  deleteReply
};
