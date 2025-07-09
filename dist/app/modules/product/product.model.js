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
/* eslint-disable no-unused-vars */
const mongoose_1 = require("mongoose");
const productSchema = new mongoose_1.Schema({
    name: { type: String, required: true },
    code: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    barcodeSymbology: {
        type: String,
        enum: ['CODE128', 'CODE39', 'CODE25', 'EAN13', 'EAN8', 'UPC-A', 'UPC-E'],
        required: false
    },
    reviews: [{ type: mongoose_1.Types.ObjectId, ref: 'Review', required: false }],
    brand: { type: mongoose_1.Types.ObjectId, ref: 'Brand', required: false },
    mainCategory: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'MainCategory',
        required: true
    },
    category: { type: mongoose_1.Types.ObjectId, ref: 'Category', required: false },
    subCategory: { type: mongoose_1.Types.ObjectId, ref: 'SubCategory', required: false },
    productUnit: { type: mongoose_1.Types.ObjectId, ref: 'Unit', required: false },
    defaultSaleUnit: { type: mongoose_1.Types.ObjectId, ref: 'Unit', required: false },
    defaultPurchaseUnit: { type: mongoose_1.Types.ObjectId, ref: 'Unit', required: false },
    productCost: { type: Number, required: true },
    price: { type: Number, required: true },
    productTax: { type: mongoose_1.Types.ObjectId, ref: 'Tax', required: false },
    taxMethod: {
        type: String,
        enum: ['Exclusive', 'Inclusive', 'No Tax'],
        required: false,
        default: 'No Tax'
    },
    description: { type: String, required: true },
    short_description: { type: String, required: true },
    thumbnail: {
        type: String,
        required: true
    },
    supplier: { type: mongoose_1.Types.ObjectId, ref: 'Supplier', required: false },
    images: [{ type: String, required: true }],
    discount_price: { type: Number, required: false, default: 0 },
    tags: [{ type: String, required: true }],
    stock: { type: Number, required: false, default: 0 },
    quantity: { type: Number, required: false, default: 0 },
    folder: { type: mongoose_1.Types.ObjectId, ref: 'Folder', required: false },
    is_available: { type: Boolean, required: false, default: true },
    is_featured: { type: Boolean, required: false, default: false },
    is_active: { type: Boolean, required: false, default: true },
    total_sale: { type: Number, required: false, default: 0 },
    rating: { type: Number, required: false, default: 1 },
    faq: [
        {
            question: { type: String, required: true },
            answer: { type: String, required: true }
        }
    ],
    variants: [
        {
            _id: false,
            name: { type: String, required: false },
            values: [
                {
                    _id: false,
                    name: { type: String, required: true },
                    value: { type: String, required: true },
                    quantity: { type: Number, required: false, default: 0 }
                }
            ]
        }
    ],
    hasVariants: { type: Boolean, required: false, default: false },
    meta_title: { type: String, required: false },
    meta_description: { type: String, required: false },
    meta_keywords: [{ type: String, required: false }],
    deletedAt: { type: Date, required: false },
    isDeleted: { type: Boolean, default: false },
    size_chart: {
        type: String,
        required: false
    }
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});
// Define text index for text search on name, description, and tags fields
productSchema.index({ name: 'text', description: 'text', tags: 'text' }, {
    weights: {
        name: 5,
        description: 3,
        tags: 1
    }
});
// Virtuals
productSchema.virtual('total_reviews').get(function () {
    var _a;
    return ((_a = this === null || this === void 0 ? void 0 : this.reviews) === null || _a === void 0 ? void 0 : _a.length) || 0;
});
// is_stockout virtual
productSchema.virtual('is_stockout').get(function () {
    return this.quantity <= 0;
});
// Static method to check if a product exists with the given name
productSchema.statics.isProductExistWithName = function (name) {
    return __awaiter(this, void 0, void 0, function* () {
        const product = yield this.findOne({ name });
        return !!product;
    });
};
const Product = (0, mongoose_1.model)('Product', productSchema);
exports.default = Product;
