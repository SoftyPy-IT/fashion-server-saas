"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const offersSchema = new mongoose_1.Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    subTitle: {
        type: String,
        required: true,
        trim: true
    },
    startDate: {
        type: Date,
        required: true
    },
    endDate: {
        type: Date,
        required: true
    },
    products: [
        {
            type: mongoose_1.Schema.Types.ObjectId,
            ref: 'Product'
        }
    ],
    status: {
        type: String,
        enum: ['active', 'inactive'],
        default: 'active'
    }
}, {
    timestamps: true
});
const Offers = (0, mongoose_1.model)('Offers', offersSchema);
exports.default = Offers;
