"use strict";
// file path: services/Quantity.service.ts
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
exports.QuantityService = exports.deleteQuantity = exports.updateQuantity = exports.createQuantity = exports.getQuantityById = exports.getAllQuantity = void 0;
const Quantity_model_1 = __importDefault(require("./Quantity.model"));
const product_model_1 = __importDefault(require("../product/product.model"));
const QueryBuilder_1 = __importDefault(require("../../builder/QueryBuilder"));
const http_status_1 = __importDefault(require("http-status"));
const AppError_1 = __importDefault(require("../../errors/AppError"));
const cloudinary_1 = require("../../utils/cloudinary");
const image_gallery_model_1 = require("../image-gallery/image-gallery.model");
const getAllQuantity = (query) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const QuantitySearchableFields = [
            'referenceNo',
            'products.productName',
            'products.productCode'
        ];
        const QuantityQuery = new QueryBuilder_1.default(Quantity_model_1.default.find(), query)
            .search(QuantitySearchableFields)
            .filter()
            .sort()
            .paginate()
            .fields();
        const meta = yield QuantityQuery.countTotal();
        const result = yield QuantityQuery.queryModel;
        return { meta, result };
    }
    catch (error) {
        throw new AppError_1.default(http_status_1.default.INTERNAL_SERVER_ERROR, error.message || 'Internal Server Error');
    }
});
exports.getAllQuantity = getAllQuantity;
const getQuantityById = (id) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const result = yield Quantity_model_1.default.findOne({ _id: id });
        if (!result) {
            throw new AppError_1.default(http_status_1.default.NOT_FOUND, 'This Quantity adjustment does not exist');
        }
        return result;
    }
    catch (error) {
        throw new AppError_1.default(http_status_1.default.INTERNAL_SERVER_ERROR, error.message || 'Internal Server Error');
    }
});
exports.getQuantityById = getQuantityById;
const adjustProductStock = (_a) => __awaiter(void 0, [_a], void 0, function* ({ productId, type, quantity, variantName, variantValue }) {
    const existingProduct = (yield product_model_1.default.findById(productId));
    if (!existingProduct) {
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, `Product with id ${productId} not found`);
    }
    quantity = Number(quantity);
    // If variant information is provided and product has variants
    if (existingProduct.hasVariants && variantName && variantValue) {
        // Find the variant
        const variantIndex = existingProduct.variants.findIndex((variant) => variant.name === variantName);
        if (variantIndex === -1) {
            throw new AppError_1.default(http_status_1.default.BAD_REQUEST, `Variant ${variantName} not found for product ${existingProduct.name}`);
        }
        // Find the specific variant value
        const valueIndex = existingProduct.variants[variantIndex].values.findIndex((val) => val.name === variantValue || val.value === variantValue);
        if (valueIndex === -1) {
            throw new AppError_1.default(http_status_1.default.BAD_REQUEST, `Variant value ${variantValue} not found for variant ${variantName}`);
        }
        const currentVariantQuantity = existingProduct.variants[variantIndex].values[valueIndex].quantity;
        // Adjust variant-specific stock
        if (type === 'Addition') {
            existingProduct.variants[variantIndex].values[valueIndex].quantity =
                currentVariantQuantity + quantity;
        }
        else if (type === 'Subtraction') {
            if (currentVariantQuantity < quantity) {
                throw new AppError_1.default(http_status_1.default.BAD_REQUEST, `Insufficient stock for variant ${variantName}:${variantValue} of product ${existingProduct.name}`);
            }
            existingProduct.variants[variantIndex].values[valueIndex].quantity =
                currentVariantQuantity - quantity;
        }
        // Calculate total stock across all variants
        let totalVariantStock = 0;
        existingProduct.variants.forEach((variant) => {
            variant.values.forEach((value) => {
                totalVariantStock += value.quantity;
            });
        });
        // Update main product stock values
        existingProduct.stock = totalVariantStock;
        existingProduct.quantity = totalVariantStock;
    }
    // Handle regular product without variants
    else {
        const currentStock = Number(existingProduct.stock);
        const currentQuantity = Number(existingProduct.quantity);
        if (type === 'Addition') {
            existingProduct.stock = currentStock + quantity;
            existingProduct.quantity = currentQuantity + quantity;
        }
        else if (type === 'Subtraction') {
            if (currentStock < quantity) {
                throw new AppError_1.default(http_status_1.default.BAD_REQUEST, `Insufficient stock for product ${existingProduct.name}`);
            }
            existingProduct.stock = currentStock - quantity;
            existingProduct.quantity = currentQuantity - quantity;
        }
    }
    // Update stockout status
    // existingProduct.is_stockout = existingProduct.stock === 0;
    yield existingProduct.save();
});
const createQuantity = (req) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { products } = req.body;
        // Handle file upload if present
        if (req.file) {
            const folder = 'Attachments';
            const isFolderExist = yield image_gallery_model_1.FolderModel.findOne({ name: folder });
            if (!isFolderExist) {
                yield image_gallery_model_1.FolderModel.create({ name: folder });
            }
            const result = (yield (0, cloudinary_1.saveAttachment)(req.file));
            yield image_gallery_model_1.ImageGalleryModel.create({
                folder: isFolderExist === null || isFolderExist === void 0 ? void 0 : isFolderExist._id,
                public_id: result.public_id,
                url: result.secure_url
            });
            req.body.attachDocument = result.secure_url;
        }
        // Process each product adjustment
        for (const product of products) {
            yield adjustProductStock({
                productId: product.productId,
                type: product.type,
                quantity: product.quantity,
                variantName: product.variantName,
                variantValue: product.variantValue
            });
        }
        // Create the quantity record
        const result = yield Quantity_model_1.default.create(Object.assign(Object.assign({}, req.body), { products: products.map((product) => ({
                productId: product.productId,
                productName: product.productName,
                productCode: product.productCode,
                type: product.type,
                quantity: product.quantity,
                serialNumber: product.serialNumber,
                variant: {
                    name: product.variantName,
                    value: product.variantValue
                }
            })) }));
        return result;
    }
    catch (error) {
        throw new AppError_1.default(http_status_1.default.INTERNAL_SERVER_ERROR, error.message || 'Internal Server Error');
    }
});
exports.createQuantity = createQuantity;
const updateQuantity = (id, req) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const quantityRecord = yield Quantity_model_1.default.findOne({ _id: id });
        if (!quantityRecord) {
            throw new AppError_1.default(http_status_1.default.NOT_FOUND, 'This Quantity does not exist');
        }
        // // Reverse the previous quantity adjustments
        // for (const product of quantityRecord.products) {
        //   const { productId, type, quantity: qty } = product;
        //   await adjustProductStock(productId, type, qty);
        // }
        // Adjust the quantities of the new products
        // const { products } = req.body;
        // for (const product of products) {
        //   const { productId, type, quantity: qty } = product;
        //   await adjustProductStock(productId, type, qty);
        // }
        // Handle file attachment
        if (req.file) {
            // remove the previous attachment from cloudinary if it exists in the database, remove from cloudinary using public_id
            const image = yield image_gallery_model_1.ImageGalleryModel.findOne({ url: quantityRecord.attachDocument });
            if (image) {
                yield (0, cloudinary_1.deleteAttachment)(image.public_id);
            }
            const result = (yield (0, cloudinary_1.saveAttachment)(req.file));
            const folder = 'Attachments';
            const isFolderExist = yield image_gallery_model_1.FolderModel.findOne({ name: folder });
            if (!isFolderExist) {
                yield image_gallery_model_1.FolderModel.create({ name: folder });
            }
            yield image_gallery_model_1.ImageGalleryModel.create({
                folder: isFolderExist === null || isFolderExist === void 0 ? void 0 : isFolderExist._id,
                public_id: result.public_id,
                url: result.secure_url
            });
            req.body.attachDocument = result.secure_url;
        }
        const remainingQuantityData = __rest(req.body, []);
        const modifiedUpdatedData = Object.assign({}, remainingQuantityData);
        const result = yield Quantity_model_1.default.findByIdAndUpdate(id, modifiedUpdatedData, {
            new: true,
            runValidators: true
        });
        return result;
    }
    catch (error) {
        throw new AppError_1.default(http_status_1.default.INTERNAL_SERVER_ERROR, error.message || 'Internal Server Error');
    }
});
exports.updateQuantity = updateQuantity;
const deleteQuantity = (id) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const quantity = yield Quantity_model_1.default.findOne({ _id: id });
        if (!quantity) {
            throw new AppError_1.default(http_status_1.default.NOT_FOUND, 'This Quantity adjustment does not exist');
        }
        // Reverse the quantity adjustments
        for (const product of quantity.products) {
            const { productId, type, quantity } = product;
            const existingProduct = yield product_model_1.default.findById(productId);
            if (!existingProduct) {
                throw new AppError_1.default(http_status_1.default.NOT_FOUND, `Product with id ${productId} not found`);
            }
            if (type === 'Addition') {
                existingProduct.stock -= quantity;
            }
            else if (type === 'Subtraction') {
                existingProduct.stock += quantity;
            }
            yield existingProduct.save();
        }
        yield Quantity_model_1.default.findByIdAndDelete(id);
        return null;
    }
    catch (error) {
        throw new AppError_1.default(http_status_1.default.INTERNAL_SERVER_ERROR, error.message || 'Internal Server Error');
    }
});
exports.deleteQuantity = deleteQuantity;
exports.QuantityService = {
    getAllQuantity: exports.getAllQuantity,
    getQuantityById: exports.getQuantityById,
    createQuantity: exports.createQuantity,
    updateQuantity: exports.updateQuantity,
    deleteQuantity: exports.deleteQuantity
};
