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
exports.expenseService = exports.deleteExpense = exports.updateExpense = exports.createExpense = exports.getExpenseById = exports.getAllExpense = void 0;
const expense_model_1 = require("./expense.model");
const QueryBuilder_1 = __importDefault(require("../../builder/QueryBuilder"));
const http_status_1 = __importDefault(require("http-status"));
const AppError_1 = __importDefault(require("../../errors/AppError"));
const mongoose_1 = __importDefault(require("mongoose"));
const quotations_service_1 = require("../quotations/quotations.service");
const cloudinary_1 = require("../../utils/cloudinary");
const image_gallery_model_1 = require("../image-gallery/image-gallery.model");
const getAllExpense = (query) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const expenseSearchableFields = ['name'];
        const expenseQuery = new QueryBuilder_1.default(expense_model_1.Expense.find({}), query)
            .search(expenseSearchableFields)
            .filter()
            .sort()
            .paginate()
            .fields();
        const meta = yield expenseQuery.countTotal();
        const result = yield expenseQuery.queryModel;
        return { meta, result };
    }
    catch (error) {
        throw new AppError_1.default(http_status_1.default.INTERNAL_SERVER_ERROR, error.message || 'Internal Server Error');
    }
});
exports.getAllExpense = getAllExpense;
const getExpenseById = (id) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const expense = yield expense_model_1.Expense.findOne({ _id: id });
        if (!expense) {
            throw new AppError_1.default(http_status_1.default.NOT_FOUND, 'This expense is not found');
        }
        return expense;
    }
    catch (error) {
        throw new AppError_1.default(http_status_1.default.INTERNAL_SERVER_ERROR, error.message || 'Internal Server Error');
    }
});
exports.getExpenseById = getExpenseById;
const createExpense = (req) => __awaiter(void 0, void 0, void 0, function* () {
    const session = yield mongoose_1.default.startSession();
    session.startTransaction();
    try {
        const _a = req.body, { category } = _a, expenseData = __rest(_a, ["category"]);
        // check if the category exists
        const categoryExists = yield expense_model_1.ExpenseCategory.findOne({ _id: category });
        if (!categoryExists) {
            throw new AppError_1.default(http_status_1.default.NOT_FOUND, 'This category does not exist');
        }
        // attachDocument is a file, so we need to check if it exists
        if (req.file) {
            expenseData.attachDocument = yield (0, quotations_service_1.attachDocumentToQuotations)(req);
        }
        // Create the expense
        const expense = yield expense_model_1.Expense.create([Object.assign(Object.assign({}, expenseData), { category })], { session });
        // Update the related expense category
        yield expense_model_1.ExpenseCategory.findByIdAndUpdate(category, { $push: { expenses: expense[0]._id } }, { session });
        yield session.commitTransaction();
        return expense[0];
    }
    catch (error) {
        yield session.abortTransaction();
        throw new AppError_1.default(http_status_1.default.INTERNAL_SERVER_ERROR, error.message || 'Internal Server Error');
    }
    finally {
        session.endSession();
    }
});
exports.createExpense = createExpense;
const updateExpense = (id, req) => __awaiter(void 0, void 0, void 0, function* () {
    const session = yield mongoose_1.default.startSession();
    session.startTransaction();
    try {
        const expense = yield expense_model_1.Expense.findOne({ _id: id }).session(session);
        if (!expense) {
            throw new AppError_1.default(http_status_1.default.NOT_FOUND, 'This expense does not exist');
        }
        const _b = req.body, { category } = _b, updatedData = __rest(_b, ["category"]);
        // check if the category exists
        if (category) {
            const categoryExists = yield expense_model_1.ExpenseCategory.findOne({ _id: category });
            if (!categoryExists) {
                throw new AppError_1.default(http_status_1.default.NOT_FOUND, 'This category does not exist');
            }
        }
        // attachDocument is a file, so we need to check if it exists
        if (req.file) {
            const image = yield image_gallery_model_1.ImageGalleryModel.findOne({ url: expense.attachDocument });
            if (image) {
                yield (0, cloudinary_1.deleteAttachment)(image.public_id);
            }
            updatedData.attachDocument = yield (0, quotations_service_1.attachDocumentToQuotations)(req);
        }
        if (category && category !== expense.category.toString()) {
            // Remove the expense from the old category
            yield expense_model_1.ExpenseCategory.findByIdAndUpdate(expense.category, { $pull: { expenses: expense._id } }, { session });
            // Add the expense to the new category
            yield expense_model_1.ExpenseCategory.findByIdAndUpdate(category, { $push: { expenses: expense._id } }, { session });
            // Update the category in the expense document
            updatedData.category = category;
        }
        const updatedExpense = yield expense_model_1.Expense.findByIdAndUpdate(id, updatedData, {
            new: true,
            runValidators: true,
            session
        });
        yield session.commitTransaction();
        return updatedExpense;
    }
    catch (error) {
        yield session.abortTransaction();
        throw new AppError_1.default(http_status_1.default.INTERNAL_SERVER_ERROR, error.message || 'Internal Server Error');
    }
    finally {
        session.endSession();
    }
});
exports.updateExpense = updateExpense;
const deleteExpense = (id) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const expense = yield expense_model_1.Expense.findOne({ _id: id });
        if (!expense) {
            throw new AppError_1.default(http_status_1.default.NOT_FOUND, 'This expense is not found');
        }
        const image = yield image_gallery_model_1.ImageGalleryModel.findOne({ url: expense.attachDocument });
        if (image) {
            yield (0, cloudinary_1.deleteAttachment)(image.public_id);
        }
        yield expense_model_1.Expense.findByIdAndDelete(id);
        return null;
    }
    catch (error) {
        throw new AppError_1.default(http_status_1.default.INTERNAL_SERVER_ERROR, error.message || 'Internal Server Error');
    }
});
exports.deleteExpense = deleteExpense;
exports.expenseService = {
    getAllExpense: exports.getAllExpense,
    getExpenseById: exports.getExpenseById,
    createExpense: exports.createExpense,
    updateExpense: exports.updateExpense,
    deleteExpense: exports.deleteExpense
};
