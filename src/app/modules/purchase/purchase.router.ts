import { Router } from 'express';
import { purchaseController } from './purchase.controller';
import auth from '../../middlewares/auth';
import validateRequest from '../../middlewares/validateRequest';
import { createPurchaseSchema, updatePurchaseSchema } from './purchase.validation';
import { upload } from '../../utils/cloudinary';

const router = Router();

router.get('/all', auth('admin'), purchaseController.getAllPurchase);
router.get('/:id', auth('admin'), purchaseController.getPurchaseById);
router.get('/pdf/:id', purchaseController.generatePurchasePdf);
router.post(
  '/create',
  auth('admin'),
  upload.single('attachDocument'),
  validateRequest(createPurchaseSchema),
  purchaseController.createPurchase
);
router.put(
  '/update/:id',
  auth('admin'),
  upload.single('attachDocument'),
  validateRequest(updatePurchaseSchema),
  purchaseController.updatePurchase
);
router.delete('/:id', auth('admin'), purchaseController.deletePurchase);

export const purchaseRoutes = router;
