"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importStar(require("mongoose"));
const replySchema = new mongoose_1.Schema({
    user: { type: mongoose_1.Schema.Types.ObjectId, ref: 'User', required: true },
    comment: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
    isHidden: { type: Boolean, default: false }
});
const reviewSchema = new mongoose_1.Schema({
    rating: { type: Number, required: true },
    comment: { type: String, required: true },
    product: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Product', required: true },
    user: { type: mongoose_1.Schema.Types.ObjectId, ref: 'User', required: true },
    replies: [replySchema],
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
    isHidden: { type: Boolean, default: false }
});
reviewSchema.statics.hideReview = function (reviewId, isHidden) {
    return __awaiter(this, void 0, void 0, function* () {
        return this.findByIdAndUpdate(reviewId, { isHidden }, { new: true });
    });
};
reviewSchema.statics.hideReply = function (reviewId, replyId, isHidden) {
    return __awaiter(this, void 0, void 0, function* () {
        return this.findOneAndUpdate({ _id: reviewId, 'replies._id': replyId }, { 'replies.$.isHidden': isHidden }, { new: true });
    });
};
reviewSchema.statics.deleteReview = function (reviewId) {
    return __awaiter(this, void 0, void 0, function* () {
        return this.findByIdAndDelete(reviewId);
    });
};
reviewSchema.statics.deleteReply = function (reviewId, replyId) {
    return __awaiter(this, void 0, void 0, function* () {
        return this.findByIdAndUpdate(reviewId, { $pull: { replies: { _id: replyId } } }, { new: true });
    });
};
const Review = mongoose_1.default.model('Review', reviewSchema);
exports.default = Review;
