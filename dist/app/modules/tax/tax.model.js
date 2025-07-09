"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const taxSchema = new mongoose_1.Schema({
    name: {
        type: String,
        required: [true, 'Tax name is required'],
        trim: true
    },
    code: {
        type: String,
        required: [true, 'Tax code is required'],
        trim: true,
        unique: true
    },
    rate: {
        type: Number,
        required: [true, 'Tax rate is required']
    },
    type: {
        type: String,
        required: [true, 'Tax type is required']
    },
    isDeleted: {
        type: Boolean,
        default: false
    },
    deletedAt: {
        type: Date
    }
}, {
    timestamps: true
});
const Tax = (0, mongoose_1.model)('Tax', taxSchema);
exports.default = Tax;
