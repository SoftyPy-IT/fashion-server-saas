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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.taxService = exports.deleteTax = exports.updateTax = exports.createTax = exports.getTaxById = exports.getAllTax = void 0;
const tax_model_1 = __importDefault(require("./tax.model"));
const QueryBuilder_1 = __importDefault(require("../../builder/QueryBuilder"));
const http_status_1 = __importDefault(require("http-status"));
const AppError_1 = __importDefault(require("../../errors/AppError"));
const getAllTax = (query) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const taxSearchableFields = ['name'];
        const taxQuery = new QueryBuilder_1.default(tax_model_1.default.find({
            isDeleted: false
        }), query)
            .search(taxSearchableFields)
            .filter()
            .sort()
            .paginate()
            .fields();
        const meta = yield taxQuery.countTotal();
        const result = yield taxQuery.queryModel;
        return { meta, result };
    }
    catch (error) {
        throw new AppError_1.default(http_status_1.default.INTERNAL_SERVER_ERROR, error.message || 'Internal Server Error');
    }
});
exports.getAllTax = getAllTax;
const getTaxById = (id) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const tax = yield tax_model_1.default.findOne({ _id: id, isDeleted: false });
        if (!tax) {
            throw new AppError_1.default(http_status_1.default.NOT_FOUND, 'This tax is not found');
        }
        return tax;
    }
    catch (error) {
        throw new AppError_1.default(http_status_1.default.INTERNAL_SERVER_ERROR, error.message || 'Internal Server Error');
    }
});
exports.getTaxById = getTaxById;
const createTax = (req) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { code, name } = req.body;
        const isTaxExist = yield tax_model_1.default.findOne({
            code,
            name,
            isDeleted: false
        });
        if (isTaxExist) {
            throw new AppError_1.default(http_status_1.default.CONFLICT, 'This tax already exists');
        }
        const result = yield tax_model_1.default.create(req.body);
        return result;
    }
    catch (error) {
        throw new AppError_1.default(http_status_1.default.INTERNAL_SERVER_ERROR, error.message || 'Internal Server Error');
    }
});
exports.createTax = createTax;
const updateTax = (id, req) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const tax = yield tax_model_1.default.findOne({ _id: id, isDeleted: false });
        if (!tax) {
            throw new AppError_1.default(http_status_1.default.NOT_FOUND, 'Tax not found');
        }
        const updatedTax = yield tax_model_1.default.findByIdAndUpdate(id, req.body, {
            new: true,
            runValidators: true
        });
        if (!updatedTax) {
            throw new AppError_1.default(http_status_1.default.INTERNAL_SERVER_ERROR, 'Error updating tax');
        }
        return updatedTax;
    }
    catch (error) {
        throw new AppError_1.default(error.status || http_status_1.default.INTERNAL_SERVER_ERROR, error.message || 'Internal Server Error');
    }
});
exports.updateTax = updateTax;
const deleteTax = (id) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const tax = yield tax_model_1.default.findOne({ _id: id, isDeleted: false });
        if (!tax) {
            throw new AppError_1.default(http_status_1.default.NOT_FOUND, 'This tax is not found');
        }
        yield tax_model_1.default.findByIdAndUpdate(id, { isDeleted: true, deletedAt: new Date() }, { new: true });
        return null;
    }
    catch (error) {
        throw new AppError_1.default(http_status_1.default.INTERNAL_SERVER_ERROR, error.message || 'Internal Server Error');
    }
});
exports.deleteTax = deleteTax;
exports.taxService = {
    getAllTax: exports.getAllTax,
    getTaxById: exports.getTaxById,
    createTax: exports.createTax,
    updateTax: exports.updateTax,
    deleteTax: exports.deleteTax
};
