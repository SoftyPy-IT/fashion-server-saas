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
exports.BillersService = exports.deleteBiller = exports.updateBiller = exports.createBiller = exports.getBillerById = exports.getAllBillers = void 0;
const QueryBuilder_1 = __importDefault(require("../../builder/QueryBuilder"));
const http_status_1 = __importDefault(require("http-status"));
const AppError_1 = __importDefault(require("../../errors/AppError"));
const Billers_model_1 = __importDefault(require("./Billers.model"));
const getAllBillers = (query) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const billerSearchableFields = ['name'];
        const billerQuery = new QueryBuilder_1.default(Billers_model_1.default.find({
            isDeleted: false
        }), query)
            .search(billerSearchableFields)
            .filter()
            .sort()
            .paginate()
            .fields();
        const meta = yield billerQuery.countTotal();
        const result = yield billerQuery.queryModel;
        return { meta, result };
    }
    catch (error) {
        throw new AppError_1.default(http_status_1.default.INTERNAL_SERVER_ERROR, error.message || 'Internal Server Error');
    }
});
exports.getAllBillers = getAllBillers;
const getBillerById = (id) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const biller = yield Billers_model_1.default.findOne({ _id: id, isDeleted: false });
        if (!biller) {
            throw new AppError_1.default(http_status_1.default.NOT_FOUND, 'This biller is not found');
        }
        return biller;
    }
    catch (error) {
        throw new AppError_1.default(http_status_1.default.INTERNAL_SERVER_ERROR, error.message || 'Internal Server Error');
    }
});
exports.getBillerById = getBillerById;
const createBiller = (req) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { name, email, phone } = req.body;
        const billerExists = yield Billers_model_1.default.findOne({
            name,
            email,
            phone,
            isDeleted: false
        });
        if (billerExists) {
            throw new AppError_1.default(http_status_1.default.BAD_REQUEST, 'This biller already exists');
        }
        const result = yield Billers_model_1.default.create(req.body);
        return result;
    }
    catch (error) {
        throw new AppError_1.default(http_status_1.default.INTERNAL_SERVER_ERROR, error.message || 'Internal Server Error');
    }
});
exports.createBiller = createBiller;
const updateBiller = (id, req) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const biller = yield Billers_model_1.default.findOne({ _id: id, isDeleted: false });
        if (!biller) {
            throw new AppError_1.default(http_status_1.default.NOT_FOUND, 'This biller does not exist');
        }
        const modifiedUpdatedData = Object.assign(Object.assign({}, req.body), { updatedAt: new Date() });
        const result = yield Billers_model_1.default.findByIdAndUpdate(id, modifiedUpdatedData, {
            new: true,
            runValidators: true
        });
        return result;
    }
    catch (error) {
        throw new AppError_1.default(http_status_1.default.INTERNAL_SERVER_ERROR, error.message || 'Internal Server Error');
    }
});
exports.updateBiller = updateBiller;
const deleteBiller = (id) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const biller = yield Billers_model_1.default.findOne({ _id: id, isDeleted: false });
        if (!biller) {
            throw new AppError_1.default(http_status_1.default.NOT_FOUND, 'This biller is not found');
        }
        yield Billers_model_1.default.findByIdAndUpdate(id, { isDeleted: true, deletedAt: new Date() }, { new: true });
        return null;
    }
    catch (error) {
        throw new AppError_1.default(http_status_1.default.INTERNAL_SERVER_ERROR, error.message || 'Internal Server Error');
    }
});
exports.deleteBiller = deleteBiller;
exports.BillersService = {
    getAllBillers: exports.getAllBillers,
    getBillerById: exports.getBillerById,
    createBiller: exports.createBiller,
    updateBiller: exports.updateBiller,
    deleteBiller: exports.deleteBiller
};
