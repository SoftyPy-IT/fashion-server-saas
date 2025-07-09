import { Router } from 'express';
import { unitController } from './unit.controller';
import validateRequest from '../../middlewares/validateRequest';
import { createUnitSchema, updateUnitSchema } from './unit.validation';
import auth from '../../middlewares/auth';

const router = Router();

router.get('/all', unitController.getAllUnit);
router.get('/:id', unitController.getUnitById);
router.post('/create', auth('admin'), validateRequest(createUnitSchema), unitController.createUnit);
router.put(
  '/update/:id',
  auth('admin'),
  validateRequest(updateUnitSchema),
  unitController.updateUnit
);
router.delete('/:id', auth('admin'), unitController.deleteUnit);

export const unitRoutes = router;
