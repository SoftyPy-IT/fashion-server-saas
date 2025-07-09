"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const QuantitySchema = new mongoose_1.Schema({
    date: { type: Date, required: true },
    referenceNo: { type: String, required: true },
    attachDocument: { type: String, required: false },
    products: [
        {
            productId: { type: mongoose_1.Schema.Types.ObjectId, required: true },
            productName: { type: String, required: true },
            productCode: { type: String, required: true },
            type: { type: String, enum: ['Subtraction', 'Addition'], required: true },
            quantity: { type: Number, required: true },
            serialNumber: { type: String, required: false },
            variant: {
                name: { type: String, required: false },
                value: { type: String, required: false }
            }
        }
    ],
    note: { type: String, required: true }
}, {
    timestamps: true
});
const Quantity = (0, mongoose_1.model)('Quantity', QuantitySchema);
exports.default = Quantity;
