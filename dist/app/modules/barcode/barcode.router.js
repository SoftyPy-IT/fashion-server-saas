"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.barcodeRoutes = void 0;
const express_1 = require("express");
const barcode_controller_1 = require("./barcode.controller");
const auth_1 = __importDefault(require("../../middlewares/auth"));
const validateRequest_1 = __importDefault(require("../../middlewares/validateRequest"));
const barcode_validation_1 = require("./barcode.validation");
const router = (0, express_1.Router)();
router.get('/all', barcode_controller_1.barcodeController.getAllBarcode);
router.post('/create', (0, auth_1.default)('admin'), (0, validateRequest_1.default)(barcode_validation_1.createBarcodeSchema), barcode_controller_1.barcodeController.createBarcode);
router.delete('/:id', barcode_controller_1.barcodeController.deleteBarcode);
exports.barcodeRoutes = router;
