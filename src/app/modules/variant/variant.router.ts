import { Router } from 'express';
import { variantController } from './variant.controller';
import auth from '../../middlewares/auth';
import validateRequest from '../../middlewares/validateRequest';
import { createVariantSchema, updateVariantSchema } from './variant.validation';

const router = Router();

router.get('/all', auth('admin'), variantController.getAllVariant);
router.get('/:id', auth('admin'), variantController.getVariantById);
router.post(
  '/create',
  auth('admin'),
  validateRequest(createVariantSchema),
  variantController.createVariant
);
router.put(
  '/update/:id',
  auth('admin'),
  validateRequest(updateVariantSchema),
  variantController.updateVariant
);
router.delete('/:id', auth('admin'), variantController.deleteVariant);

export const variantRoutes = router;
