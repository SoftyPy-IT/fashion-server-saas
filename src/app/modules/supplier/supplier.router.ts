import { Router } from 'express';
import { supplierController } from './supplier.controller';
import auth from '../../middlewares/auth';
import validateRequest from '../../middlewares/validateRequest';
import { createSupplierSchema, updateSupplierSchema } from './supplier.validation';

const router = Router();

router.get('/all', auth('admin'), supplierController.getAllSupplier);
router.get('/:id', auth('admin'), supplierController.getSupplierById);
router.post(
  '/create',
  auth('admin'),
  validateRequest(createSupplierSchema),
  supplierController.createSupplier
);
router.put(
  '/update/:id',
  auth('admin'),
  validateRequest(updateSupplierSchema),
  supplierController.updateSupplier
);
router.delete('/:id', auth('admin'), supplierController.deleteSupplier);

export const supplierRoutes = router;
