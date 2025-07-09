import { Router } from 'express';
import { QuantityController } from './Quantity.controller';
import auth from '../../middlewares/auth';
import { upload } from '../../utils/cloudinary';
import validateRequest from '../../middlewares/validateRequest';
import { createQuantitySchema, updateQuantitySchema } from './Quantity.validation';

const router = Router();

router.get('/all', auth('admin'), QuantityController.getAllQuantity);
router.get('/:id', auth('admin'), QuantityController.getQuantityById);
router.post(
  '/create',
  auth('admin'),
  upload.single('attachDocument'),
  validateRequest(createQuantitySchema),
  QuantityController.createQuantity
);
router.put(
  '/update/:id',
  auth('admin'),
  upload.single('attachDocument'),
  validateRequest(updateQuantitySchema),
  QuantityController.updateQuantity
);
router.delete('/:id', auth('admin'), QuantityController.deleteQuantity);

export const QuantityRoutes = router;
