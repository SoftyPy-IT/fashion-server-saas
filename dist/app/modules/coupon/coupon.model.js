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
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const couponSchema = new mongoose_1.Schema({
    name: { type: String, required: true },
    code: { type: String, required: true, unique: true, trim: true },
    discount: { type: Number, required: true },
    discountType: { type: String, enum: ['percentage', 'flat'], required: true },
    expiryDate: { type: String, required: true },
    isActive: { type: Boolean, default: true },
    limit: { type: Number, default: 50 },
    totalUsed: { type: Number, default: 0 }
}, {
    timestamps: true
});
couponSchema.statics.findActiveCoupons = function () {
    return __awaiter(this, void 0, void 0, function* () {
        return this.find({ isActive: true, expiryDate: { $gt: new Date() } });
    });
};
couponSchema.statics.applyCoupon = function (userId, orderId, code) {
    return __awaiter(this, void 0, void 0, function* () {
        const coupon = yield this.findOne({
            code,
            isActive: true,
            expiryDate: { $gt: new Date().toISOString() }
        });
        if (coupon) {
            coupon.totalUsed += 1;
            coupon.users.push(userId);
            coupon.orders.push(orderId);
            yield coupon.save();
        }
        return coupon;
    });
};
const Coupon = (0, mongoose_1.model)('Coupon', couponSchema);
exports.default = Coupon;
