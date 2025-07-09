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
exports.comboService = exports.deleteCombo = exports.updateCombo = exports.createCombo = exports.getComboById = exports.getAllCombo = void 0;
const combo_model_1 = __importDefault(require("./combo.model"));
const QueryBuilder_1 = __importDefault(require("../../builder/QueryBuilder"));
const http_status_1 = __importDefault(require("http-status"));
const AppError_1 = __importDefault(require("../../errors/AppError"));
const product_model_1 = __importDefault(require("../product/product.model"));
const mongoose_1 = __importDefault(require("mongoose"));
const getAllCombo = (query) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const comboSearchableFields = ['name'];
        const comboQuery = new QueryBuilder_1.default(combo_model_1.default.find({
            isDeleted: false
        }).populate([
            {
                path: 'items',
                populate: {
                    path: 'category',
                    populate: {
                        path: 'subCategories mainCategory',
                        select: 'name'
                    }
                }
            }
        ]), query)
            .search(comboSearchableFields)
            .filter()
            .sort()
            .paginate()
            .fields();
        const meta = yield comboQuery.countTotal();
        const result = yield comboQuery.queryModel;
        return { meta, result };
    }
    catch (error) {
        throw new AppError_1.default(http_status_1.default.INTERNAL_SERVER_ERROR, error.message || 'Internal Server Error');
    }
});
exports.getAllCombo = getAllCombo;
const getComboById = (id) => __awaiter(void 0, void 0, void 0, function* () {
    const isValidObjectId = mongoose_1.default.Types.ObjectId.isValid(id);
    const queryCondition = isValidObjectId ? { _id: id } : { slug: id };
    try {
        const combo = yield combo_model_1.default.findOne(Object.assign(Object.assign({}, queryCondition), { isDeleted: false })).populate([
            {
                path: 'items',
                populate: [
                    {
                        path: 'category',
                        select: 'name'
                    },
                    {
                        path: 'mainCategory',
                        select: 'name'
                    },
                    {
                        path: 'subCategory',
                        select: 'name'
                    }
                ]
            }
        ]);
        if (!combo) {
            throw new AppError_1.default(http_status_1.default.NOT_FOUND, 'This combo is not found');
        }
        return combo;
    }
    catch (error) {
        throw new AppError_1.default(http_status_1.default.INTERNAL_SERVER_ERROR, error.message || 'Internal Server Error');
    }
});
exports.getComboById = getComboById;
const createCombo = (req) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { items } = req.body;
        // Check if all product IDs exist
        yield Promise.all(items.map((productId) => __awaiter(void 0, void 0, void 0, function* () {
            const product = yield product_model_1.default.findOne({ _id: productId, isDeleted: false });
            if (!product) {
                throw new AppError_1.default(http_status_1.default.NOT_FOUND, `Product with ID ${productId} does not exist`);
            }
        })));
        const result = yield combo_model_1.default.create(Object.assign(Object.assign({}, req.body), { slug: req.body.name.toLowerCase().replace(/[^a-z0-9]+/g, '-') }));
        return result;
    }
    catch (error) {
        throw new AppError_1.default(http_status_1.default.INTERNAL_SERVER_ERROR, error.message || 'Internal Server Error');
    }
});
exports.createCombo = createCombo;
const updateCombo = (id, req) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const combo = yield combo_model_1.default.findOne({ _id: id, isDeleted: false });
        if (!combo) {
            throw new AppError_1.default(http_status_1.default.NOT_FOUND, 'This combo does not exist');
        }
        const remainingStudentData = __rest(req.body, []);
        const modifiedUpdatedData = Object.assign({}, remainingStudentData);
        const result = yield combo_model_1.default.findByIdAndUpdate(id, modifiedUpdatedData, {
            new: true,
            runValidators: true
        });
        return result;
    }
    catch (error) {
        throw new AppError_1.default(http_status_1.default.INTERNAL_SERVER_ERROR, error.message || 'Internal Server Error');
    }
});
exports.updateCombo = updateCombo;
const deleteCombo = (id) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const combo = yield combo_model_1.default.findOne({ _id: id });
        if (!combo) {
            throw new AppError_1.default(http_status_1.default.NOT_FOUND, 'This combo is not found');
        }
        yield combo_model_1.default.findByIdAndDelete(id);
        return null;
    }
    catch (error) {
        throw new AppError_1.default(http_status_1.default.INTERNAL_SERVER_ERROR, error.message || 'Internal Server Error');
    }
});
exports.deleteCombo = deleteCombo;
exports.comboService = {
    getAllCombo: exports.getAllCombo,
    getComboById: exports.getComboById,
    createCombo: exports.createCombo,
    updateCombo: exports.updateCombo,
    deleteCombo: exports.deleteCombo
};
