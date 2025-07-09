import { Router } from 'express';
import { categoryController } from './category.controller';
import validateRequest from '../../middlewares/validateRequest';
import {
  SubCategoryValidation,
  MainCategoryValidation,
  CategoryValidation,
  updateCategoryZodSchema,
  updateSubCategoryZodSchema,
  updateMainCategoryZodSchema
} from './category.validation';
import auth from '../../middlewares/auth';

const router = Router();

router.get('/products', categoryController.getProductsByCategory);
router.put('/update-order', auth('admin'), categoryController.updateCategoryOrder);
router.put('/update-tree', auth('admin'), categoryController.updateCategoryTree);

// Main Category routes
router.get('/main/all', categoryController.getAllMainCategory);
router.post(
  '/main/create',
  auth('admin'),
  validateRequest(MainCategoryValidation),
  categoryController.createMainCategory
);
router.put(
  '/main/:id',
  auth('admin'),
  validateRequest(updateMainCategoryZodSchema),
  categoryController.updateMainCategory
);
router.delete('/main/:id', auth('admin'), categoryController.deleteMainCategory);

// Category routes
router.get('/all', categoryController.getAllCategory);
router.post(
  '/create',
  auth('admin'),
  validateRequest(CategoryValidation),
  categoryController.createCategory
);
router.put(
  '/:id',
  auth('admin'),
  validateRequest(updateCategoryZodSchema),
  categoryController.updateCategory
);
router.delete('/:id', auth('admin'), categoryController.deleteCategory);

// Subcategory routes
router.get('/sub/all', categoryController.getAllSubCategory);
router.post(
  '/sub/create',
  auth('admin'),
  validateRequest(SubCategoryValidation),
  categoryController.createSubCategory
);

router.put(
  '/sub/:id',
  auth('admin'),
  validateRequest(updateSubCategoryZodSchema),
  categoryController.updateSubCategory
);

// Get main categories
router.get('/main', categoryController.getMainCategories);
// Get categories by main category
router.get('/main/:id', categoryController.getCategoriesByMainCategory);
// Get subcategories by category
router.get('/:id/sub-categories', categoryController.getSubCategoriesByCategory);

router.delete('/sub/:id', auth('admin'), categoryController.deleteSubCategory);
// Full category tree route
router.get('/tree', categoryController.getFullCategoryTree);

export const categoryRoutes = router;
