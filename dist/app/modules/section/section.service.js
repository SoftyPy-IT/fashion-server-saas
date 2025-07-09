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
exports.sectionService = exports.deleteSection = exports.updateSection = exports.createSection = exports.getSectionById = exports.getAllSection = void 0;
const section_model_1 = __importDefault(require("./section.model"));
const QueryBuilder_1 = __importDefault(require("../../builder/QueryBuilder"));
const http_status_1 = __importDefault(require("http-status"));
const AppError_1 = __importDefault(require("../../errors/AppError"));
const product_model_1 = __importDefault(require("../product/product.model"));
const getAllSection = (query) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const sectionSearchableFields = ['name'];
        const sectionQuery = new QueryBuilder_1.default(section_model_1.default.find({}).populate({
            path: 'products',
            match: {
                isDeleted: false
            },
            select: 'name code price thumbnail discount_price short_description category images slug',
            populate: [
                {
                    path: 'category', // Populate the category field
                    select: 'name slug' // Select fields you want from the category collection
                },
                {
                    path: 'mainCategory',
                    select: 'name slug'
                },
                {
                    path: 'subCategory',
                    select: 'name slug'
                }
            ]
        }), query)
            .search(sectionSearchableFields)
            .filter()
            .sort()
            .paginate()
            .fields();
        const meta = yield sectionQuery.countTotal();
        const result = yield sectionQuery.queryModel;
        return { meta, result };
    }
    catch (error) {
        throw new AppError_1.default(http_status_1.default.INTERNAL_SERVER_ERROR, error.message || 'Internal Server Error');
    }
});
exports.getAllSection = getAllSection;
const getSectionById = (id, req) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const { id } = req.params;
        const limit = parseInt(req.query.limit, 10) || 10;
        const page = parseInt(req.query.page, 10) || 1;
        const searchTerm = req.query.searchTerm;
        const section = yield section_model_1.default.findOne({ _id: id });
        if (!section) {
            throw new AppError_1.default(http_status_1.default.NOT_FOUND, 'This section is not found');
        }
        const totalProducts = yield section_model_1.default.aggregate([
            { $match: { _id: section._id } },
            { $unwind: '$products' },
            { $count: 'total' }
        ]);
        const total = ((_a = totalProducts[0]) === null || _a === void 0 ? void 0 : _a.total) || 0;
        const totalPages = Math.ceil(total / limit);
        const products = yield section_model_1.default.findOne({ _id: id })
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
                { path: 'mainCategory', select: 'name' },
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
        const result = Object.assign(Object.assign({}, section.toJSON()), { products: {
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
exports.getSectionById = getSectionById;
const createSection = (req) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { products } = req.body;
        // check products exist or not in the database
        const isProductsExist = yield product_model_1.default.find({ _id: { $in: products } });
        if (products && products.length !== isProductsExist.length) {
            throw new AppError_1.default(http_status_1.default.BAD_REQUEST, `${products.length - isProductsExist.length} products not found`);
        }
        const result = yield section_model_1.default.create(req.body);
        return result;
    }
    catch (error) {
        throw new AppError_1.default(http_status_1.default.INTERNAL_SERVER_ERROR, error.message || 'Internal Server Error');
    }
});
exports.createSection = createSection;
const updateSection = (id, req) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { title, products, productId, action, type, images } = req.body;
        // Check if the section with the same title exists (excluding the current section)
        const isExist = yield section_model_1.default.findOne({ title, _id: { $ne: id } });
        if (isExist) {
            throw new AppError_1.default(http_status_1.default.BAD_REQUEST, 'This section already exists');
        }
        // Fetch the section by ID
        const section = yield section_model_1.default.findById(id);
        if (!section) {
            throw new AppError_1.default(http_status_1.default.NOT_FOUND, 'This section does not exist');
        }
        // If products are provided, validate their existence in the database
        if (products && products.length > 0) {
            const validProducts = yield product_model_1.default.find({ _id: { $in: products } });
            // Check for missing products
            if (products.length !== validProducts.length) {
                const validProductIds = validProducts.map((product) => product._id.toString());
                const missingProducts = products.filter((productId) => !validProductIds.includes(productId));
                throw new AppError_1.default(http_status_1.default.BAD_REQUEST, `Products not found: ${missingProducts.join(', ')}`);
            }
            // Add valid products to the section, avoiding duplicates
            section.products = Array.from(new Set([...section.products.map((product) => product.toString()), ...products]));
        }
        // Handle product add/remove actions
        if (productId && action) {
            if (action === 'add') {
                if (!section.products.includes(productId)) {
                    section.products.push(productId);
                }
                else {
                    throw new AppError_1.default(http_status_1.default.BAD_REQUEST, `Product already exists in the section: ${productId}`);
                }
            }
            else if (action === 'remove') {
                section.products = section.products.filter((product) => product.toString() !== productId);
            }
        }
        // Update other fields if provided
        if (title)
            section.title = title;
        if (req.body.subTitle)
            section.subTitle = req.body.subTitle;
        if (req.body.description)
            section.description = req.body.description;
        // ✅ Fix: Only update images if type !== "product" and images is valid
        if (type !== 'product' && images !== undefined && images !== null) {
            if (typeof images === 'object' && !Array.isArray(images)) {
                if ((images.desktop === undefined || Array.isArray(images.desktop)) &&
                    (images.mobile === undefined || Array.isArray(images.mobile))) {
                    section.images = images;
                }
                else {
                    throw new AppError_1.default(http_status_1.default.BAD_REQUEST, 'Invalid images format: desktop and mobile must be arrays');
                }
            }
            else {
                throw new AppError_1.default(http_status_1.default.BAD_REQUEST, 'Invalid images format: should be an object with desktop & mobile arrays');
            }
        }
        if (req.body.style)
            section.style = req.body.style;
        if (req.body.row)
            section.row = req.body.row;
        // Save the updated section
        const result = yield section.save();
        return result;
    }
    catch (error) {
        throw new AppError_1.default(http_status_1.default.INTERNAL_SERVER_ERROR, error.message || 'Internal Server Error');
    }
});
exports.updateSection = updateSection;
const deleteSection = (id) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const section = yield section_model_1.default.findOne({ _id: id });
        if (!section) {
            throw new AppError_1.default(http_status_1.default.NOT_FOUND, 'This section is not found');
        }
        yield section_model_1.default.findByIdAndDelete(id);
        return null;
    }
    catch (error) {
        throw new AppError_1.default(http_status_1.default.INTERNAL_SERVER_ERROR, error.message || 'Internal Server Error');
    }
});
exports.deleteSection = deleteSection;
exports.sectionService = {
    getAllSection: exports.getAllSection,
    getSectionById: exports.getSectionById,
    createSection: exports.createSection,
    updateSection: exports.updateSection,
    deleteSection: exports.deleteSection
};
