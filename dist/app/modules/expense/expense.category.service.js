"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.expenseCategoryService = exports.deleteExpenseCategory = exports.updateExpenseCategory = exports.createExpenseCategory = exports.getExpenseCategoryById = exports.getAllExpenseCategories = void 0;
const QueryBuilder_1 = __importDefault(require("../../builder/QueryBuilder"));
const http_status_1 = __importDefault(require("http-status"));
const AppError_1 = __importDefault(require("../../errors/AppError"));
const expense_model_1 = require("./expense.model");
const getAllExpenseCategories = (query) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const categorySearchableFields = ['name', 'code'];
        const categoryQuery = new QueryBuilder_1.default(expense_model_1.ExpenseCategory.find({}), query)
            .search(categorySearchableFields)
            .filter()
            .sort()
            .paginate()
            .fields();
        const meta = yield categoryQuery.countTotal();
        const result = yield categoryQuery.queryModel;
        return { meta, result };
    }
    catch (error) {
        throw new AppError_1.default(http_status_1.default.INTERNAL_SERVER_ERROR, error.message || 'Internal Server Error');
    }
});
exports.getAllExpenseCategories = getAllExpenseCategories;
const getExpenseCategoryById = (id) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const category = yield expense_model_1.ExpenseCategory.findOne({ _id: id }).populate('expenses');
        if (!category) {
            throw new AppError_1.default(http_status_1.default.NOT_FOUND, 'This expense category is not found');
        }
        return category;
    }
    catch (error) {
        throw new AppError_1.default(http_status_1.default.INTERNAL_SERVER_ERROR, error.message || 'Internal Server Error');
    }
});
exports.getExpenseCategoryById = getExpenseCategoryById;
const createExpenseCategory = (req) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { name, code } = req.body;
        const category = yield expense_model_1.ExpenseCategory.findOne({ name, code });
        if (category) {
            throw new AppError_1.default(http_status_1.default.CONFLICT, 'This expense category already exists');
        }
        const result = yield expense_model_1.ExpenseCategory.create(req.body);
        return result;
    }
    catch (error) {
        throw new AppError_1.default(http_status_1.default.INTERNAL_SERVER_ERROR, error.message || 'Internal Server Error');
    }
});
exports.createExpenseCategory = createExpenseCategory;
const updateExpenseCategory = (id, req) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { name, code } = req.body;
        const category = yield expense_model_1.ExpenseCategory.findOne({ _id: id });
        if (!category) {
            throw new AppError_1.default(http_status_1.default.NOT_FOUND, 'This expense category does not exist');
        }
        if (name || code) {
            const categoryExists = yield expense_model_1.ExpenseCategory.findOne({ name, code });
            if (categoryExists) {
                throw new AppError_1.default(http_status_1.default.CONFLICT, 'This expense category already exists');
            }
        }
        const remainingCategoryData = __rest(req.body, []);
        const modifiedUpdatedData = Object.assign({}, remainingCategoryData);
        const result = yield expense_model_1.ExpenseCategory.findByIdAndUpdate(id, modifiedUpdatedData, {
            new: true,
            runValidators: true
        });
        return result;
    }
    catch (error) {
        throw new AppError_1.default(http_status_1.default.INTERNAL_SERVER_ERROR, error.message || 'Internal Server Error');
    }
});
exports.updateExpenseCategory = updateExpenseCategory;
const deleteExpenseCategory = (id) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const category = yield expense_model_1.ExpenseCategory.findOne({ _id: id });
        if (!category) {
            throw new AppError_1.default(http_status_1.default.NOT_FOUND, 'This expense category is not found');
        }
        yield expense_model_1.ExpenseCategory.findByIdAndDelete(id);
        return null;
    }
    catch (error) {
        throw new AppError_1.default(http_status_1.default.INTERNAL_SERVER_ERROR, error.message || 'Internal Server Error');
    }
});
exports.deleteExpenseCategory = deleteExpenseCategory;
exports.expenseCategoryService = {
    getAllExpenseCategories: exports.getAllExpenseCategories,
    getExpenseCategoryById: exports.getExpenseCategoryById,
    createExpenseCategory: exports.createExpenseCategory,
    updateExpenseCategory: exports.updateExpenseCategory,
    deleteExpenseCategory: exports.deleteExpenseCategory
};
