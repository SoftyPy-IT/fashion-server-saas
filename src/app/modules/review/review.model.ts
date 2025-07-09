import mongoose, { Schema } from 'mongoose';
import { IReview, IReply, IReviewModel } from './review.interface';

const replySchema = new Schema<IReply>({
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  comment: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  isHidden: { type: Boolean, default: false }
});

const reviewSchema = new Schema<IReview>({
  rating: { type: Number, required: true },
  comment: { type: String, required: true },
  product: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  replies: [replySchema],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  isHidden: { type: Boolean, default: false }
});

reviewSchema.statics.hideReview = async function (reviewId, isHidden) {
  return this.findByIdAndUpdate(reviewId, { isHidden }, { new: true });
};

reviewSchema.statics.hideReply = async function (reviewId, replyId, isHidden) {
  return this.findOneAndUpdate(
    { _id: reviewId, 'replies._id': replyId },
    { 'replies.$.isHidden': isHidden },
    { new: true }
  );
};

reviewSchema.statics.deleteReview = async function (reviewId) {
  return this.findByIdAndDelete(reviewId);
};

reviewSchema.statics.deleteReply = async function (reviewId, replyId) {
  return this.findByIdAndUpdate(reviewId, { $pull: { replies: { _id: replyId } } }, { new: true });
};

const Review = mongoose.model<IReview, IReviewModel>('Review', reviewSchema);

export default Review;
