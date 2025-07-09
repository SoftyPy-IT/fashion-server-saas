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
exports.productService = exports.getShopProducts = exports.addFeaturedProducts = exports.deleteProduct = exports.updateProduct = exports.createProduct = exports.getProductDetails = exports.getProductById = exports.getAllProduct = void 0;
const crypto_1 = __importDefault(require("crypto"));
const http_status_1 = __importDefault(require("http-status"));
const mongoose_1 = __importDefault(require("mongoose"));
const QueryBuilder_1 = __importDefault(require("../../builder/QueryBuilder"));
const AppError_1 = __importDefault(require("../../errors/AppError"));
const brand_model_1 = __importDefault(require("../brand/brand.model"));
const category_model_1 = require("../category/category.model");
const image_gallery_model_1 = require("../image-gallery/image-gallery.model");
const section_model_1 = __importDefault(require("../section/section.model"));
const supplier_model_1 = __importDefault(require("../supplier/supplier.model"));
const product_model_1 = __importDefault(require("./product.model"));
const getAllProduct = (query) => __awaiter(void 0, void 0, void 0, function* () {
    const productSearchableFields = ['code'];
    const productQuery = new QueryBuilder_1.default(product_model_1.default.find({ isDeleted: false }).populate([
        {
            path: 'category',
            select: 'name slug'
        },
        {
            path: 'mainCategory',
            select: 'name slug'
        },
        {
            path: 'subCategory',
            select: 'name slug'
        }
    ]), query)
        .search(productSearchableFields)
        .filter()
        .sort()
        .paginate()
        .fields();
    const meta = yield productQuery.countTotal();
    const result = yield productQuery.queryModel;
    return { meta, result };
});
exports.getAllProduct = getAllProduct;
const getProductById = (id) => __awaiter(void 0, void 0, void 0, function* () {
    const product = yield product_model_1.default.findOne({ _id: id, isDeleted: false });
    if (!product) {
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, 'This product is not found');
    }
    return product;
});
exports.getProductById = getProductById;
const getProductDetails = (id) => __awaiter(void 0, void 0, void 0, function* () {
    const isValidObjectId = mongoose_1.default.Types.ObjectId.isValid(id);
    const queryCondition = isValidObjectId ? { _id: id } : { slug: id };
    try {
        const product = yield product_model_1.default.findOne(Object.assign(Object.assign({}, queryCondition), { isDeleted: false }));
        if (!product) {
            throw new AppError_1.default(http_status_1.default.NOT_FOUND, 'This product is not found');
        }
        // now here also add 10 related products to this product based on category, subcategory, brand using aggregation
        const relatedProducts = yield product_model_1.default.aggregate([
            {
                $match: {
                    _id: { $ne: product._id },
                    isDeleted: false,
                    $or: [
                        { category: product.category },
                        { subCategory: product.subCategory },
                        { brand: product.brand }
                    ]
                }
            },
            // Lookup category
            {
                $lookup: {
                    from: 'categories', // তোমার Category collection-এর নাম
                    localField: 'category',
                    foreignField: '_id',
                    as: 'categoryDetails'
                }
            },
            // Lookup subCategory
            {
                $lookup: {
                    from: 'subcategories', // তোমার SubCategory collection-এর নাম
                    localField: 'subCategory',
                    foreignField: '_id',
                    as: 'subCategoryDetails'
                }
            },
            // Lookup mainCategory
            {
                $lookup: {
                    from: 'maincategories',
                    localField: 'mainCategory',
                    foreignField: '_id',
                    as: 'mainCategoryDetails'
                }
            },
            { $sample: { size: 4 } },
            {
                $project: {
                    name: 1,
                    slug: 1,
                    thumbnail: 1,
                    reviews: 1,
                    rating: 1,
                    price: 1,
                    discount_price: 1,
                    category: { $arrayElemAt: ['$categoryDetails.name', 0] },
                    subCategory: { $arrayElemAt: ['$subCategoryDetails.name', 0] },
                    mainCategory: {
                        $arrayElemAt: ['$mainCategoryDetails.name', 0]
                    }
                }
            }
        ]);
        return {
            product,
            relatedProducts
        };
    }
    catch (error) {
        throw new AppError_1.default(http_status_1.default.INTERNAL_SERVER_ERROR, error.message || 'Internal Server Error');
    }
});
exports.getProductDetails = getProductDetails;
const createProduct = (req) => __awaiter(void 0, void 0, void 0, function* () {
    const session = yield mongoose_1.default.startSession();
    session.startTransaction();
    let newProduct = null;
    try {
        const { name, category, subCategory, mainCategory, brand, variants, supplier, folder } = req.body;
        // check if folder exists
        if (folder && !(yield image_gallery_model_1.FolderModel.findById(folder).session(session))) {
            throw new AppError_1.default(http_status_1.default.NOT_FOUND, 'Folder not found');
        }
        // Check if category exists
        if (!(yield category_model_1.Category.findById(category).session(session))) {
            throw new AppError_1.default(http_status_1.default.NOT_FOUND, 'Category not found');
        }
        // Check if subCategory exists
        if (subCategory && !(yield category_model_1.SubCategory.findById(subCategory).session(session))) {
            throw new AppError_1.default(http_status_1.default.NOT_FOUND, 'SubCategory not found');
        }
        // Check if mainCategory exists
        if (mainCategory && !(yield category_model_1.MainCategory.findById(mainCategory).session(session))) {
            throw new AppError_1.default(http_status_1.default.NOT_FOUND, 'MainCategory not found');
        }
        // Check if brand exists
        if (brand) {
            const existingBrand = yield brand_model_1.default.findById(brand).session(session);
            if (!existingBrand) {
                throw new AppError_1.default(http_status_1.default.NOT_FOUND, 'Brand not found');
            }
        }
        if (supplier && !(yield supplier_model_1.default.findById(supplier).session(session))) {
            throw new AppError_1.default(http_status_1.default.NOT_FOUND, 'Supplier not found');
        }
        // Create the product
        newProduct = new product_model_1.default(Object.assign(Object.assign({}, req.body), { quantity: req.body.quantity || 0, stock: req.body.quantity || 0, slug: name
                .toLowerCase()
                .replace(/[^a-zA-Z0-9]+/g, '-')
                .replace(/^-+/, '')
                .replace(/-+$/, '')
                .concat(`-${crypto_1.default.randomBytes(4).toString('hex')}`) }));
        if (variants && variants.length > 0) {
            newProduct.hasVariants = true;
            newProduct.variants = variants;
            // if variants has quantity, update the quantity of product
            const totalQuantity = variants.reduce((acc, variant) => {
                return acc + (variant.quantity || 0);
            }, 0);
            newProduct.quantity = totalQuantity;
            newProduct.stock = totalQuantity;
        }
        yield newProduct.save({ session });
        // Update brand with new product
        if (brand) {
            const existingBrand = yield brand_model_1.default.findById(brand).session(session);
            if (existingBrand) {
                existingBrand.products.push(newProduct._id);
                yield existingBrand.save({ session });
            }
        }
        // Update folder with new product
        if (folder) {
            const folderToUpdate = yield image_gallery_model_1.FolderModel.findById(folder).session(session);
            if (folderToUpdate) {
                // Check if product is already in the folder
                if (!folderToUpdate.products.includes(newProduct._id)) {
                    folderToUpdate.products.push(newProduct._id);
                    yield folderToUpdate.save({ session });
                }
            }
        }
        yield session.commitTransaction();
        session.endSession();
        return newProduct;
    }
    catch (error) {
        yield session.abortTransaction();
        session.endSession();
        // If an error occurred after creating the product, delete the product to maintain data integrity
        if (newProduct) {
            yield product_model_1.default.deleteOne({ _id: newProduct._id }).session(session);
        }
        // Remove the product from category and brand
        if (newProduct === null || newProduct === void 0 ? void 0 : newProduct._id) {
            if (newProduct.brand) {
                const brandToUpdate = yield brand_model_1.default.findById(newProduct.brand).session(session);
                if (brandToUpdate) {
                    brandToUpdate.products = brandToUpdate.products.filter((product) => product.toString() !== (newProduct === null || newProduct === void 0 ? void 0 : newProduct._id.toString()));
                    yield brandToUpdate.save({ session });
                }
            }
            // Remove from folder if it was added
            if (newProduct.folder) {
                const folderToUpdate = yield image_gallery_model_1.FolderModel.findById(newProduct.folder).session(session);
                if (folderToUpdate) {
                    folderToUpdate.products = folderToUpdate.products.filter((product) => product.toString() !== (newProduct === null || newProduct === void 0 ? void 0 : newProduct._id.toString()));
                    yield folderToUpdate.save({ session });
                }
            }
        }
        throw new AppError_1.default(http_status_1.default.INTERNAL_SERVER_ERROR, error.message);
    }
});
exports.createProduct = createProduct;
const updateProduct = (id, req) => __awaiter(void 0, void 0, void 0, function* () {
    const session = yield mongoose_1.default.startSession();
    session.startTransaction();
    try {
        const product = yield product_model_1.default.findOne({ _id: id, isDeleted: false }).session(session);
        if (!product) {
            throw new AppError_1.default(http_status_1.default.NOT_FOUND, 'This product does not exist');
        }
        const _a = req.body, { name, category, subCategory, mainCategory, brand, productTax, supplier, variants, folder } = _a, remainingProductData = __rest(_a, ["name", "category", "subCategory", "mainCategory", "brand", "productTax", "supplier", "variants", "folder"]);
        // Check if category exists
        if (category && !(yield category_model_1.Category.findById(category).session(session))) {
            throw new AppError_1.default(http_status_1.default.NOT_FOUND, 'Category not found');
        }
        // Check if subCategory exists
        if (subCategory && !(yield category_model_1.SubCategory.findById(subCategory).session(session))) {
            throw new AppError_1.default(http_status_1.default.NOT_FOUND, 'SubCategory not found');
        }
        // Check if mainCategory exists
        if (mainCategory && !(yield category_model_1.MainCategory.findById(mainCategory).session(session))) {
            throw new AppError_1.default(http_status_1.default.NOT_FOUND, 'MainCategory not found');
        }
        // Check if brand exists
        if (brand) {
            const existingBrand = yield brand_model_1.default.findById(brand).session(session);
            if (!existingBrand) {
                throw new AppError_1.default(http_status_1.default.NOT_FOUND, 'Brand not found');
            }
        }
        // check folder exists
        if (folder && !(yield image_gallery_model_1.FolderModel.findById(folder).session(session))) {
            throw new AppError_1.default(http_status_1.default.NOT_FOUND, 'Folder not found');
        }
        // Update product data
        const updatedData = Object.assign({ name,
            category,
            subCategory,
            mainCategory,
            brand,
            productTax,
            supplier,
            folder,
            variants }, remainingProductData);
        if (variants && variants.length > 0) {
            updatedData.hasVariants = true;
            updatedData.variants = variants;
            // Sum all quantities from all variant values
            const totalQuantity = variants.reduce((acc, variant) => {
                var _a;
                const variantQuantity = (_a = variant.values) === null || _a === void 0 ? void 0 : _a.reduce((sum, value) => {
                    return sum + (value.quantity || 0);
                }, 0);
                return acc + variantQuantity;
            }, 0);
            updatedData.quantity = totalQuantity;
            updatedData.stock = totalQuantity;
        }
        else {
            // For products without variants, update both quantity and stock
            updatedData.quantity = req.body.quantity || 0;
            updatedData.stock = req.body.quantity || 0;
        }
        const updatedProduct = yield product_model_1.default.findByIdAndUpdate(id, updatedData, {
            new: true,
            runValidators: true,
            session
        });
        if (!updatedProduct) {
            throw new AppError_1.default(http_status_1.default.INTERNAL_SERVER_ERROR, 'Failed to update the product');
        }
        // Update slug if name is updated
        if (name && name !== product.name) {
            updatedProduct.slug = name
                .toLowerCase()
                .replace(/[^a-zA-Z0-9]+/g, '-')
                .replace(/^-+/, '')
                .replace(/-+$/, '')
                .concat(`-${crypto_1.default.randomBytes(4).toString('hex')}`);
            yield updatedProduct.save({ session });
        }
        // Handle folder updates
        if (folder !== product.folder) {
            // Remove from old folder if exists
            if (product.folder) {
                const oldFolder = yield image_gallery_model_1.FolderModel.findById(product.folder).session(session);
                if (oldFolder) {
                    oldFolder.products = oldFolder.products.filter((prodId) => prodId.toString() !== product._id.toString());
                    yield oldFolder.save({ session });
                }
            }
            // Add to new folder if provided
            if (folder) {
                const newFolder = yield image_gallery_model_1.FolderModel.findById(folder).session(session);
                if (newFolder) {
                    // Check if product is already in the folder
                    if (!newFolder.products.includes(product._id)) {
                        newFolder.products.push(product._id);
                        yield newFolder.save({ session });
                    }
                }
            }
        }
        // Update categories' and brand's products
        const handleProductRelations = () => __awaiter(void 0, void 0, void 0, function* () {
            const removeProductFromEntity = (EntityModel, entityId) => __awaiter(void 0, void 0, void 0, function* () {
                const entity = yield EntityModel.findById(entityId).session(session);
                if (entity) {
                    entity.products = entity.products.filter((prodId) => String(prodId) !== String(product._id));
                    yield entity.save({ session });
                }
            });
            const addProductToEntity = (EntityModel, entityId) => __awaiter(void 0, void 0, void 0, function* () {
                const entity = yield EntityModel.findById(entityId).session(session);
                if (entity) {
                    entity.products.push(product._id);
                    yield entity.save({ session });
                }
            });
            // Remove from old relations
            if (product.brand)
                yield removeProductFromEntity(brand_model_1.default, product.brand);
            // Add to new relations
            if (subCategory)
                yield addProductToEntity(category_model_1.Category, subCategory);
            if (brand)
                yield addProductToEntity(brand_model_1.default, brand);
        });
        yield handleProductRelations();
        yield session.commitTransaction();
        session.endSession();
        return updatedProduct;
    }
    catch (error) {
        yield session.abortTransaction();
        session.endSession();
        throw new AppError_1.default(http_status_1.default.INTERNAL_SERVER_ERROR, error.message);
    }
});
exports.updateProduct = updateProduct;
const deleteProduct = (id) => __awaiter(void 0, void 0, void 0, function* () {
    const session = yield mongoose_1.default.startSession();
    try {
        session.startTransaction();
        // Find product that is not deleted
        const product = yield product_model_1.default.findOne({ _id: id, isDeleted: false }).session(session);
        if (!product) {
            throw new AppError_1.default(http_status_1.default.NOT_FOUND, 'This product does not exist');
        }
        // Mark product as deleted
        const deletedProduct = yield product_model_1.default.findByIdAndDelete(id, {
            session,
            new: true
        });
        if (!deletedProduct) {
            throw new AppError_1.default(http_status_1.default.NOT_FOUND, 'Failed to delete product');
        }
        // delete from sections Section Model
        yield section_model_1.default.updateMany({ products: deletedProduct._id }, { $pull: { products: deletedProduct._id } }, { session });
        // Remove product from all folders that contain it
        yield image_gallery_model_1.FolderModel.updateMany({ products: deletedProduct._id }, { $pull: { products: deletedProduct._id } }, { session });
        // Also remove from the specific folder if it exists
        if (deletedProduct.folder) {
            const folderToUpdate = yield image_gallery_model_1.FolderModel.findById(deletedProduct.folder).session(session);
            if (folderToUpdate) {
                folderToUpdate.products = folderToUpdate.products.filter((productId) => productId.toString() !== deletedProduct._id.toString());
                yield folderToUpdate.save({ session });
            }
        }
        yield session.commitTransaction();
        session.endSession();
        return null;
    }
    catch (error) {
        yield session.abortTransaction();
        session.endSession();
        throw error;
    }
});
exports.deleteProduct = deleteProduct;
const addFeaturedProducts = (req) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { products } = req.body;
        // validate products ids
        if (!products || products.length === 0) {
            throw new AppError_1.default(http_status_1.default.BAD_REQUEST, 'Please provide products to feature');
        }
        // check if products exist or not deleted
        const existingProducts = yield product_model_1.default.find({
            _id: { $in: products },
            isDeleted: false
        });
        if (existingProducts.length !== products.length) {
            throw new AppError_1.default(http_status_1.default.NOT_FOUND, 'One or more products do not exist');
        }
        // check if products already featured with specified product name
        const featuredProducts = yield product_model_1.default.find({
            _id: { $in: products },
            is_featured: true,
            isDeleted: false
        });
        if (featuredProducts.length > 0) {
            const productNames = featuredProducts.map((product) => product.name);
            throw new AppError_1.default(http_status_1.default.BAD_REQUEST, `Products ${productNames.join(', ')} are already featured`);
        }
        const updatedProducts = yield product_model_1.default.updateMany({ _id: { $in: products } }, { is_featured: true }, {
            new: true,
            runValidators: true
        });
        return updatedProducts;
    }
    catch (error) {
        throw new AppError_1.default(http_status_1.default.INTERNAL_SERVER_ERROR, error.message || 'Internal Server Error');
    }
});
exports.addFeaturedProducts = addFeaturedProducts;
const parseFilter = (filterString) => {
    return filterString ? JSON.parse(filterString) : {};
};
const buildProductFilter = (filter) => {
    const productFilter = {};
    if (filter.priceRange) {
        productFilter.price = {
            $gte: filter.priceRange.min,
            $lte: filter.priceRange.max
        };
    }
    if (filter.variants) {
        Object.keys(filter.variants).forEach((variant) => {
            if (filter.variants[variant].length > 0) {
                productFilter[`variants.values.value`] = { $in: filter.variants[variant] };
            }
        });
    }
    return productFilter;
};
const getFilterOptions = () => __awaiter(void 0, void 0, void 0, function* () {
    const products = yield product_model_1.default.find({ isDeleted: false });
    const filterOptions = {
        priceRange: { min: Infinity, max: -Infinity },
        variants: {}
    };
    products.forEach((product) => {
        if (product.price < filterOptions.priceRange.min)
            filterOptions.priceRange.min = product.price;
        if (product.price > filterOptions.priceRange.max)
            filterOptions.priceRange.max = product.price;
        if (product.variants) {
            product.variants
                .filter((variant) => variant.name !== 'Color') // Exclude "Color" variants
                .forEach((variant) => {
                if (!filterOptions.variants[variant.name]) {
                    filterOptions.variants[variant.name] = new Map();
                }
                // Combine name and value as a unique key
                variant.values.forEach((value) => {
                    const uniqueKey = `${value.name}-${value.value}`;
                    if (!filterOptions.variants[variant.name].has(uniqueKey)) {
                        filterOptions.variants[variant.name].set(uniqueKey, value);
                    }
                });
            });
        }
    });
    // Convert Maps to arrays for final output
    const variantsWithUniqueValues = {};
    Object.keys(filterOptions.variants).forEach((key) => {
        variantsWithUniqueValues[key] = Array.from(filterOptions.variants[key].values());
    });
    // Handle cases where price range might still be at initial values
    if (filterOptions.priceRange.min === Infinity)
        filterOptions.priceRange.min = 0;
    if (filterOptions.priceRange.max === -Infinity)
        filterOptions.priceRange.max = 0;
    return {
        priceRange: filterOptions.priceRange,
        variants: variantsWithUniqueValues
    };
});
const getShopProducts = (req) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const limit = parseInt(req.query.limit, 10) || 10;
        const page = parseInt(req.query.page, 10) || 1;
        const filter = parseFilter(req.query.filter);
        const productFilter = buildProductFilter(filter);
        const totalProducts = yield product_model_1.default.aggregate([
            {
                $match: Object.assign({ isDeleted: false }, productFilter)
            },
            {
                $count: 'total'
            }
        ]);
        const total = totalProducts.length > 0 ? totalProducts[0].total : 0;
        const totalPages = Math.ceil(total / limit);
        const products = yield product_model_1.default.aggregate([
            {
                $match: Object.assign({ isDeleted: false }, productFilter)
            },
            {
                $lookup: {
                    from: 'categories',
                    localField: 'category',
                    foreignField: '_id',
                    as: 'category'
                }
            },
            {
                $lookup: {
                    from: 'subcategories',
                    localField: 'subCategory',
                    foreignField: '_id',
                    as: 'subCategory'
                }
            },
            {
                $lookup: {
                    from: 'maincategories', // Ensure collection name is correct
                    localField: 'mainCategory',
                    foreignField: '_id',
                    as: 'mainCategory'
                }
            },
            {
                $project: {
                    name: 1,
                    code: 1,
                    slug: 1,
                    thumbnail: 1,
                    price: 1,
                    rating: 1,
                    reviews: 1,
                    discount_price: 1,
                    category: { $arrayElemAt: ['$category.name', 0] },
                    reviewCount: { $size: '$reviews' },
                    subCategory: { $arrayElemAt: ['$subCategory.name', 0] },
                    mainCategory: { $arrayElemAt: ['$mainCategory.name', 0] }
                }
            },
            { $skip: (page - 1) * limit },
            { $limit: limit }
        ]);
        const filterOptions = yield getFilterOptions();
        return {
            data: products,
            meta: {
                total,
                page,
                limit,
                totalPages
            },
            filterOptions
        };
    }
    catch (error) {
        throw new AppError_1.default(http_status_1.default.BAD_REQUEST, error.message);
    }
});
exports.getShopProducts = getShopProducts;
exports.productService = {
    getAllProduct: exports.getAllProduct,
    getProductById: exports.getProductById,
    createProduct: exports.createProduct,
    updateProduct: exports.updateProduct,
    deleteProduct: exports.deleteProduct,
    addFeaturedProducts: exports.addFeaturedProducts,
    getProductDetails: exports.getProductDetails,
    getShopProducts: exports.getShopProducts
};
