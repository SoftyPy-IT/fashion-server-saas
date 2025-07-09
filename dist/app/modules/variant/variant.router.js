"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.variantRoutes = void 0;
const express_1 = require("express");
const variant_controller_1 = require("./variant.controller");
const auth_1 = __importDefault(require("../../middlewares/auth"));
const validateRequest_1 = __importDefault(require("../../middlewares/validateRequest"));
const variant_validation_1 = require("./variant.validation");
const router = (0, express_1.Router)();
router.get('/all', (0, auth_1.default)('admin'), variant_controller_1.variantController.getAllVariant);
router.get('/:id', (0, auth_1.default)('admin'), variant_controller_1.variantController.getVariantById);
router.post('/create', (0, auth_1.default)('admin'), (0, validateRequest_1.default)(variant_validation_1.createVariantSchema), variant_controller_1.variantController.createVariant);
router.put('/update/:id', (0, auth_1.default)('admin'), (0, validateRequest_1.default)(variant_validation_1.updateVariantSchema), variant_controller_1.variantController.updateVariant);
router.delete('/:id', (0, auth_1.default)('admin'), variant_controller_1.variantController.deleteVariant);
exports.variantRoutes = router;
