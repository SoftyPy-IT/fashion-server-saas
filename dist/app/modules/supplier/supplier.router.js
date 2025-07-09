"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.supplierRoutes = void 0;
const express_1 = require("express");
const supplier_controller_1 = require("./supplier.controller");
const auth_1 = __importDefault(require("../../middlewares/auth"));
const validateRequest_1 = __importDefault(require("../../middlewares/validateRequest"));
const supplier_validation_1 = require("./supplier.validation");
const router = (0, express_1.Router)();
router.get('/all', (0, auth_1.default)('admin'), supplier_controller_1.supplierController.getAllSupplier);
router.get('/:id', (0, auth_1.default)('admin'), supplier_controller_1.supplierController.getSupplierById);
router.post('/create', (0, auth_1.default)('admin'), (0, validateRequest_1.default)(supplier_validation_1.createSupplierSchema), supplier_controller_1.supplierController.createSupplier);
router.put('/update/:id', (0, auth_1.default)('admin'), (0, validateRequest_1.default)(supplier_validation_1.updateSupplierSchema), supplier_controller_1.supplierController.updateSupplier);
router.delete('/:id', (0, auth_1.default)('admin'), supplier_controller_1.supplierController.deleteSupplier);
exports.supplierRoutes = router;
