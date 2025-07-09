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
exports.categoryService = exports.updateCategoryOrder = exports.getFullCategoryTree = exports.deleteSubCategory = exports.deleteCategory = exports.deleteMainCategory = exports.updateSubCategory = exports.createSubCategory = exports.updateCategory = exports.createCategory = exports.updateMainCategory = exports.createMainCategory = exports.getAllSubCategory = exports.getAllCategory = exports.getAllMainCategory = void 0;
const http_status_1 = __importDefault(require("http-status"));
const QueryBuilder_1 = __importDefault(require("../../builder/QueryBuilder"));
const AppError_1 = __importDefault(require("../../errors/AppError"));
const product_model_1 = __importDefault(require("../product/product.model"));
const category_model_1 = require("./category.model");
const mongoose_1 = __importDefault(require("mongoose"));
const getAllMainCategory = (query) => __awaiter(void 0, void 0, void 0, function* () {
    const categorySearchableFields = ['name'];
    const categoryQuery = new QueryBuilder_1.default(category_model_1.MainCategory.find()
        .sort({ serial: 1 })
        .populate({
        path: 'categories.category',
        select: 'name subCategories image slug',
        populate: {
            path: 'subCategories.subCategory',
            select: 'name slug'
        }
    }), query)
        .search(categorySearchableFields)
        .filter()
        .sort()
        .paginate()
        .fields();
    const meta = yield categoryQuery.countTotal();
    let result = yield categoryQuery.queryModel;
    result = result.map((mainCategory) => {
        return Object.assign(Object.assign({}, mainCategory.toObject()), { categories: mainCategory.categories.sort((a, b) => a.serial - b.serial) });
    });
    return { meta, result };
});
exports.getAllMainCategory = getAllMainCategory;
const getAllCategory = (query) => __awaiter(void 0, void 0, void 0, function* () {
    const categorySearchableFields = ['name'];
    const categoryQuery = new QueryBuilder_1.default(category_model_1.Category.find().populate([
        {
            path: 'subCategories.subCategory',
            select: 'name slug mainCategory'
        },
        {
            path: 'mainCategory',
            select: 'name slug serial'
        }
    ]), query)
        .search(categorySearchableFields)
        .filter()
        .fields();
    const meta = yield categoryQuery.countTotal();
    const result = yield categoryQuery.queryModel;
    // Group the result by main category
    const groupedCategories = result.reduce((acc, category) => {
        var _a;
        const mainCategory = (_a = category.mainCategory) === null || _a === void 0 ? void 0 : _a.name;
        if (mainCategory) {
            if (!acc[mainCategory]) {
                acc[mainCategory] = [];
            }
            acc[mainCategory].push(category);
        }
        return acc;
    }, {});
    return { meta, groupedCategories };
});
exports.getAllCategory = getAllCategory;
const getAllSubCategory = (query) => __awaiter(void 0, void 0, void 0, function* () {
    const categorySearchableFields = ['name'];
    const categoryQuery = new QueryBuilder_1.default(category_model_1.SubCategory.find()
        .sort({ serial: 1 })
        .populate([
        {
            path: 'category',
            select: 'name slug serial',
            options: { sort: { serial: 1 } }
        }
    ]), query)
        .search(categorySearchableFields)
        .filter()
        .sort()
        .paginate()
        .fields();
    const meta = yield categoryQuery.countTotal();
    const result = yield categoryQuery.queryModel;
    return { meta, result };
});
exports.getAllSubCategory = getAllSubCategory;
const createMainCategory = (req) => __awaiter(void 0, void 0, void 0, function* () {
    const { name, image, categories } = req.body;
    // Check if the main category already exists
    const existingMainCategory = yield category_model_1.MainCategory.findOne({ name });
    if (existingMainCategory) {
        throw new AppError_1.default(http_status_1.default.BAD_REQUEST, 'Main Category already exists');
    }
    // Create slug from name
    const slug = name.toLowerCase().replace(/\s+/g, '-');
    // Find the highest serial number to determine the next one
    const highestSerial = yield category_model_1.MainCategory.findOne().sort({ serial: -1 }).select('serial');
    const nextSerial = highestSerial ? highestSerial.serial + 1 : 1;
    // Create main category with dynamic serial
    const mainCategoryData = {
        name,
        image,
        slug,
        serial: nextSerial,
        categories: []
    };
    // Check if any categories were provided
    if (categories && categories.length) {
        // Validate that all categories exist
        const validCategories = yield category_model_1.Category.find({ _id: { $in: categories } });
        if (validCategories.length !== categories.length) {
            throw new AppError_1.default(http_status_1.default.BAD_REQUEST, 'One or more categories do not exist');
        }
        // Add serialized categories
        mainCategoryData.categories = categories.map((categoryId, index) => ({
            category: categoryId,
            serial: index + 1
        }));
        // Create main category
        const newMainCategory = yield category_model_1.MainCategory.create(mainCategoryData);
        // Update the categories to point to this main category
        yield category_model_1.Category.updateMany({ _id: { $in: categories } }, { mainCategory: newMainCategory._id });
        return newMainCategory;
    }
    else {
        // Create main category without categories
        return category_model_1.MainCategory.create(mainCategoryData);
    }
});
exports.createMainCategory = createMainCategory;
const updateMainCategory = (req) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const { name, image, categories } = req.body;
    // Check if the main category exists
    const existingMainCategory = yield category_model_1.MainCategory.findById(id);
    if (!existingMainCategory) {
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, 'Main Category not found');
    }
    // Create slug from name if name is provided
    const updateData = {};
    if (name) {
        updateData.name = name;
        updateData.slug = name.toLowerCase().replace(/\s+/g, '-');
    }
    // Add image to update data if provided
    if (image !== undefined) {
        updateData.image = image;
    }
    // Handle categories if provided
    if (categories !== undefined) {
        // If categories array is empty, clear all categories
        if (!categories.length) {
            updateData.categories = [];
            // Get previous categories to remove references
            const previousCategoryIds = existingMainCategory.categories.map((item) => item.category.toString());
            if (previousCategoryIds.length > 0) {
                yield category_model_1.Category.updateMany({ _id: { $in: previousCategoryIds } }, { $unset: { mainCategory: '' } });
            }
        }
        else {
            // Validate that all categories exist
            const validCategories = yield category_model_1.Category.find({ _id: { $in: categories } });
            if (validCategories.length !== categories.length) {
                throw new AppError_1.default(http_status_1.default.BAD_REQUEST, 'One or more categories do not exist');
            }
            updateData.categories = categories.map((categoryId, index) => ({
                category: categoryId,
                serial: index + 1
            }));
            // Get previous categories that are no longer in the list
            const previousCategoryIds = existingMainCategory.categories.map((item) => item.category.toString());
            const removedCategoryIds = previousCategoryIds.filter((id) => !categories.includes(id));
            // Update categories to point to this main category
            yield category_model_1.Category.updateMany({ _id: { $in: categories } }, { mainCategory: id });
            // Remove reference for categories no longer in the list
            if (removedCategoryIds.length > 0) {
                yield category_model_1.Category.updateMany({ _id: { $in: removedCategoryIds } }, { $unset: { mainCategory: '' } });
            }
        }
    }
    // Update the main category
    return category_model_1.MainCategory.findByIdAndUpdate(id, updateData, { new: true, runValidators: true });
});
exports.updateMainCategory = updateMainCategory;
const createCategory = (req) => __awaiter(void 0, void 0, void 0, function* () {
    const { name, image, subCategories, mainCategory } = req.body;
    // Create slug from name
    const slug = name.toLowerCase().replace(/\s+/g, '-');
    // Check if the category already exists with the same name
    const existingCategory = yield category_model_1.Category.findOne({
        name,
        mainCategory: mainCategory || { $exists: false }
    });
    if (existingCategory) {
        throw new AppError_1.default(http_status_1.default.BAD_REQUEST, mainCategory
            ? 'Category with this name already exists under the selected main category'
            : 'Category with this name already exists without a main category');
    }
    // Prepare category data
    const categoryData = {
        name,
        slug,
        subCategories: []
    };
    if (image !== undefined)
        categoryData.image = image;
    // Validate and handle main category if provided
    if (mainCategory) {
        const validMainCategory = yield category_model_1.MainCategory.findById(mainCategory);
        if (!validMainCategory) {
            throw new AppError_1.default(http_status_1.default.BAD_REQUEST, 'Main Category does not exist');
        }
        categoryData.mainCategory = mainCategory;
    }
    // Validate and handle sub-categories if provided
    if (subCategories && subCategories.length > 0) {
        const validSubCategories = yield category_model_1.SubCategory.find({ _id: { $in: subCategories } });
        if (validSubCategories.length !== subCategories.length) {
            throw new AppError_1.default(http_status_1.default.BAD_REQUEST, 'One or more subCategories do not exist');
        }
        categoryData.subCategories = subCategories.map((subCategoryId, index) => ({
            subCategory: subCategoryId,
            serial: index + 1
        }));
    }
    // Create the category
    const newCategory = yield category_model_1.Category.create(categoryData);
    // Update subcategories to reference this category if provided
    if (subCategories && subCategories.length > 0) {
        yield category_model_1.SubCategory.updateMany({ _id: { $in: subCategories } }, { category: newCategory._id });
    }
    // If main category provided, add this category to the main category's categories list
    if (mainCategory) {
        // Find the highest serial in the main category's categories
        const mainCategoryDoc = yield category_model_1.MainCategory.findById(mainCategory);
        const categories = (mainCategoryDoc === null || mainCategoryDoc === void 0 ? void 0 : mainCategoryDoc.categories) || [];
        const highestSerial = categories.length > 0 ? Math.max(...categories.map((c) => c.serial)) : 0;
        yield category_model_1.MainCategory.findByIdAndUpdate(mainCategory, {
            $push: { categories: { category: newCategory._id, serial: highestSerial + 1 } }
        });
    }
    return newCategory;
});
exports.createCategory = createCategory;
const updateCategory = (req) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const { name, image, subCategories, mainCategory: newMainCategory, isActive, isUpdateStatus } = req.body;
    const existingCategory = yield category_model_1.Category.findById(id);
    if (!existingCategory) {
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, 'Category not found');
    }
    console.log(existingCategory.mainCategory);
    console.log(isActive);
    // update the isActive true or false in category field associated with the main category
    if (isActive !== undefined && existingCategory.mainCategory) {
        const mainCategoryDoc = yield category_model_1.MainCategory.findById(existingCategory.mainCategory);
        if (mainCategoryDoc) {
            const category = mainCategoryDoc.categories.find((c) => c.category.toString() === id);
            if (category) {
                yield category_model_1.MainCategory.updateOne({
                    _id: existingCategory.mainCategory,
                    'categories.category': id
                }, {
                    $set: { 'categories.$.isActive': isActive }
                });
            }
        }
    }
    // Prepare update data
    const updateData = {};
    // Update name and slug if provided
    if (name) {
        updateData.name = name;
        updateData.slug = name.toLowerCase().replace(/\s+/g, '-');
    }
    // Update image if provided
    if (image !== undefined) {
        updateData.image = image;
    }
    // Set isActive if provided (only when isUpdateStatus is true)
    if (isActive !== undefined && isUpdateStatus) {
        updateData.isActive = isActive;
    }
    // Handle main category changes if provided
    if (newMainCategory !== undefined) {
        // If newMainCategory is null or empty string, remove the association
        if (!newMainCategory) {
            // Remove from old main category if exists
            if (existingCategory.mainCategory) {
                yield category_model_1.MainCategory.findByIdAndUpdate(existingCategory.mainCategory, {
                    $pull: { categories: { category: id } }
                });
                updateData.$unset = { mainCategory: '' };
            }
        }
        else {
            // Validate the new main category exists
            const validMainCategory = yield category_model_1.MainCategory.findById(newMainCategory);
            if (!validMainCategory) {
                throw new AppError_1.default(http_status_1.default.BAD_REQUEST, 'Main Category does not exist');
            }
            // If main category is changing
            if (!existingCategory.mainCategory ||
                existingCategory.mainCategory.toString() !== newMainCategory) {
                // Remove from old main category if exists
                if (existingCategory.mainCategory) {
                    yield category_model_1.MainCategory.findByIdAndUpdate(existingCategory.mainCategory, {
                        $pull: { categories: { category: id } }
                    });
                }
                // Find the highest serial in the main category's categories
                const categories = validMainCategory.categories || [];
                const highestSerial = categories.length > 0 ? Math.max(...categories.map((c) => c.serial)) : 0;
                // Add to new main category with next serial
                yield category_model_1.MainCategory.findByIdAndUpdate(newMainCategory, {
                    $push: {
                        categories: {
                            category: id,
                            serial: highestSerial + 1,
                            isActive: isActive !== undefined ? isActive : existingCategory.isActive
                        }
                    }
                });
            }
            updateData.mainCategory = newMainCategory;
        }
    }
    // Handle subcategories if provided
    if (subCategories !== undefined) {
        // If subCategories is empty, clear all associations
        if (!subCategories.length) {
            updateData.subCategories = [];
            // Get existing subcategories to remove references
            const previousSubCategoryIds = existingCategory.subCategories.map((item) => item.subCategory.toString());
            if (previousSubCategoryIds.length > 0) {
                yield category_model_1.SubCategory.updateMany({ _id: { $in: previousSubCategoryIds } }, { $unset: { category: '' } });
            }
        }
        else {
            // Validate that all subCategories exist
            const validSubCategories = yield category_model_1.SubCategory.find({ _id: { $in: subCategories } });
            if (validSubCategories.length !== subCategories.length) {
                throw new AppError_1.default(http_status_1.default.BAD_REQUEST, 'One or more subCategories do not exist');
            }
            updateData.subCategories = subCategories.map((subCategoryId, index) => ({
                subCategory: subCategoryId,
                serial: index + 1
            }));
            // Get previous subcategories that are no longer in the list
            const previousSubCategoryIds = existingCategory.subCategories.map((item) => item.subCategory.toString());
            const removedSubCategoryIds = previousSubCategoryIds.filter((id) => !subCategories.includes(id));
            // Update subcategories to point to this category
            yield category_model_1.SubCategory.updateMany({ _id: { $in: subCategories } }, { category: id });
            // Remove reference for subcategories no longer in the list
            if (removedSubCategoryIds.length > 0) {
                yield category_model_1.SubCategory.updateMany({ _id: { $in: removedSubCategoryIds } }, { $unset: { category: '' } });
            }
        }
    }
    // Update the category
    return category_model_1.Category.findByIdAndUpdate(id, updateData, { new: true, runValidators: true });
});
exports.updateCategory = updateCategory;
const createSubCategory = (req) => __awaiter(void 0, void 0, void 0, function* () {
    const { name } = req.body;
    // Check if the subCategory already exists
    const existingSubCategory = yield category_model_1.SubCategory.findOne({ name });
    if (existingSubCategory) {
        throw new AppError_1.default(http_status_1.default.BAD_REQUEST, 'SubCategory already exists');
    }
    // Create the subCategory
    return category_model_1.SubCategory.create({
        name,
        slug: name.toLowerCase().replace(/ /g, '-')
    });
});
exports.createSubCategory = createSubCategory;
const updateSubCategory = (req) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const { name } = req.body;
    // Check if the subCategory exists
    const existingSubCategory = yield category_model_1.SubCategory.findById(id);
    if (!existingSubCategory) {
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, 'SubCategory not found');
    }
    // Update the subCategory
    return category_model_1.SubCategory.findByIdAndUpdate(id, { name, slug: name.toLowerCase().replace(/ /g, '-') }, { new: true, runValidators: true });
});
exports.updateSubCategory = updateSubCategory;
const deleteMainCategory = (id) => __awaiter(void 0, void 0, void 0, function* () {
    const existingMainCategory = yield category_model_1.MainCategory.findById(id);
    if (!existingMainCategory) {
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, 'Main Category not found');
    }
    // Get all categories associated with this main category
    const categoryIds = existingMainCategory.categories.map((item) => item.category);
    // Remove main category reference from all associated categories
    if (categoryIds && categoryIds.length > 0) {
        yield category_model_1.Category.updateMany({ _id: { $in: categoryIds } }, { $unset: { mainCategory: '' } });
    }
    // Delete the main category
    yield category_model_1.MainCategory.findByIdAndDelete(id);
    return null;
});
exports.deleteMainCategory = deleteMainCategory;
const deleteCategory = (id) => __awaiter(void 0, void 0, void 0, function* () {
    const existingCategory = yield category_model_1.Category.findById(id);
    if (!existingCategory) {
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, 'Category not found');
    }
    // Remove category from main category if it belongs to one
    if (existingCategory.mainCategory) {
        yield category_model_1.MainCategory.findByIdAndUpdate(existingCategory.mainCategory, {
            $pull: { categories: { category: id } }
        });
    }
    // Get all subcategories associated with this category
    const subCategoryIds = existingCategory.subCategories.map((item) => item.subCategory);
    // Remove category reference from all associated subcategories
    if (subCategoryIds && subCategoryIds.length > 0) {
        yield category_model_1.SubCategory.updateMany({ _id: { $in: subCategoryIds } }, { $unset: { category: '' } });
    }
    // Delete the category
    yield category_model_1.Category.findByIdAndDelete(id);
    return null;
});
exports.deleteCategory = deleteCategory;
const deleteSubCategory = (id) => __awaiter(void 0, void 0, void 0, function* () {
    const existingSubCategory = yield category_model_1.SubCategory.findById(id);
    if (!existingSubCategory) {
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, 'SubCategory not found');
    }
    // Remove subcategory from any category that includes it
    if (existingSubCategory.category) {
        yield category_model_1.Category.findByIdAndUpdate(existingSubCategory.category, {
            $pull: { subCategories: { subCategory: id } }
        });
    }
    // Delete the subcategory
    yield category_model_1.SubCategory.findByIdAndDelete(id);
    return null;
});
exports.deleteSubCategory = deleteSubCategory;
const getFullCategoryTree = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Fetch the main categories and populate category and subcategory data
        const mainCategories = yield category_model_1.MainCategory.find()
            .sort({ serial: 1 })
            .populate({
            path: 'categories.category',
            populate: {
                path: 'subCategories.subCategory' // Populate the subcategories field
            }
        })
            .lean()
            .exec();
        // Filter out inactive categories and sort them
        mainCategories.forEach((mainCategory) => {
            // Remove inactive categories
            mainCategory.categories = mainCategory.categories.filter((cat) => cat.category && cat.category.isActive);
            // Sort Categories within each MainCategory by serial
            mainCategory.categories.sort((a, b) => a.serial - b.serial);
            // Sort Subcategories within each Category by serial
            mainCategory.categories.forEach((category) => {
                if (category.category && category.category.subCategories) {
                    category.category.subCategories.sort((a, b) => a.serial - b.serial);
                }
            });
        });
        return mainCategories;
    }
    catch (error) {
        console.error(error);
        throw new AppError_1.default(http_status_1.default.BAD_REQUEST, 'Error fetching category tree');
    }
});
exports.getFullCategoryTree = getFullCategoryTree;
const updateCategoryTree = (req) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const session = yield mongoose_1.default.startSession();
    session.startTransaction();
    try {
        const { categories, mainCategoryId } = req.body;
        // Validate main category
        const mainCategory = yield category_model_1.MainCategory.findById(mainCategoryId)
            .populate('categories.category')
            .session(session);
        if (!mainCategory) {
            throw new AppError_1.default(http_status_1.default.NOT_FOUND, `Main Category with ID ${mainCategoryId} not found`);
        }
        // Create a map to store updated subcategories for each category
        const categorySubcategoriesMap = new Map();
        // First pass: Process all categories and create their subcategory arrays
        for (const categoryUpdate of categories) {
            const subCategories = ((_a = categoryUpdate.subCategories) === null || _a === void 0 ? void 0 : _a.map((sub) => ({
                subCategory: sub.subCategoryId,
                serial: sub.serial
            }))) || [];
            categorySubcategoriesMap.set(categoryUpdate.categoryId, subCategories);
            // Update category serial in main category
            yield category_model_1.MainCategory.updateOne({
                _id: mainCategoryId,
                'categories.category': categoryUpdate.categoryId
            }, {
                $set: { 'categories.$.serial': categoryUpdate.serial }
            }, { session });
        }
        // Second pass: Update each category with its specific subcategories
        const updatePromises = Array.from(categorySubcategoriesMap.entries()).map(([categoryId, subcategories]) => category_model_1.Category.findByIdAndUpdate(categoryId, { $set: { subCategories: subcategories } }, { session, new: true }));
        yield Promise.all(updatePromises);
        yield session.commitTransaction();
        return { success: true, message: 'Category tree updated successfully' };
    }
    catch (error) {
        yield session.abortTransaction();
        throw error;
    }
    finally {
        session.endSession();
    }
});
const getProductsByCategory = (query) => __awaiter(void 0, void 0, void 0, function* () {
    const { main: mainCategorySlug, cat: categorySlug, sub: subcategorySlug } = query, restQuery = __rest(query, ["main", "cat", "sub"]);
    // Build base query conditions
    const queryConditions = {
        is_active: true,
        isDeleted: false
    };
    // Check if any category slugs are provided
    if (mainCategorySlug || categorySlug || subcategorySlug) {
        const mainCategory = mainCategorySlug
            ? yield category_model_1.MainCategory.findOne({ slug: mainCategorySlug }).select('_id')
            : null;
        const category = categorySlug && mainCategory
            ? yield category_model_1.Category.findOne({
                slug: categorySlug,
                mainCategory: mainCategory._id
            }).select('_id')
            : null;
        const subCategory = subcategorySlug && category
            ? yield category_model_1.SubCategory.findOne({
                slug: subcategorySlug,
                category: category._id
            }).select('_id')
            : null;
        // Update the query conditions based on the found categories
        if (mainCategory) {
            queryConditions.mainCategory = mainCategory._id;
        }
        if (category) {
            queryConditions.category = category._id;
        }
        if (subCategory) {
            queryConditions.subCategory = subCategory._id;
        }
        // If no valid category was found, throw an error
        if (!mainCategory && !category && !subCategory) {
            throw new AppError_1.default(http_status_1.default.NOT_FOUND, 'No category found with the provided slugs');
        }
    }
    // Merge with any additional query conditions
    const finalQuery = Object.assign(Object.assign({}, queryConditions), restQuery);
    // Set up the population options for related data
    const productPopulateOptions = [
        { path: 'brand' },
        { path: 'productUnit' },
        { path: 'reviews' },
        { path: 'mainCategory', select: 'name slug' },
        { path: 'category', select: 'name slug' },
        { path: 'subCategory', select: 'name slug' }
    ];
    // Define searchable fields for the products
    const productSearchableFields = ['name', 'description', 'tags'];
    // Build the query using QueryBuilder
    const productsQuery = new QueryBuilder_1.default(product_model_1.default.find(queryConditions).populate(productPopulateOptions), finalQuery)
        .search(productSearchableFields)
        .filter()
        .sort()
        .paginate()
        .fields();
    // Execute the query to get products and count metadata
    const meta = yield productsQuery.countTotal();
    const result = yield productsQuery.queryModel;
    // Return both the meta (pagination info) and the result (product data)
    return {
        meta,
        result
    };
});
var ModelType;
(function (ModelType) {
    ModelType["Category"] = "Category";
    ModelType["SubCategory"] = "SubCategory";
    ModelType["MainCategory"] = "MainCategory";
})(ModelType || (ModelType = {}));
// Define a mapping of model types
const modelMap = {
    [ModelType.Category]: category_model_1.Category,
    [ModelType.SubCategory]: category_model_1.SubCategory,
    [ModelType.MainCategory]: category_model_1.MainCategory
};
const updateCategoryOrder = (req) => __awaiter(void 0, void 0, void 0, function* () {
    const session = yield mongoose_1.default.startSession();
    try {
        yield session.withTransaction(() => __awaiter(void 0, void 0, void 0, function* () {
            const { modelType, data } = req.body;
            const Model = modelMap[modelType];
            if (!Model) {
                throw new AppError_1.default(http_status_1.default.BAD_REQUEST, 'Invalid model type');
            }
            // Loop through data and assign sequential serial numbers (starting from 1)
            for (let index = 0; index < data.length; index++) {
                const { _id } = data[index];
                yield Model.findByIdAndUpdate(_id, { serial: index + 1 }, { new: true, session });
            }
        }));
        return null;
    }
    catch (error) {
        console.error(error);
        throw new AppError_1.default(http_status_1.default.BAD_REQUEST, 'Error updating category order');
    }
    finally {
        session.endSession();
    }
});
exports.updateCategoryOrder = updateCategoryOrder;
const getMainCategories = () => __awaiter(void 0, void 0, void 0, function* () {
    const mainCategories = yield category_model_1.MainCategory.find()
        .select('name slug image serial')
        .sort({ serial: 1 });
    return mainCategories;
});
const getCategoriesByMainCategory = (mainCategoryId) => __awaiter(void 0, void 0, void 0, function* () {
    const mainCategory = yield category_model_1.MainCategory.findById(mainCategoryId);
    if (!mainCategory) {
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, 'Main Category not found');
    }
    const categories = yield category_model_1.Category.find({ mainCategory: mainCategoryId })
        .select('name slug image serial')
        .sort({ serial: 1 });
    return categories;
});
const getSubCategoriesByCategory = (categoryId) => __awaiter(void 0, void 0, void 0, function* () {
    const category = yield category_model_1.Category.findById(categoryId);
    if (!category) {
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, 'Category not found');
    }
    const subCategories = yield category_model_1.SubCategory.find({ category: categoryId })
        .select('name slug serial')
        .sort({ serial: 1 });
    return subCategories;
});
exports.categoryService = {
    getAllCategory: exports.getAllCategory,
    getAllMainCategory: exports.getAllMainCategory,
    getAllSubCategory: exports.getAllSubCategory,
    createMainCategory: exports.createMainCategory,
    createCategory: exports.createCategory,
    createSubCategory: exports.createSubCategory,
    updateMainCategory: exports.updateMainCategory,
    updateCategory: exports.updateCategory,
    updateSubCategory: exports.updateSubCategory,
    deleteMainCategory: exports.deleteMainCategory,
    deleteCategory: exports.deleteCategory,
    deleteSubCategory: exports.deleteSubCategory,
    getFullCategoryTree: exports.getFullCategoryTree,
    getProductsByCategory,
    updateCategoryOrder: exports.updateCategoryOrder,
    updateCategoryTree,
    getCategoriesByMainCategory,
    getSubCategoriesByCategory,
    getMainCategories
};
