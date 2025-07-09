import { Router } from 'express';
import auth from '../../middlewares/auth';
import { uploadFileWithData } from '../../middlewares/uploadFileWithData';
import validateRequest from '../../middlewares/validateRequest';
import { userController } from './user.controller';
import {
  changePasswordSchema,
  createUserByAdminSchema,
  updateProfileSchema,
  updateUserByAdminSchema,
  userChangeStatusValidationSchema,
  userRoleChangeValidationSchema
} from './user.validation';

const router = Router();

router.post(
  '/create',
  auth('admin'),
  validateRequest(createUserByAdminSchema),
  userController.createUserByAdmin
);

router.put(
  '/update/:id',
  auth('admin'),
  validateRequest(updateUserByAdminSchema),
  userController.updateUserByAdmin
);

router.post(
  '/change-password',
  auth('user', 'admin'),
  validateRequest(changePasswordSchema),
  userController.changePassword
);

router.put(
  '/update-profile',
  auth('user', 'admin'),
  // upload.single('file'),
  uploadFileWithData(updateProfileSchema),
  userController.updateProfile
);

router.patch(
  '/change-status/:id',
  auth('admin'),
  validateRequest(userChangeStatusValidationSchema),
  userController.changeStatus
);

router.patch(
  '/change-role/:id',
  auth('admin'),
  validateRequest(userRoleChangeValidationSchema),
  userController.chnageUserRole
);

router.get('/profile', auth('user', 'admin'), userController.getProlfile);

router.post('/wishlist', auth('user', 'admin'), userController.addProductToWishlist);

router.get('/all', auth('admin'), userController.getAllUsers);
router.get('/:id', auth('admin'), userController.getUserById);
router.delete('/:id', auth('admin'), userController.deleteUser);

export const userRoutes = router;
