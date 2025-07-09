import { Router } from 'express';
import { orderController } from './order.controller';
import auth from '../../middlewares/auth';
import validateRequest from '../../middlewares/validateRequest';
import { createOrderSchema } from './order.validation';
import optionalAuth from '../../middlewares/optionalAuth';

const router = Router();

router.get('/all', auth('admin'), orderController.getAllOrder);
router.get('/track/:identifier', orderController.trackOrder);
router.get('/:id', auth('user', 'admin'), orderController.getOrderById);
router.get('/invoice/:orderId', orderController.getInvoice);

router.post(
  '/create',
  optionalAuth('user', 'admin'),
  validateRequest(createOrderSchema),
  orderController.createOrder
);
router.put('/update/:id', auth('admin'), orderController.updateOrder);
router.put('/status/:id', auth('admin'), orderController.updateOrderStatus);

router.delete('/:id', auth('admin'), orderController.deleteOrder);

export const orderRoutes = router;
