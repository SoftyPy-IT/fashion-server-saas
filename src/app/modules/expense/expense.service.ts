import { Expense, ExpenseCategory } from './expense.model';

import { IExpense } from './expense.interface';
import QueryBuilder from '../../builder/QueryBuilder';
import httpStatus from 'http-status';
import AppError from '../../errors/AppError';
import { Request } from 'express';
import mongoose from 'mongoose';
import { attachDocumentToQuotations } from '../quotations/quotations.service';
import { deleteAttachment } from '../../utils/cloudinary';
import { ImageGalleryModel } from '../image-gallery/image-gallery.model';

export const getAllExpense = async (query: Record<string, unknown>): Promise<any> => {
  try {
    const expenseSearchableFields = ['name'];

    const expenseQuery = new QueryBuilder(Expense.find({}), query)
      .search(expenseSearchableFields)
      .filter()
      .sort()
      .paginate()
      .fields();

    const meta = await expenseQuery.countTotal();
    const result = await expenseQuery.queryModel;

    return { meta, result };
  } catch (error: any) {
    throw new AppError(httpStatus.INTERNAL_SERVER_ERROR, error.message || 'Internal Server Error');
  }
};

export const getExpenseById = async (id: string): Promise<IExpense | null> => {
  try {
    const expense = await Expense.findOne({ _id: id });
    if (!expense) {
      throw new AppError(httpStatus.NOT_FOUND, 'This expense is not found');
    }
    return expense;
  } catch (error: any) {
    throw new AppError(httpStatus.INTERNAL_SERVER_ERROR, error.message || 'Internal Server Error');
  }
};

export const createExpense = async (req: Request): Promise<IExpense | null> => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const { category, ...expenseData } = req.body;

    // check if the category exists
    const categoryExists = await ExpenseCategory.findOne({ _id: category });
    if (!categoryExists) {
      throw new AppError(httpStatus.NOT_FOUND, 'This category does not exist');
    }

    // attachDocument is a file, so we need to check if it exists
    if (req.file) {
      expenseData.attachDocument = await attachDocumentToQuotations(req);
    }

    // Create the expense
    const expense = await Expense.create([{ ...expenseData, category }], { session });

    // Update the related expense category
    await ExpenseCategory.findByIdAndUpdate(
      category,
      { $push: { expenses: expense[0]._id } },
      { session }
    );

    await session.commitTransaction();
    return expense[0];
  } catch (error: any) {
    await session.abortTransaction();
    throw new AppError(httpStatus.INTERNAL_SERVER_ERROR, error.message || 'Internal Server Error');
  } finally {
    session.endSession();
  }
};

export const updateExpense = async (id: string, req: Request): Promise<IExpense | null> => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const expense = await Expense.findOne({ _id: id }).session(session);
    if (!expense) {
      throw new AppError(httpStatus.NOT_FOUND, 'This expense does not exist');
    }

    const { category, ...updatedData } = req.body;

    // check if the category exists
    if (category) {
      const categoryExists = await ExpenseCategory.findOne({ _id: category });
      if (!categoryExists) {
        throw new AppError(httpStatus.NOT_FOUND, 'This category does not exist');
      }
    }

    // attachDocument is a file, so we need to check if it exists
    if (req.file) {
      const image = await ImageGalleryModel.findOne({ url: expense.attachDocument });

      if (image) {
        await deleteAttachment(image.public_id);
      }

      updatedData.attachDocument = await attachDocumentToQuotations(req);
    }

    if (category && category !== expense.category.toString()) {
      // Remove the expense from the old category
      await ExpenseCategory.findByIdAndUpdate(
        expense.category,
        { $pull: { expenses: expense._id } },
        { session }
      );

      // Add the expense to the new category
      await ExpenseCategory.findByIdAndUpdate(
        category,
        { $push: { expenses: expense._id } },
        { session }
      );

      // Update the category in the expense document
      updatedData.category = category;
    }

    const updatedExpense = await Expense.findByIdAndUpdate(id, updatedData, {
      new: true,
      runValidators: true,
      session
    });

    await session.commitTransaction();
    return updatedExpense;
  } catch (error: any) {
    await session.abortTransaction();
    throw new AppError(httpStatus.INTERNAL_SERVER_ERROR, error.message || 'Internal Server Error');
  } finally {
    session.endSession();
  }
};

export const deleteExpense = async (id: string): Promise<void | null> => {
  try {
    const expense = await Expense.findOne({ _id: id });
    if (!expense) {
      throw new AppError(httpStatus.NOT_FOUND, 'This expense is not found');
    }

    const image = await ImageGalleryModel.findOne({ url: expense.attachDocument });

    if (image) {
      await deleteAttachment(image.public_id);
    }
    await Expense.findByIdAndDelete(id);

    return null;
  } catch (error: any) {
    throw new AppError(httpStatus.INTERNAL_SERVER_ERROR, error.message || 'Internal Server Error');
  }
};

export const expenseService = {
  getAllExpense,
  getExpenseById,
  createExpense,
  updateExpense,
  deleteExpense
};
