import { Router } from 'express';
import { quotationsController } from './quotations.controller';
import auth from '../../middlewares/auth';
import { upload } from '../../utils/cloudinary';
import validateRequest from '../../middlewares/validateRequest';
import { createQuotationsSchema, updateQuotationsSchema } from './quotations.validation';

const router = Router();

router.get('/all', auth('admin'), quotationsController.getAllQuotations);
router.get('/:id', auth('admin'), quotationsController.getQuotationsById);
router.get('/pdf/:id', quotationsController.generateQuotationPdf);
router.post(
  '/create',
  auth('admin'),
  upload.single('attachDocument'),
  validateRequest(createQuotationsSchema),
  quotationsController.createQuotations
);
router.put(
  '/update/:id',
  auth('admin'),
  upload.single('attachDocument'),
  validateRequest(updateQuotationsSchema),
  quotationsController.updateQuotations
);
router.delete('/:id', auth('admin'), quotationsController.deleteQuotations);

export const quotationsRoutes = router;
