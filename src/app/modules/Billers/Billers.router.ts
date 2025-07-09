import { Router } from 'express';
import { BillersController } from './Billers.controller';
import auth from '../../middlewares/auth';
import validateRequest from '../../middlewares/validateRequest';
import { createBillersSchema, updateBillersSchema } from './Billers.validation';

const router = Router();

router.get('/all', auth('admin'), BillersController.getAllBillers);
router.get('/:id', auth('admin'), BillersController.getBillersById);
router.post(
  '/create',
  auth('admin'),
  validateRequest(createBillersSchema),
  BillersController.createBillers
);
router.put(
  '/update/:id',
  auth('admin'),
  validateRequest(updateBillersSchema),
  BillersController.updateBillers
);
router.delete('/:id', auth('admin'), BillersController.deleteBillers);

export const BillersRoutes = router;
