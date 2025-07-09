"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const StockSchema = new mongoose_1.Schema({
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    reference: { type: String, required: true },
    type: { type: String, enum: ['Partial', 'Full'], required: true },
    brands: [{ type: mongoose_1.Schema.Types.ObjectId, ref: 'Brand' }],
    categories: [{ type: mongoose_1.Schema.Types.ObjectId, ref: 'Category' }],
    initialStockCSV: {
        url: { type: String, required: false },
        publicId: { type: String, required: false }
    },
    finalStockCSV: {
        url: { type: String, required: false },
        publicId: { type: String, required: false }
    },
    isFinalCalculation: { type: Boolean, required: true, default: false },
    counts: [
        {
            no: {
                type: Number,
                required: false,
                default: 0
            },
            description: { type: String, required: false, default: '' },
            expected: { type: Number, required: false, default: 0 },
            counted: { type: Number, required: false, default: 0 },
            difference: { type: Number, required: false, default: 0 },
            cost: { type: Number, required: false, default: 0 }
        }
    ],
    note: { type: String }
}, {
    timestamps: true
});
const Stock = (0, mongoose_1.model)('Stock', StockSchema);
exports.default = Stock;
