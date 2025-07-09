import { Router } from 'express';
import { storefrontController } from './storefront.controller';
import auth from '../../middlewares/auth';

const router = Router();

router.get('/all', storefrontController.getAllStorefront);

router.put('/update/:id', auth('admin'), storefrontController.updateStorefront);

router.put('/manage-banners/:id', auth('admin'), storefrontController.manageBanners);

export const storefrontRoutes = router;
