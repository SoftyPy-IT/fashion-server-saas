/* eslint-disable no-unused-vars */
import { Document, Model, ObjectId } from 'mongoose';

export interface IExpenseCategory extends Document {
  name: string;
  code: string;
  expenses?: ObjectId[];
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IExpense extends Document {
  date: Date;
  reference: string;
  category: ObjectId;
  amount: number;
  attachDocument?: {
    url: string;
    publicId: string;
  };
  note: string;
  createdAt?: Date;
  updatedAt?: Date;
}

// Interface for Expense Model with custom methods
export interface IExpenseModel extends Model<IExpense> {
  findExpensesByCategory(categoryId: ObjectId): Promise<IExpense[]>;
}
