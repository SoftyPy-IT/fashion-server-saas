import { Router } from 'express';
import { CustomersController } from './Customers.controller';
import auth from '../../middlewares/auth';
import validateRequest from '../../middlewares/validateRequest';
import { createCustomersSchema, updateCustomersSchema } from './Customers.validation';

const router = Router();

router.get('/all', auth('admin'), CustomersController.getAllCustomers);
router.get('/:id', auth('admin'), CustomersController.getCustomersById);
router.post(
  '/create',
  auth('admin'),
  validateRequest(createCustomersSchema),
  CustomersController.createCustomers
);
router.put(
  '/update/:id',
  auth('admin'),
  validateRequest(updateCustomersSchema),
  CustomersController.updateCustomers
);
router.delete('/:id', auth('admin'), CustomersController.deleteCustomers);

export const CustomersRoutes = router;
