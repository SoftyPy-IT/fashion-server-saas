import { Router } from 'express';
import { offersController } from './offers.controller';
import auth from '../../middlewares/auth';
import validateRequest from '../../middlewares/validateRequest';
import { createOffersSchema, updateOffersSchema } from './offers.validation';

const router = Router();

router.get('/all', offersController.getAllOffers);
router.get(
  '/all/products',
  auth('admin'),
  offersController.getAllOffersProducts
);
router.get('/:id', offersController.getOffersById);
router.post(
  '/create',
  auth('admin'),
  validateRequest(createOffersSchema),
  offersController.createOffers
);
router.put(
  '/update/:id',
  auth('admin'),
  validateRequest(updateOffersSchema),
  offersController.updateOffers
);
router.delete('/:id', offersController.deleteOffers);

export const offersRoutes = router;
