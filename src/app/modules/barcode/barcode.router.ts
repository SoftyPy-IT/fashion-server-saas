import { Router } from 'express';
import { barcodeController } from './barcode.controller';
import auth from '../../middlewares/auth';
import validateRequest from '../../middlewares/validateRequest';
import { createBarcodeSchema } from './barcode.validation';

const router = Router();

router.get('/all', barcodeController.getAllBarcode);
router.post(
  '/create',
  auth('admin'),
  validateRequest(createBarcodeSchema),
  barcodeController.createBarcode
);
router.delete('/:id', barcodeController.deleteBarcode);

export const barcodeRoutes = router;
