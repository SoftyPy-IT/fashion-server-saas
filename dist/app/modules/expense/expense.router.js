"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.expenseRoutes = void 0;
const express_1 = require("express");
const expense_controller_1 = require("./expense.controller");
const expense_category_controller_1 = require("./expense.category.controller");
const auth_1 = __importDefault(require("../../middlewares/auth"));
const validateRequest_1 = __importDefault(require("../../middlewares/validateRequest"));
const expense_validation_1 = require("./expense.validation");
const cloudinary_1 = require("../../utils/cloudinary");
const router = (0, express_1.Router)();
// Expense Routes
router.get('/all', (0, auth_1.default)('admin'), expense_controller_1.expenseController.getAllExpense);
router.get('/:id', (0, auth_1.default)('admin'), expense_controller_1.expenseController.getExpenseById);
router.post('/create', (0, auth_1.default)('admin'), cloudinary_1.upload.single('attachDocument'), (0, validateRequest_1.default)(expense_validation_1.createExpenseSchema), expense_controller_1.expenseController.createExpense);
router.put('/update/:id', (0, auth_1.default)('admin'), cloudinary_1.upload.single('attachDocument'), (0, validateRequest_1.default)(expense_validation_1.updateExpenseSchema), expense_controller_1.expenseController.updateExpense);
router.delete('/:id', (0, auth_1.default)('admin'), expense_controller_1.expenseController.deleteExpense);
// Expense Category Routes
router.get('/expense-categories/all', (0, auth_1.default)('admin'), expense_category_controller_1.expenseCategoryController.getAllExpenseCategories);
router.get('/expense-categories/:id', (0, auth_1.default)('admin'), expense_category_controller_1.expenseCategoryController.getExpenseCategoryById);
router.post('/expense-categories/create', (0, auth_1.default)('admin'), (0, validateRequest_1.default)(expense_validation_1.createExpenseCategorySchema), expense_category_controller_1.expenseCategoryController.createExpenseCategory);
router.put('/expense-categories/update/:id', (0, auth_1.default)('admin'), (0, validateRequest_1.default)(expense_validation_1.updateExpenseCategorySchema), expense_category_controller_1.expenseCategoryController.updateExpenseCategory);
router.delete('/expense-categories/:id', (0, auth_1.default)('admin'), expense_category_controller_1.expenseCategoryController.deleteExpenseCategory);
exports.expenseRoutes = router;
