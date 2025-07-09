import { Router } from 'express';
import { expenseController } from './expense.controller';
import { expenseCategoryController } from './expense.category.controller';
import auth from '../../middlewares/auth';
import validateRequest from '../../middlewares/validateRequest';
import {
  createExpenseCategorySchema,
  updateExpenseCategorySchema,
  createExpenseSchema,
  updateExpenseSchema
} from './expense.validation';
import { upload } from '../../utils/cloudinary';

const router = Router();

// Expense Routes
router.get('/all', auth('admin'), expenseController.getAllExpense);
router.get('/:id', auth('admin'), expenseController.getExpenseById);
router.post(
  '/create',
  auth('admin'),
  upload.single('attachDocument'),
  validateRequest(createExpenseSchema),
  expenseController.createExpense
);
router.put(
  '/update/:id',
  auth('admin'),
  upload.single('attachDocument'),
  validateRequest(updateExpenseSchema),
  expenseController.updateExpense
);
router.delete('/:id', auth('admin'), expenseController.deleteExpense);

// Expense Category Routes
router.get(
  '/expense-categories/all',
  auth('admin'),
  expenseCategoryController.getAllExpenseCategories
);
router.get(
  '/expense-categories/:id',
  auth('admin'),
  expenseCategoryController.getExpenseCategoryById
);
router.post(
  '/expense-categories/create',
  auth('admin'),
  validateRequest(createExpenseCategorySchema),
  expenseCategoryController.createExpenseCategory
);
router.put(
  '/expense-categories/update/:id',
  auth('admin'),
  validateRequest(updateExpenseCategorySchema),
  expenseCategoryController.updateExpenseCategory
);
router.delete(
  '/expense-categories/:id',
  auth('admin'),
  expenseCategoryController.deleteExpenseCategory
);

export const expenseRoutes = router;
