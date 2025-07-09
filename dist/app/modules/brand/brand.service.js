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
exports.brandService = exports.deleteBrand = exports.updateBrand = exports.createBrand = exports.getBrandById = exports.getAllBrand = void 0;
const brand_model_1 = __importDefault(require("./brand.model"));
const QueryBuilder_1 = __importDefault(require("../../builder/QueryBuilder"));
const http_status_1 = __importDefault(require("http-status"));
const AppError_1 = __importDefault(require("../../errors/AppError"));
const getAllBrand = (query) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const brandSearchableFields = ['name'];
        const brandQuery = new QueryBuilder_1.default(brand_model_1.default.find({
            isDeleted: false
        }), query)
            .search(brandSearchableFields)
            .filter()
            .sort()
            .paginate()
            .fields();
        const meta = yield brandQuery.countTotal();
        const result = yield brandQuery.queryModel;
        return { meta, result };
    }
    catch (error) {
        throw new AppError_1.default(http_status_1.default.INTERNAL_SERVER_ERROR, error.message || 'Something went wrong, please try again');
    }
});
exports.getAllBrand = getAllBrand;
const getBrandById = (id) => __awaiter(void 0, void 0, void 0, function* () {
    const brand = yield brand_model_1.default.findOne({ _id: id, isDeleted: false });
    if (!brand) {
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, 'This brand is not found');
    }
    return brand;
});
exports.getBrandById = getBrandById;
const createBrand = (req) => __awaiter(void 0, void 0, void 0, function* () {
    const { name } = req.body;
    try {
        if (yield brand_model_1.default.isBrandExists(name)) {
            throw new AppError_1.default(http_status_1.default.BAD_REQUEST, 'This brand is already exists');
        }
        const result = yield brand_model_1.default.create(Object.assign(Object.assign({}, req.body), { slug: name.toLowerCase().replace(/ /g, '-') }));
        return result;
    }
    catch (error) {
        throw new AppError_1.default(http_status_1.default.INTERNAL_SERVER_ERROR, error.message || 'Something went wrong, please try again');
    }
});
exports.createBrand = createBrand;
const updateBrand = (id, req) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const brand = yield brand_model_1.default.findById(id, { isDeleted: false });
        if (!brand) {
            throw new AppError_1.default(http_status_1.default.NOT_FOUND, 'This brand is not found');
        }
        const _a = req.body, { name, description, image } = _a, remainingStudentData = __rest(_a, ["name", "description", "image"]);
        const modifiedUpdatedData = Object.assign({}, remainingStudentData);
        // check this brand name already exists except the current brand
        if (name && name !== brand.name) {
            if (yield brand_model_1.default.isBrandExists(name)) {
                throw new AppError_1.default(http_status_1.default.BAD_REQUEST, 'This brand name already exists');
            }
        }
        if (name) {
            modifiedUpdatedData.name = name;
            modifiedUpdatedData.slug = name.toLowerCase().replace(/ /g, '-');
        }
        if (description) {
            modifiedUpdatedData.description = description;
        }
        if (image) {
            modifiedUpdatedData.image = image;
        }
        const result = yield brand_model_1.default.findByIdAndUpdate(id, modifiedUpdatedData, {
            new: true,
            runValidators: true
        });
        return result;
    }
    catch (error) {
        throw new AppError_1.default(http_status_1.default.INTERNAL_SERVER_ERROR, error.message || 'Something went wrong, please try again');
    }
});
exports.updateBrand = updateBrand;
const deleteBrand = (id) => __awaiter(void 0, void 0, void 0, function* () {
    const brand = yield brand_model_1.default.findOne({ _id: id, isDeleted: false });
    if (!brand) {
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, 'This brand does not exist');
    }
    // check if the brand has any products
    const isBrandHasProducts = yield brand_model_1.default.findOne({
        _id: id,
        products: { $exists: true, $ne: [] }
    });
    if (isBrandHasProducts) {
        throw new AppError_1.default(http_status_1.default.BAD_REQUEST, 'This brand has products, please delete the products first');
    }
    yield brand_model_1.default.findByIdAndUpdate(id, { isDeleted: true }, { new: true });
    return null;
});
exports.deleteBrand = deleteBrand;
exports.brandService = {
    getAllBrand: exports.getAllBrand,
    getBrandById: exports.getBrandById,
    createBrand: exports.createBrand,
    updateBrand: exports.updateBrand,
    deleteBrand: exports.deleteBrand
};
