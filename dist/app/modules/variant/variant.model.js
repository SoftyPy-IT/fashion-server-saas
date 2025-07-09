"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const VariantItemSchema = new mongoose_1.Schema({
    name: { type: String, required: true },
    value: { type: String, required: true }
}, { _id: false });
const variantSchema = new mongoose_1.Schema({
    name: {
        type: String,
        required: true,
        unique: true
    },
    items: [VariantItemSchema],
    isDeleted: {
        type: Boolean,
        default: false
    },
    deletedAt: {
        type: Date,
        default: null
    }
}, {
    timestamps: true
});
variantSchema.pre('save', function (next) {
    this.updatedAt = new Date();
    next();
});
const Variant = (0, mongoose_1.model)('Variant', variantSchema);
exports.default = Variant;
