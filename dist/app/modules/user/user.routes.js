"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.userRoutes = void 0;
const express_1 = require("express");
const auth_1 = __importDefault(require("../../middlewares/auth"));
const uploadFileWithData_1 = require("../../middlewares/uploadFileWithData");
const validateRequest_1 = __importDefault(require("../../middlewares/validateRequest"));
const user_controller_1 = require("./user.controller");
const user_validation_1 = require("./user.validation");
const router = (0, express_1.Router)();
router.post('/create', (0, auth_1.default)('admin'), (0, validateRequest_1.default)(user_validation_1.createUserByAdminSchema), user_controller_1.userController.createUserByAdmin);
router.put('/update/:id', (0, auth_1.default)('admin'), (0, validateRequest_1.default)(user_validation_1.updateUserByAdminSchema), user_controller_1.userController.updateUserByAdmin);
router.post('/change-password', (0, auth_1.default)('user', 'admin'), (0, validateRequest_1.default)(user_validation_1.changePasswordSchema), user_controller_1.userController.changePassword);
router.put('/update-profile', (0, auth_1.default)('user', 'admin'), 
// upload.single('file'),
(0, uploadFileWithData_1.uploadFileWithData)(user_validation_1.updateProfileSchema), user_controller_1.userController.updateProfile);
router.patch('/change-status/:id', (0, auth_1.default)('admin'), (0, validateRequest_1.default)(user_validation_1.userChangeStatusValidationSchema), user_controller_1.userController.changeStatus);
router.patch('/change-role/:id', (0, auth_1.default)('admin'), (0, validateRequest_1.default)(user_validation_1.userRoleChangeValidationSchema), user_controller_1.userController.chnageUserRole);
router.get('/profile', (0, auth_1.default)('user', 'admin'), user_controller_1.userController.getProlfile);
router.post('/wishlist', (0, auth_1.default)('user', 'admin'), user_controller_1.userController.addProductToWishlist);
router.get('/all', (0, auth_1.default)('admin'), user_controller_1.userController.getAllUsers);
router.get('/:id', (0, auth_1.default)('admin'), user_controller_1.userController.getUserById);
router.delete('/:id', (0, auth_1.default)('admin'), user_controller_1.userController.deleteUser);
exports.userRoutes = router;
