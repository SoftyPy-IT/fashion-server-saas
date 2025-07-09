import { Router } from 'express';
import { productController } from './product.controller';
import auth from '../../middlewares/auth';
import { createProductSchema, updateProductSchema } from './product.validation';
import validateRequest from '../../middlewares/validateRequest';

const router = Router();

router.get('/all', productController.getAllProduct);
router.get('/shop', productController.getShopProducts);
router.put('/featured', auth('admin'), productController.addFeaturedProducts);
router.get('/:id', productController.getProductById);
router.get('/details/:id', productController.productDetails);

router.post(
  '/create',
  auth('admin'),
  validateRequest(createProductSchema),
  productController.createProduct
);
router.put(
  '/update/:id',
  auth('admin'),
  validateRequest(updateProductSchema),
  productController.updateProduct
);
router.delete('/:id', productController.deleteProduct);

export const productRoutes = router;
