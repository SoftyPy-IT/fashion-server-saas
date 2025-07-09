"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.reviewService = exports.deleteReply = exports.hideReply = exports.addReply = exports.hideReview = exports.deleteReview = exports.updateReview = exports.createReview = exports.getReviewById = exports.getAllReviews = void 0;
const review_model_1 = __importDefault(require("./review.model"));
const QueryBuilder_1 = __importDefault(require("../../builder/QueryBuilder"));
const http_status_1 = __importDefault(require("http-status"));
const AppError_1 = __importDefault(require("../../errors/AppError"));
const product_model_1 = __importDefault(require("../product/product.model"));
const mongoose_1 = __importDefault(require("mongoose"));
const getAllReviews = (query) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const reviewSearchableFields = ['name'];
        const reviewQuery = new QueryBuilder_1.default(review_model_1.default.find({})
            .populate('user', 'firstName lastName email avatar role')
            .populate({
            path: 'replies',
            populate: {
                path: 'user',
                select: 'firstName lastName email avatar'
            }
        }), query)
            .search(reviewSearchableFields)
            .filter()
            .sort()
            .paginate()
            .fields();
        const meta = yield reviewQuery.countTotal();
        const result = yield reviewQuery.queryModel;
        return { meta, result };
    }
    catch (error) {
        throw new AppError_1.default(http_status_1.default.INTERNAL_SERVER_ERROR, error.message || 'Internal Server Error');
    }
});
exports.getAllReviews = getAllReviews;
const getReviewById = (id) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const review = yield review_model_1.default.findById(id);
        if (!review) {
            throw new AppError_1.default(http_status_1.default.NOT_FOUND, 'This review is not found');
        }
        return review;
    }
    catch (error) {
        throw new AppError_1.default(http_status_1.default.INTERNAL_SERVER_ERROR, error.message || 'Internal Server Error');
    }
});
exports.getReviewById = getReviewById;
const createReview = (req) => __awaiter(void 0, void 0, void 0, function* () {
    const session = yield mongoose_1.default.startSession();
    session.startTransaction();
    try {
        const { product } = req.body;
        // Create the review
        const result = yield review_model_1.default.create([req.body], { session });
        // Push the review to the product's reviews array
        const productDoc = yield product_model_1.default.findByIdAndUpdate(product, { $push: { reviews: result[0]._id } }, { new: true, session }).populate('reviews');
        // Calculate the new average rating
        if (productDoc && productDoc.reviews.length > 0) {
            const totalRating = productDoc.reviews.reduce((sum, review) => sum + review.rating, 0);
            const averageRating = totalRating / productDoc.reviews.length;
            productDoc.rating = averageRating;
            yield productDoc.save({ session });
        }
        yield session.commitTransaction();
        session.endSession();
        return result[0];
    }
    catch (error) {
        yield session.abortTransaction();
        session.endSession();
        throw new AppError_1.default(http_status_1.default.INTERNAL_SERVER_ERROR, error.message || 'Internal Server Error');
    }
});
exports.createReview = createReview;
const updateReview = (id, req) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const review = yield review_model_1.default.findById(id);
        if (!review) {
            throw new AppError_1.default(http_status_1.default.NOT_FOUND, 'This review does not exist');
        }
        const updatedData = req.body;
        const result = yield review_model_1.default.findByIdAndUpdate(id, updatedData, {
            new: true,
            runValidators: true
        });
        return result;
    }
    catch (error) {
        throw new AppError_1.default(http_status_1.default.INTERNAL_SERVER_ERROR, error.message || 'Internal Server Error');
    }
});
exports.updateReview = updateReview;
const deleteReview = (id) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const review = yield review_model_1.default.findById(id);
        if (!review) {
            throw new AppError_1.default(http_status_1.default.NOT_FOUND, 'This review is not found');
        }
        // first delte the review from the product's reviews array
        yield product_model_1.default.findByIdAndUpdate(review.product, { $pull: { reviews: review._id } });
        yield review_model_1.default.deleteReview(id);
    }
    catch (error) {
        throw new AppError_1.default(http_status_1.default.INTERNAL_SERVER_ERROR, error.message || 'Internal Server Error');
    }
});
exports.deleteReview = deleteReview;
const hideReview = (id, isHidden) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const review = yield review_model_1.default.hideReview(id, isHidden);
        if (!review) {
            throw new AppError_1.default(http_status_1.default.NOT_FOUND, 'This review is not found');
        }
        return review;
    }
    catch (error) {
        throw new AppError_1.default(http_status_1.default.INTERNAL_SERVER_ERROR, error.message || 'Internal Server Error');
    }
});
exports.hideReview = hideReview;
const addReply = (reviewId, req) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const review = yield review_model_1.default.findById(reviewId);
        if (!review) {
            throw new AppError_1.default(http_status_1.default.NOT_FOUND, 'This review is not found');
        }
        const reply = {
            user: req.body.user,
            comment: req.body.comment,
            createdAt: new Date(),
            updatedAt: new Date(),
            isHidden: false
        };
        review.replies.push(reply);
        yield review.save();
        return review;
    }
    catch (error) {
        throw new AppError_1.default(http_status_1.default.INTERNAL_SERVER_ERROR, error.message || 'Internal Server Error');
    }
});
exports.addReply = addReply;
const hideReply = (reviewId, replyId, isHidden) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const review = yield review_model_1.default.hideReply(reviewId, replyId, isHidden);
        if (!review) {
            throw new AppError_1.default(http_status_1.default.NOT_FOUND, 'This review or reply is not found');
        }
        return review;
    }
    catch (error) {
        throw new AppError_1.default(http_status_1.default.INTERNAL_SERVER_ERROR, error.message || 'Internal Server Error');
    }
});
exports.hideReply = hideReply;
const deleteReply = (reviewId, replyId) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const review = yield review_model_1.default.deleteReply(reviewId, replyId);
        if (!review) {
            throw new AppError_1.default(http_status_1.default.NOT_FOUND, 'This review or reply is not found');
        }
        return review;
    }
    catch (error) {
        throw new AppError_1.default(http_status_1.default.INTERNAL_SERVER_ERROR, error.message || 'Internal Server Error');
    }
});
exports.deleteReply = deleteReply;
exports.reviewService = {
    getAllReviews: exports.getAllReviews,
    getReviewById: exports.getReviewById,
    createReview: exports.createReview,
    updateReview: exports.updateReview,
    deleteReview: exports.deleteReview,
    hideReview: exports.hideReview,
    addReply: exports.addReply,
    hideReply: exports.hideReply,
    deleteReply: exports.deleteReply
};
