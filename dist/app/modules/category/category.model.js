"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MainCategory = exports.Category = exports.SubCategory = void 0;
const mongoose_1 = require("mongoose");
const SubCategorySchema = new mongoose_1.Schema({
    name: { type: String, required: true },
    slug: { type: String, required: true },
    category: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Category' }
}, {
    toJSON: { virtuals: true },
    timestamps: true
});
const CategorySchema = new mongoose_1.Schema({
    name: { type: String, required: true },
    image: { type: String },
    slug: { type: String, required: true },
    subCategories: [
        {
            subCategory: { type: mongoose_1.Schema.Types.ObjectId, ref: 'SubCategory' },
            serial: { type: Number, required: true }
        }
    ],
    mainCategory: { type: mongoose_1.Schema.Types.ObjectId, ref: 'MainCategory' },
    isActive: { type: Boolean, default: true }
}, {
    toJSON: { virtuals: true },
    timestamps: true
});
const MainCategorySchema = new mongoose_1.Schema({
    name: { type: String, required: true },
    image: { type: String },
    slug: { type: String, required: true },
    categories: [
        {
            category: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Category' },
            serial: { type: Number, required: true }
        }
    ],
    serial: { type: Number, default: 0 }
}, {
    toJSON: { virtuals: true },
    timestamps: true
});
exports.SubCategory = (0, mongoose_1.model)('SubCategory', SubCategorySchema);
exports.Category = (0, mongoose_1.model)('Category', CategorySchema);
exports.MainCategory = (0, mongoose_1.model)('MainCategory', MainCategorySchema);
