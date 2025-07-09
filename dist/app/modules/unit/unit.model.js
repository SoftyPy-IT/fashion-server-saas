"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
// Define the unit schema
const unitSchema = new mongoose_1.Schema({
    unit_code: {
        type: String,
        required: true,
        trim: true
    },
    name: {
        type: String,
        required: true,
        trim: true
    },
    base_unit: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'Unit'
    },
    operator: {
        type: String,
        enum: ['*', '/', '+', '-']
    },
    operation_value: {
        type: Number
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
// Create the model from the schema
const Unit = (0, mongoose_1.model)('Unit', unitSchema);
exports.default = Unit;
