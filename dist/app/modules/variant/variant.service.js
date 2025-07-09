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
exports.variantService = exports.deleteVariant = exports.updateVariant = exports.createVariant = exports.getVariantById = exports.getAllVariant = void 0;
const variant_model_1 = __importDefault(require("./variant.model"));
const QueryBuilder_1 = __importDefault(require("../../builder/QueryBuilder"));
const http_status_1 = __importDefault(require("http-status"));
const AppError_1 = __importDefault(require("../../errors/AppError"));
const getAllVariant = (query) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const variantSearchableFields = ['name'];
        const variantQuery = new QueryBuilder_1.default(variant_model_1.default.find({
            isDeleted: false
        }), query)
            .search(variantSearchableFields)
            .filter()
            .sort()
            .paginate()
            .fields();
        const meta = yield variantQuery.countTotal();
        const result = yield variantQuery.queryModel;
        return { meta, result };
    }
    catch (error) {
        throw new AppError_1.default(http_status_1.default.INTERNAL_SERVER_ERROR, 'Internal Server Error');
    }
});
exports.getAllVariant = getAllVariant;
const getVariantById = (id) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const variant = yield variant_model_1.default.findOne({ _id: id, isDeleted: false });
        if (!variant) {
            throw new AppError_1.default(http_status_1.default.NOT_FOUND, 'This variant is not found');
        }
        return variant;
    }
    catch (error) {
        throw new AppError_1.default(http_status_1.default.INTERNAL_SERVER_ERROR, 'Internal Server Error');
    }
});
exports.getVariantById = getVariantById;
const createVariant = (req) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { name, items } = req.body;
        const variant = yield variant_model_1.default.findOne({ name, isDeleted: false });
        if (variant) {
            throw new AppError_1.default(http_status_1.default.BAD_REQUEST, 'This variant already exists. Please choose another name');
        }
        const result = yield variant_model_1.default.create({
            name,
            items
        });
        return result;
    }
    catch (error) {
        throw new AppError_1.default(http_status_1.default.INTERNAL_SERVER_ERROR, error.message || 'Internal Server Error');
    }
});
exports.createVariant = createVariant;
const updateVariant = (id, req) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const variant = yield variant_model_1.default.findOne({ _id: id, isDeleted: false });
        if (!variant) {
            throw new AppError_1.default(http_status_1.default.NOT_FOUND, 'This variant does not exist');
        }
        const _a = req.body, { name, items } = _a, remainingStudentData = __rest(_a, ["name", "items"]);
        const modifiedUpdatedData = Object.assign({}, remainingStudentData);
        if (name) {
            const variantName = yield variant_model_1.default.findOne({ name });
            if (variantName && variantName._id.toString() !== id) {
                throw new AppError_1.default(http_status_1.default.BAD_REQUEST, 'This variant already exists. Please choose another name');
            }
            else {
                modifiedUpdatedData.name = name;
            }
        }
        if (items) {
            modifiedUpdatedData.items = items;
        }
        const result = yield variant_model_1.default.findByIdAndUpdate(id, modifiedUpdatedData, {
            new: true,
            runValidators: true
        });
        return result;
    }
    catch (error) {
        throw new AppError_1.default(http_status_1.default.INTERNAL_SERVER_ERROR, error.message || 'Internal Server Error');
    }
});
exports.updateVariant = updateVariant;
const deleteVariant = (id) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const variant = yield variant_model_1.default.findOne({ _id: id, isDeleted: false });
        if (!variant) {
            throw new AppError_1.default(http_status_1.default.NOT_FOUND, 'This variant is not found');
        }
        yield variant_model_1.default.findByIdAndUpdate(id, { isDeleted: true, deletedAt: new Date() }, { new: true });
        return null;
    }
    catch (error) {
        throw new AppError_1.default(http_status_1.default.INTERNAL_SERVER_ERROR, error.message || 'Internal Server Error');
    }
});
exports.deleteVariant = deleteVariant;
exports.variantService = {
    getAllVariant: exports.getAllVariant,
    getVariantById: exports.getVariantById,
    createVariant: exports.createVariant,
    updateVariant: exports.updateVariant,
    deleteVariant: exports.deleteVariant
};
