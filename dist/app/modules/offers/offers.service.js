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
exports.offersService = exports.deleteOffers = exports.updateOffers = exports.createOffers = exports.getOffersById = exports.getOffersProducts = exports.getAllOffers = void 0;
const offers_model_1 = __importDefault(require("./offers.model"));
const QueryBuilder_1 = __importDefault(require("../../builder/QueryBuilder"));
const http_status_1 = __importDefault(require("http-status"));
const AppError_1 = __importDefault(require("../../errors/AppError"));
const product_model_1 = __importDefault(require("../product/product.model"));
const mongoose_1 = require("mongoose");
const getAllOffers = (query) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const offersQuery = new QueryBuilder_1.default(offers_model_1.default.find().populate([
            {
                path: 'products',
                populate: {
                    path: 'category'
                }
            }
        ]), query)
            .filter()
            .sort()
            .paginate()
            .fields();
        const meta = yield offersQuery.countTotal();
        const result = yield offersQuery.queryModel;
        return { meta, result };
    }
    catch (error) {
        throw new AppError_1.default(http_status_1.default.INTERNAL_SERVER_ERROR, error.message || 'Internal Server Error');
    }
});
exports.getAllOffers = getAllOffers;
const getOffersProducts = (query) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // get all the that products whose are not in any offers
        const searchABleFields = ['name'];
        const productsQuery = new QueryBuilder_1.default(product_model_1.default.find({
            _id: {
                $nin: (yield offers_model_1.default.distinct('products')).map((product) => new mongoose_1.Types.ObjectId(product.toHexString()))
            },
            isDeleted: false
        }).populate('category brand subCategory productUnit defaultSaleUnit defaultSaleUnit defaultPurchaseUnit productTax'), query)
            .filter()
            .search(searchABleFields)
            .sort()
            .paginate()
            .fields();
        const meta = yield productsQuery.countTotal();
        const result = yield productsQuery.queryModel;
        return { meta, result };
    }
    catch (error) {
        throw new AppError_1.default(http_status_1.default.INTERNAL_SERVER_ERROR, error.message || 'Internal Server Error');
    }
});
exports.getOffersProducts = getOffersProducts;
const getOffersById = (req) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const { id } = req.params;
        const limit = parseInt(req.query.limit, 10) || 10;
        const page = parseInt(req.query.page, 10) || 1;
        const searchTerm = req.query.searchTerm;
        const offers = yield offers_model_1.default.findOne({ _id: id });
        if (!offers) {
            throw new AppError_1.default(http_status_1.default.NOT_FOUND, 'This offer is not found');
        }
        const totalProducts = yield offers_model_1.default.aggregate([
            { $match: { _id: offers._id } },
            { $unwind: '$products' },
            { $count: 'total' }
        ]);
        const total = ((_a = totalProducts[0]) === null || _a === void 0 ? void 0 : _a.total) || 0;
        const totalPages = Math.ceil(total / limit);
        const products = yield offers_model_1.default.findOne({ _id: id })
            .populate({
            path: 'products',
            options: {
                skip: (page - 1) * limit,
                limit
            },
            match: {
                name: searchTerm ? { $regex: searchTerm, $options: 'i' } : { $exists: true }
            },
            populate: [
                { path: 'brand', select: 'name' },
                { path: 'category', select: 'name' },
                { path: 'subCategory', select: 'name' },
                { path: 'productUnit', select: 'name' },
                { path: 'defaultSaleUnit', select: 'name' },
                { path: 'defaultPurchaseUnit', select: 'name' },
                { path: 'productTax', select: 'name' },
                { path: 'supplier', select: 'company' }
            ]
        })
            .select('products');
        if (!products) {
            throw new AppError_1.default(http_status_1.default.NOT_FOUND, 'This offer is not found');
        }
        const result = Object.assign(Object.assign({}, offers.toJSON()), { products: {
                products: products.products,
                meta: {
                    total,
                    page,
                    limit,
                    totalPages
                }
            } });
        return result;
    }
    catch (error) {
        throw new AppError_1.default(http_status_1.default.INTERNAL_SERVER_ERROR, error.message || 'Internal Server Error');
    }
});
exports.getOffersById = getOffersById;
const createOffers = (req) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { title, subTitle, startDate, endDate, products, status } = req.body;
        const isExist = yield offers_model_1.default.findOne({ title });
        if (isExist) {
            throw new AppError_1.default(http_status_1.default.CONFLICT, 'This offers already exists, please try another one');
        }
        const isProductExist = yield product_model_1.default.find({
            _id: { $in: products },
            isDeleted: false
        });
        if (isProductExist.length !== products.length) {
            throw new AppError_1.default(http_status_1.default.NOT_FOUND, 'This product does not exist, please try another one');
        }
        // check this product is already in any offers
        const isProductInOffers = yield offers_model_1.default.findOne({
            products: { $in: products }
        });
        if (isProductInOffers) {
            throw new AppError_1.default(http_status_1.default.CONFLICT, 'This product is already in another offers');
        }
        // check startDate and endDate
        if (new Date(startDate) > new Date(endDate)) {
            throw new AppError_1.default(http_status_1.default.BAD_REQUEST, 'End date should be greater than start date');
        }
        const result = yield offers_model_1.default.create({
            title,
            subTitle,
            startDate,
            endDate,
            products,
            status
        });
        return result;
    }
    catch (error) {
        console.log(error);
        throw new AppError_1.default(http_status_1.default.INTERNAL_SERVER_ERROR, error.message);
    }
});
exports.createOffers = createOffers;
const updateOffers = (id, req) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const offers = yield offers_model_1.default.findOne({ _id: id });
        if (!offers) {
            throw new AppError_1.default(http_status_1.default.NOT_FOUND, 'This offers does not exist');
        }
        const _b = req.body, { title, subTitle, startDate, endDate, products, status, productId, action, id: offerId } = _b, remainingStudentData = __rest(_b, ["title", "subTitle", "startDate", "endDate", "products", "status", "productId", "action", "id"]);
        const isExist = yield offers_model_1.default.findById(offerId);
        if (!isExist) {
            throw new AppError_1.default(http_status_1.default.CONFLICT, "This offer doesn't exist");
        }
        if (productId && action === 'remove') {
            yield offers_model_1.default.findByIdAndUpdate(offerId, {
                $pull: { products: productId }
            });
        }
        const modifiedUpdatedData = Object.assign({}, remainingStudentData);
        if (title) {
            modifiedUpdatedData.title = title;
        }
        if (subTitle) {
            modifiedUpdatedData.subTitle = subTitle;
        }
        if (startDate) {
            // check startDate and endDate
            if (new Date(startDate) > new Date(endDate)) {
                throw new AppError_1.default(http_status_1.default.BAD_REQUEST, 'End date should be greater than start date');
            }
            modifiedUpdatedData.startDate = startDate;
        }
        if (endDate) {
            // check startDate and endDate
            if (new Date(startDate) > new Date(endDate)) {
                throw new AppError_1.default(http_status_1.default.BAD_REQUEST, 'End date should be greater than start date');
            }
            modifiedUpdatedData.endDate = endDate;
        }
        // update products if it is provided and check if it is valid or not and check if it is already in any offers
        if (products) {
            const isProductExist = yield product_model_1.default.find({
                _id: { $in: products },
                isDeleted: false
            });
            if (isProductExist.length !== products.length) {
                throw new AppError_1.default(http_status_1.default.NOT_FOUND, 'This product does not exist, please try another one');
            }
            const isProductInOffers = yield offers_model_1.default.findOne({
                products: { $in: products }
            });
            if (isProductInOffers) {
                throw new AppError_1.default(http_status_1.default.CONFLICT, 'This product is already in another offers');
            }
            modifiedUpdatedData.products = [...products, ...offers.products];
        }
        if (status) {
            modifiedUpdatedData.status = status;
        }
        const result = yield offers_model_1.default.findByIdAndUpdate(id, modifiedUpdatedData, {
            new: true,
            runValidators: true
        });
        return result;
    }
    catch (error) {
        throw new AppError_1.default(http_status_1.default.INTERNAL_SERVER_ERROR, error.message);
    }
});
exports.updateOffers = updateOffers;
const deleteOffers = (id) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const offers = yield offers_model_1.default.findOne({ _id: id });
        if (!offers) {
            throw new AppError_1.default(http_status_1.default.NOT_FOUND, 'This offers is not found');
        }
        yield offers_model_1.default.findByIdAndDelete(id);
        return null;
    }
    catch (error) {
        throw new AppError_1.default(http_status_1.default.INTERNAL_SERVER_ERROR, error.message || 'Internal Server Error');
    }
});
exports.deleteOffers = deleteOffers;
exports.offersService = {
    getAllOffers: exports.getAllOffers,
    getOffersById: exports.getOffersById,
    createOffers: exports.createOffers,
    updateOffers: exports.updateOffers,
    deleteOffers: exports.deleteOffers,
    getOffersProducts: exports.getOffersProducts
};
