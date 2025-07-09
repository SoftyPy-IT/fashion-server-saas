import { Router } from 'express';
import { StockController } from './Stock.controller';
import auth from '../../middlewares/auth';
import validateRequest from '../../middlewares/validateRequest';
import { createStockSchema } from './Stock.validation';
import { upload } from '../../utils/cloudinary';

const router = Router();

router.get('/all', auth('admin'), StockController.getAllStock);
router.get('/:id', auth('admin'), StockController.getStockById);
router.post(
  '/create',
  auth('admin'),
  validateRequest(createStockSchema),
  StockController.createStock
);
router.put('/update/:id', auth('admin'), upload.single('file'), StockController.updateStock);
router.delete('/:id', StockController.deleteStock);

export const StockRoutes = router;
