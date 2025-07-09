/* eslint-disable no-unused-vars */
// review.interface.ts
import { Document, Model, Types } from 'mongoose';

export interface IReply extends Document {
  user: Types.ObjectId;
  comment: string;
  createdAt: Date;
  updatedAt: Date;
  isHidden: boolean;
}

export interface IReview extends Document {
  rating: number;
  comment: string;
  product: Types.ObjectId;
  user: Types.ObjectId;
  replies: Types.DocumentArray<IReply>;
  createdAt: Date;
  updatedAt: Date;
  isHidden: boolean;
}

export interface IReviewModel extends Model<IReview> {
  hideReview(reviewId: string, isHidden: boolean): Promise<IReview | null>;
  hideReply(reviewId: string, replyId: string, isHidden: boolean): Promise<IReview | null>;
  deleteReview(reviewId: string): Promise<void>;
  deleteReply(reviewId: string, replyId: string): Promise<IReview | null>;
}
