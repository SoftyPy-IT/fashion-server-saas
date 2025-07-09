"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.brandRoutes = void 0;
const express_1 = require("express");
const brand_controller_1 = require("./brand.controller");
const auth_1 = __importDefault(require("../../middlewares/auth"));
const validateRequest_1 = __importDefault(require("../../middlewares/validateRequest"));
const brand_validation_1 = require("./brand.validation");
const router = (0, express_1.Router)();
router.get('/all', brand_controller_1.brandController.getAllBrand);
router.get('/:id', brand_controller_1.brandController.getBrandById);
router.post('/create', (0, auth_1.default)('admin'), (0, validateRequest_1.default)(brand_validation_1.createBrandSchema), brand_controller_1.brandController.createBrand);
router.put('/update/:id', (0, auth_1.default)('admin'), (0, validateRequest_1.default)(brand_validation_1.updateBrandSchema), brand_controller_1.brandController.updateBrand);
router.delete('/:id', (0, auth_1.default)('admin'), brand_controller_1.brandController.deleteBrand);
exports.brandRoutes = router;
