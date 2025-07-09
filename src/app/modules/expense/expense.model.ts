import { ObjectId, Schema, model } from 'mongoose';
import { IExpense, IExpenseModel, IExpenseCategory } from './expense.interface';

const expenseSchema = new Schema<IExpense, IExpenseModel>({
  date: { type: Date, required: true },
  reference: { type: String, required: true },
  category: { type: Schema.Types.ObjectId, ref: 'ExpenseCategory', required: true },
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
expenseSchema.statics.findExpensesByCategory = function (categoryId: ObjectId) {
  return this.find({ category: categoryId });
};

// Expense Model
const Expense = model<IExpense, IExpenseModel>('Expense', expenseSchema);

// Expense Category Schema
const expenseCategorySchema = new Schema<IExpenseCategory>({
  name: { type: String, required: true, unique: true },
  code: { type: String, required: true, unique: true },
  expenses: [{ type: Schema.Types.ObjectId, ref: 'Expense' }],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Expense Category Model
const ExpenseCategory = model<IExpenseCategory>('ExpenseCategory', expenseCategorySchema);

export { Expense, ExpenseCategory };
