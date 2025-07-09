"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authRoutes = void 0;
const express_1 = require("express");
const validateRequest_1 = __importDefault(require("../../middlewares/validateRequest"));
const auth_validation_1 = require("./auth.validation");
const auth_controller_1 = require("./auth.controller");
const router = (0, express_1.Router)();
router.post('/register', (0, validateRequest_1.default)(auth_validation_1.userRegistrationSchema), auth_controller_1.authController.userRegistration);
router.post('/verify-email', (0, validateRequest_1.default)(auth_validation_1.emailVerifySchema), auth_controller_1.authController.verifyUser);
router.post('/login', (0, validateRequest_1.default)(auth_validation_1.loginUserSchema), auth_controller_1.authController.userLogin);
router.post('/refresh-token', auth_controller_1.authController.refreshToken);
router.post('/forget-password', (0, validateRequest_1.default)(auth_validation_1.forgotPasswordSchema), auth_controller_1.authController.forgetPassword);
router.post('/reset-password', (0, validateRequest_1.default)(auth_validation_1.resetPasswordSchema), auth_controller_1.authController.resetPassword);
router.post('/logout', auth_controller_1.authController.logout);
exports.authRoutes = router;
