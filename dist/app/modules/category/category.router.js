"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.categoryRoutes = void 0;
const express_1 = require("express");
const category_controller_1 = require("./category.controller");
const validateRequest_1 = __importDefault(require("../../middlewares/validateRequest"));
const category_validation_1 = require("./category.validation");
const auth_1 = __importDefault(require("../../middlewares/auth"));
const router = (0, express_1.Router)();
router.get('/products', category_controller_1.categoryController.getProductsByCategory);
router.put('/update-order', (0, auth_1.default)('admin'), category_controller_1.categoryController.updateCategoryOrder);
router.put('/update-tree', (0, auth_1.default)('admin'), category_controller_1.categoryController.updateCategoryTree);
// Main Category routes
router.get('/main/all', category_controller_1.categoryController.getAllMainCategory);
router.post('/main/create', (0, auth_1.default)('admin'), (0, validateRequest_1.default)(category_validation_1.MainCategoryValidation), category_controller_1.categoryController.createMainCategory);
router.put('/main/:id', (0, auth_1.default)('admin'), (0, validateRequest_1.default)(category_validation_1.updateMainCategoryZodSchema), category_controller_1.categoryController.updateMainCategory);
router.delete('/main/:id', (0, auth_1.default)('admin'), category_controller_1.categoryController.deleteMainCategory);
// Category routes
router.get('/all', category_controller_1.categoryController.getAllCategory);
router.post('/create', (0, auth_1.default)('admin'), (0, validateRequest_1.default)(category_validation_1.CategoryValidation), category_controller_1.categoryController.createCategory);
router.put('/:id', (0, auth_1.default)('admin'), (0, validateRequest_1.default)(category_validation_1.updateCategoryZodSchema), category_controller_1.categoryController.updateCategory);
router.delete('/:id', (0, auth_1.default)('admin'), category_controller_1.categoryController.deleteCategory);
// Subcategory routes
router.get('/sub/all', category_controller_1.categoryController.getAllSubCategory);
router.post('/sub/create', (0, auth_1.default)('admin'), (0, validateRequest_1.default)(category_validation_1.SubCategoryValidation), category_controller_1.categoryController.createSubCategory);
router.put('/sub/:id', (0, auth_1.default)('admin'), (0, validateRequest_1.default)(category_validation_1.updateSubCategoryZodSchema), category_controller_1.categoryController.updateSubCategory);
// Get main categories
router.get('/main', category_controller_1.categoryController.getMainCategories);
// Get categories by main category
router.get('/main/:id', category_controller_1.categoryController.getCategoriesByMainCategory);
// Get subcategories by category
router.get('/:id/sub-categories', category_controller_1.categoryController.getSubCategoriesByCategory);
router.delete('/sub/:id', (0, auth_1.default)('admin'), category_controller_1.categoryController.deleteSubCategory);
// Full category tree route
router.get('/tree', category_controller_1.categoryController.getFullCategoryTree);
exports.categoryRoutes = router;
