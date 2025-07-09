"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ExpenseCategory = exports.Expense = void 0;
const mongoose_1 = require("mongoose");
const expenseSchema = new mongoose_1.Schema({
    date: { type: Date, required: true },
    reference: { type: String, required: true },
    category: { type: mongoose_1.Schema.Types.ObjectId, ref: 'ExpenseCategory', required: true },
    amount: { type: Number, required: true },
    attachDocument: {
        url: { type: String, required: false },
        publicId: { type: String, required: false }
    },
    note: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});
// Custom method to find expenses by category
expenseSchema.statics.findExpensesByCategory = function (categoryId) {
    return this.find({ category: categoryId });
};
// Expense Model
const Expense = (0, mongoose_1.model)('Expense', expenseSchema);
exports.Expense = Expense;
// Expense Category Schema
const expenseCategorySchema = new mongoose_1.Schema({
    name: { type: String, required: true, unique: true },
    code: { type: String, required: true, unique: true },
    expenses: [{ type: mongoose_1.Schema.Types.ObjectId, ref: 'Expense' }],
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});
// Expense Category Model
const ExpenseCategory = (0, mongoose_1.model)('ExpenseCategory', expenseCategorySchema);
exports.ExpenseCategory = ExpenseCategory;
