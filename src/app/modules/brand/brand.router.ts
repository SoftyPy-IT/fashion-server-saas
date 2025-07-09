import { Router } from 'express';
import { brandController } from './brand.controller';
import auth from '../../middlewares/auth';
import validateRequest from '../../middlewares/validateRequest';
import { createBrandSchema, updateBrandSchema } from './brand.validation';

const router = Router();

router.get('/all', brandController.getAllBrand);
router.get('/:id', brandController.getBrandById);
router.post(
  '/create',
  auth('admin'),
  validateRequest(createBrandSchema),
  brandController.createBrand
);
router.put(
  '/update/:id',
  auth('admin'),
  validateRequest(updateBrandSchema),
  brandController.updateBrand
);
router.delete('/:id', auth('admin'), brandController.deleteBrand);

export const brandRoutes = router;
