"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const comboSchema = new mongoose_1.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    code: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    slug: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    items: [
        {
            type: mongoose_1.Schema.Types.ObjectId,
            ref: 'Product'
        }
    ],
    price: {
        type: Number,
        required: true
    },
    discount_price: {
        type: Number,
        required: false,
        default: 0
    },
    description: {
        type: String,
        required: true,
        trim: true
    },
    short_description: {
        type: String,
        required: true,
        trim: true
    },
    thumbnail: {
        type: String,
        required: true
    },
    images: [
        {
            type: String
        }
    ],
    reviews: [
        {
            type: mongoose_1.Schema.Types.ObjectId,
            ref: 'Review'
        }
    ],
    rating: {
        type: Number,
        default: 0
    },
    faq: [
        {
            question: {
                type: String,
                required: true,
                trim: true
            },
            answer: {
                type: String,
                required: true,
                trim: true
            }
        }
    ],
    meta_title: { type: String, required: false },
    meta_description: { type: String, required: false },
    meta_keywords: [{ type: String, required: false }],
    is_active: {
        type: Boolean,
        default: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    },
    deletedAt: {
        type: Date,
        default: null
    },
    isDeleted: {
        type: Boolean,
        default: false
    }
});
comboSchema.pre('save', function (next) {
    this.slug = this.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    next();
});
const Combo = (0, mongoose_1.model)('Combo', comboSchema);
exports.default = Combo;
