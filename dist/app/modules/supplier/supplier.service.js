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
exports.supplierService = exports.deleteSupplier = exports.updateSupplier = exports.createSupplier = exports.getSupplierById = exports.getAllSupplier = void 0;
const supplier_model_1 = __importDefault(require("./supplier.model"));
const QueryBuilder_1 = __importDefault(require("../../builder/QueryBuilder"));
const http_status_1 = __importDefault(require("http-status"));
const AppError_1 = __importDefault(require("../../errors/AppError"));
const getAllSupplier = (query) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const supplierSearchableFields = ['name'];
        const supplierQuery = new QueryBuilder_1.default(supplier_model_1.default.find({
            isDeleted: false
        }), query)
            .search(supplierSearchableFields)
            .filter()
            .sort()
            .paginate()
            .fields();
        const meta = yield supplierQuery.countTotal();
        const result = yield supplierQuery.queryModel;
        return { meta, result };
    }
    catch (error) {
        throw new AppError_1.default(http_status_1.default.INTERNAL_SERVER_ERROR, error.message || 'Internal Server Error');
    }
});
exports.getAllSupplier = getAllSupplier;
const getSupplierById = (id) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const supplier = yield supplier_model_1.default.findOne({ _id: id, isDeleted: false });
        if (!supplier) {
            throw new AppError_1.default(http_status_1.default.NOT_FOUND, 'This supplier is not found');
        }
        return supplier;
    }
    catch (error) {
        throw new AppError_1.default(http_status_1.default.INTERNAL_SERVER_ERROR, error.message || 'Internal Server Error');
    }
});
exports.getSupplierById = getSupplierById;
const createSupplier = (req) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { name, email, phone } = req.body;
        const supplierExists = yield supplier_model_1.default.findOne({
            name,
            email,
            phone,
            isDeleted: false
        });
        if (supplierExists) {
            throw new AppError_1.default(http_status_1.default.BAD_REQUEST, 'This supplier already exists');
        }
        const result = yield supplier_model_1.default.create(req.body);
        return result;
    }
    catch (error) {
        throw new AppError_1.default(http_status_1.default.INTERNAL_SERVER_ERROR, error.message || 'Internal Server Error');
    }
});
exports.createSupplier = createSupplier;
const updateSupplier = (id, req) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const supplier = yield supplier_model_1.default.findOne({ _id: id, isDeleted: false });
        if (!supplier) {
            throw new AppError_1.default(http_status_1.default.NOT_FOUND, 'This supplier does not exist');
        }
        const modifiedUpdatedData = Object.assign(Object.assign({}, req.body), { updatedAt: new Date() });
        const result = yield supplier_model_1.default.findByIdAndUpdate(id, modifiedUpdatedData, {
            new: true,
            runValidators: true
        });
        return result;
    }
    catch (error) {
        throw new AppError_1.default(http_status_1.default.INTERNAL_SERVER_ERROR, error.message || 'Internal Server Error');
    }
});
exports.updateSupplier = updateSupplier;
const deleteSupplier = (id) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const supplier = yield supplier_model_1.default.findOne({ _id: id, isDeleted: false });
        if (!supplier) {
            throw new AppError_1.default(http_status_1.default.NOT_FOUND, 'This supplier is not found');
        }
        yield supplier_model_1.default.findByIdAndUpdate(id, { isDeleted: true, deletedAt: new Date() }, { new: true });
        return null;
    }
    catch (error) {
        throw new AppError_1.default(http_status_1.default.INTERNAL_SERVER_ERROR, error.message || 'Internal Server Error');
    }
});
exports.deleteSupplier = deleteSupplier;
exports.supplierService = {
    getAllSupplier: exports.getAllSupplier,
    getSupplierById: exports.getSupplierById,
    createSupplier: exports.createSupplier,
    updateSupplier: exports.updateSupplier,
    deleteSupplier: exports.deleteSupplier
};
