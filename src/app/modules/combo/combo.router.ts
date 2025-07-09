import { Router } from 'express';
import { comboController } from './combo.controller';
import auth from '../../middlewares/auth';

const router = Router();

router.get('/all', comboController.getAllCombo);
router.get('/:id', comboController.getComboById);
router.post('/create', auth('admin'), comboController.createCombo);
router.put('/update/:id', auth('admin'), comboController.updateCombo);
router.delete('/:id', auth('admin'), comboController.deleteCombo);

export const comboRoutes = router;
