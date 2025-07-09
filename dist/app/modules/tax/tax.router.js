"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.taxRoutes = void 0;
const express_1 = require("express");
const tax_controller_1 = require("./tax.controller");
const auth_1 = __importDefault(require("../../middlewares/auth"));
const validateRequest_1 = __importDefault(require("../../middlewares/validateRequest"));
const tax_validation_1 = require("./tax.validation");
const router = (0, express_1.Router)();
router.get('/all', tax_controller_1.taxController.getAllTax);
router.get('/:id', tax_controller_1.taxController.getTaxById);
router.post('/create', (0, auth_1.default)('admin'), (0, validateRequest_1.default)(tax_validation_1.createTaxSchema), tax_controller_1.taxController.createTax);
router.put('/update/:id', (0, auth_1.default)('admin'), (0, validateRequest_1.default)(tax_validation_1.updateTaxSchema), tax_controller_1.taxController.updateTax);
router.delete('/:id', (0, auth_1.default)('admin'), tax_controller_1.taxController.deleteTax);
exports.taxRoutes = router;
