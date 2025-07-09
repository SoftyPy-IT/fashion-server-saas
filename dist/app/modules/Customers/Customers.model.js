"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const CustomersSchema = new mongoose_1.Schema({
    company: { type: String, required: true },
    name: { type: String, required: true },
    vatNumber: { type: String },
    gstNumber: { type: String },
    email: { type: String, required: true },
    phone: { type: String, required: true },
    address: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String },
    postalCode: { type: String },
    country: { type: String, required: true },
    isDeleted: { type: Boolean, default: false },
    deletedAt: { type: Date }
}, {
    timestamps: true
});
const Customers = (0, mongoose_1.model)('Customers', CustomersSchema);
exports.default = Customers;
