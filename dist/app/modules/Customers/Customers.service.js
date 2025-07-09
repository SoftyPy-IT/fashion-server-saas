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
exports.CustomersService = exports.deleteCustomer = exports.updateCustomer = exports.createCustomer = exports.getCustomerById = exports.getAllCustomers = void 0;
const Customers_model_1 = __importDefault(require("./Customers.model"));
const QueryBuilder_1 = __importDefault(require("../../builder/QueryBuilder"));
const http_status_1 = __importDefault(require("http-status"));
const AppError_1 = __importDefault(require("../../errors/AppError"));
const getAllCustomers = (query) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const searchableFields = ['name', 'email', 'phone'];
        const customerQuery = new QueryBuilder_1.default(Customers_model_1.default.find({ isDeleted: false }), query)
            .search(searchableFields)
            .filter()
            .sort()
            .paginate()
            .fields();
        const meta = yield customerQuery.countTotal();
        const result = yield customerQuery.queryModel;
        return { meta, result };
    }
    catch (error) {
        throw new AppError_1.default(http_status_1.default.INTERNAL_SERVER_ERROR, error.message || 'Internal Server Error');
    }
});
exports.getAllCustomers = getAllCustomers;
const getCustomerById = (id) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const customer = yield Customers_model_1.default.findOne({ _id: id, isDeleted: false });
        if (!customer) {
            throw new AppError_1.default(http_status_1.default.NOT_FOUND, 'This customer is not found');
        }
        return customer;
    }
    catch (error) {
        throw new AppError_1.default(http_status_1.default.INTERNAL_SERVER_ERROR, error.message || 'Internal Server Error');
    }
});
exports.getCustomerById = getCustomerById;
const createCustomer = (req) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email } = req.body;
        const customerExists = yield Customers_model_1.default.findOne({
            email,
            isDeleted: false
        });
        if (customerExists) {
            throw new AppError_1.default(http_status_1.default.BAD_REQUEST, 'This customer already exists');
        }
        const result = yield Customers_model_1.default.create(req.body);
        return result;
    }
    catch (error) {
        throw new AppError_1.default(http_status_1.default.INTERNAL_SERVER_ERROR, error.message || 'Internal Server Error');
    }
});
exports.createCustomer = createCustomer;
const updateCustomer = (id, req) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const customer = yield Customers_model_1.default.findOne({ _id: id, isDeleted: false });
        if (!customer) {
            throw new AppError_1.default(http_status_1.default.NOT_FOUND, 'This customer does not exist');
        }
        const updatedData = Object.assign(Object.assign({}, req.body), { updatedAt: new Date() });
        const result = yield Customers_model_1.default.findByIdAndUpdate(id, updatedData, {
            new: true,
            runValidators: true
        });
        return result;
    }
    catch (error) {
        throw new AppError_1.default(http_status_1.default.INTERNAL_SERVER_ERROR, error.message || 'Internal Server Error');
    }
});
exports.updateCustomer = updateCustomer;
const deleteCustomer = (id) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const customer = yield Customers_model_1.default.findOne({ _id: id, isDeleted: false });
        if (!customer) {
            throw new AppError_1.default(http_status_1.default.NOT_FOUND, 'This customer is not found');
        }
        yield Customers_model_1.default.findByIdAndUpdate(id, { isDeleted: true, deletedAt: new Date() }, { new: true });
        return null;
    }
    catch (error) {
        throw new AppError_1.default(http_status_1.default.INTERNAL_SERVER_ERROR, error.message || 'Internal Server Error');
    }
});
exports.deleteCustomer = deleteCustomer;
exports.CustomersService = {
    getAllCustomers: exports.getAllCustomers,
    getCustomerById: exports.getCustomerById,
    createCustomer: exports.createCustomer,
    updateCustomer: exports.updateCustomer,
    deleteCustomer: exports.deleteCustomer
};
