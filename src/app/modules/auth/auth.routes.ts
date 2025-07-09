import { Router } from 'express';
import validateRequest from '../../middlewares/validateRequest';
import {
  emailVerifySchema,
  forgotPasswordSchema,
  loginUserSchema,
  resetPasswordSchema,
  userRegistrationSchema
} from './auth.validation';
import { authController } from './auth.controller';

const router = Router();

router.post(
  '/register',
  validateRequest(userRegistrationSchema),
  authController.userRegistration
);

router.post(
  '/verify-email',
  validateRequest(emailVerifySchema),
  authController.verifyUser
);

router.post(
  '/login',
  validateRequest(loginUserSchema),
  authController.userLogin
);

router.post('/refresh-token', authController.refreshToken);

router.post(
  '/forget-password',
  validateRequest(forgotPasswordSchema),
  authController.forgetPassword
);

router.post(
  '/reset-password',
  validateRequest(resetPasswordSchema),
  authController.resetPassword
);

router.post('/logout', authController.logout);

export const authRoutes = router;
