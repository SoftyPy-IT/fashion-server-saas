import { Router } from 'express';
import { taxController } from './tax.controller';
import auth from '../../middlewares/auth';
import validateRequest from '../../middlewares/validateRequest';
import { createTaxSchema, updateTaxSchema } from './tax.validation';

const router = Router();

router.get('/all', taxController.getAllTax);
router.get('/:id', taxController.getTaxById);
router.post('/create', auth('admin'), validateRequest(createTaxSchema), taxController.createTax);
router.put('/update/:id', auth('admin'), validateRequest(updateTaxSchema), taxController.updateTax);
router.delete('/:id', auth('admin'), taxController.deleteTax);

export const taxRoutes = router;
