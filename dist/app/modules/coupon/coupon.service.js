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
exports.couponService = exports.applyCoupon = exports.deleteCoupon = exports.updateCoupon = exports.createCoupon = exports.getCouponById = exports.getAllCoupon = void 0;
const coupon_model_1 = __importDefault(require("./coupon.model"));
const QueryBuilder_1 = __importDefault(require("../../builder/QueryBuilder"));
const http_status_1 = __importDefault(require("http-status"));
const AppError_1 = __importDefault(require("../../errors/AppError"));
const getAllCoupon = (query) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const couponSearchableFields = ['name'];
        const couponQuery = new QueryBuilder_1.default(coupon_model_1.default.find({}), query)
            .search(couponSearchableFields)
            .filter()
            .sort()
            .paginate()
            .fields();
        const meta = yield couponQuery.countTotal();
        const result = yield couponQuery.queryModel;
        return { meta, result };
    }
    catch (error) {
        throw new AppError_1.default(http_status_1.default.INTERNAL_SERVER_ERROR, error.message || 'Internal Server Error');
    }
});
exports.getAllCoupon = getAllCoupon;
const getCouponById = (id) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const coupon = yield coupon_model_1.default.findOne({ _id: id });
        if (!coupon) {
            throw new AppError_1.default(http_status_1.default.NOT_FOUND, 'This coupon is not found');
        }
        return coupon;
    }
    catch (error) {
        throw new AppError_1.default(http_status_1.default.INTERNAL_SERVER_ERROR, error.message || 'Internal Server Error');
    }
});
exports.getCouponById = getCouponById;
const createCoupon = (req) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { name, code, expiryDate, discountType } = req.body;
        // Check if the coupon name and code already exist
        const existingCoupon = yield coupon_model_1.default.findOne({ $or: [{ name }, { code }] });
        if (existingCoupon) {
            throw new AppError_1.default(http_status_1.default.BAD_REQUEST, 'This coupon already exists');
        }
        if (discountType === 'percentage' && (req.body.discount < 0 || req.body.discount > 100)) {
            throw new AppError_1.default(http_status_1.default.BAD_REQUEST, 'Discount must be between 0 and 100');
        }
        // Check if the expiry date is in the future
        if (new Date(expiryDate) < new Date()) {
            throw new AppError_1.default(http_status_1.default.BAD_REQUEST, 'Expiry date must be in the future');
        }
        const result = yield coupon_model_1.default.create(req.body);
        return result;
    }
    catch (error) {
        throw new AppError_1.default(http_status_1.default.INTERNAL_SERVER_ERROR, error.message || 'Internal Server Error');
    }
});
exports.createCoupon = createCoupon;
const updateCoupon = (id, req) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const coupon = yield coupon_model_1.default.findOne({ _id: id });
        if (!coupon) {
            throw new AppError_1.default(http_status_1.default.NOT_FOUND, 'This coupon does not exist');
        }
        const { name, code, expiryDate, discountType } = req.body;
        // Check if the coupon name and code already exist
        const existingCoupon = yield coupon_model_1.default.findOne({ $or: [{ name }, { code }] });
        if (existingCoupon && existingCoupon._id.toString() !== id) {
            throw new AppError_1.default(http_status_1.default.BAD_REQUEST, 'This coupon already exists');
        }
        if (discountType === 'percentage' && (req.body.discount < 0 || req.body.discount > 100)) {
            throw new AppError_1.default(http_status_1.default.BAD_REQUEST, 'Discount must be between 0 and 100');
        }
        // Check if the expiry date is in the future
        if (new Date(expiryDate) < new Date()) {
            throw new AppError_1.default(http_status_1.default.BAD_REQUEST, 'Expiry date must be in the future');
        }
        const modifiedUpdatedData = Object.assign(Object.assign({}, req.body), { updatedAt: new Date() });
        const result = yield coupon_model_1.default.findByIdAndUpdate(id, modifiedUpdatedData, {
            new: true,
            runValidators: true
        });
        return result;
    }
    catch (error) {
        throw new AppError_1.default(http_status_1.default.INTERNAL_SERVER_ERROR, error.message || 'Internal Server Error');
    }
});
exports.updateCoupon = updateCoupon;
const deleteCoupon = (id) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const coupon = yield coupon_model_1.default.findOne({ _id: id });
        if (!coupon) {
            throw new AppError_1.default(http_status_1.default.NOT_FOUND, 'This coupon is not found');
        }
        yield coupon_model_1.default.findByIdAndUpdate(id, { isDeleted: true, deletedAt: new Date() }, { new: true });
        return null;
    }
    catch (error) {
        throw new AppError_1.default(http_status_1.default.INTERNAL_SERVER_ERROR, error.message || 'Internal Server Error');
    }
});
exports.deleteCoupon = deleteCoupon;
const applyCoupon = (req) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { code } = req.body;
        const coupon = yield coupon_model_1.default.findOne({
            code,
            isActive: true,
            expiryDate: { $gt: new Date().toISOString() }
        });
        if (!coupon) {
            throw new AppError_1.default(http_status_1.default.NOT_FOUND, 'This coupon is invalid or has expired');
        }
        // check if the coupon has reached its limit
        if (coupon.totalUsed >= coupon.limit) {
            throw new AppError_1.default(http_status_1.default.BAD_REQUEST, 'This coupon has reached its limit');
        }
        return coupon;
    }
    catch (error) {
        throw new AppError_1.default(http_status_1.default.INTERNAL_SERVER_ERROR, error.message || 'Internal Server Error');
    }
});
exports.applyCoupon = applyCoupon;
exports.couponService = {
    getAllCoupon: exports.getAllCoupon,
    getCouponById: exports.getCouponById,
    createCoupon: exports.createCoupon,
    updateCoupon: exports.updateCoupon,
    deleteCoupon: exports.deleteCoupon,
    applyCoupon: exports.applyCoupon
};
