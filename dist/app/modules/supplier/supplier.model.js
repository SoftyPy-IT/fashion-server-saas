"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const supplierSchema = new mongoose_1.Schema({
    company: { type: String, required: true },
    name: { type: String, required: true },
    vatNumber: { type: String },
    gstNumber: { type: String },
    phone: { type: String },
    email: { type: String },
    address: { type: String },
    city: { type: String },
    state: { type: String },
    postalCode: { type: String },
    country: { type: String },
    isDeleted: { type: Boolean, default: false },
    deletedAt: { type: Date }
}, {
    timestamps: true
});
const Supplier = (0, mongoose_1.model)('Supplier', supplierSchema);
exports.default = Supplier;
