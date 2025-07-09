"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.QuantityRoutes = void 0;
const express_1 = require("express");
const Quantity_controller_1 = require("./Quantity.controller");
const auth_1 = __importDefault(require("../../middlewares/auth"));
const cloudinary_1 = require("../../utils/cloudinary");
const validateRequest_1 = __importDefault(require("../../middlewares/validateRequest"));
const Quantity_validation_1 = require("./Quantity.validation");
const router = (0, express_1.Router)();
router.get('/all', (0, auth_1.default)('admin'), Quantity_controller_1.QuantityController.getAllQuantity);
router.get('/:id', (0, auth_1.default)('admin'), Quantity_controller_1.QuantityController.getQuantityById);
router.post('/create', (0, auth_1.default)('admin'), cloudinary_1.upload.single('attachDocument'), (0, validateRequest_1.default)(Quantity_validation_1.createQuantitySchema), Quantity_controller_1.QuantityController.createQuantity);
router.put('/update/:id', (0, auth_1.default)('admin'), cloudinary_1.upload.single('attachDocument'), (0, validateRequest_1.default)(Quantity_validation_1.updateQuantitySchema), Quantity_controller_1.QuantityController.updateQuantity);
router.delete('/:id', (0, auth_1.default)('admin'), Quantity_controller_1.QuantityController.deleteQuantity);
exports.QuantityRoutes = router;
