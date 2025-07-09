"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.StockRoutes = void 0;
const express_1 = require("express");
const Stock_controller_1 = require("./Stock.controller");
const auth_1 = __importDefault(require("../../middlewares/auth"));
const validateRequest_1 = __importDefault(require("../../middlewares/validateRequest"));
const Stock_validation_1 = require("./Stock.validation");
const cloudinary_1 = require("../../utils/cloudinary");
const router = (0, express_1.Router)();
router.get('/all', (0, auth_1.default)('admin'), Stock_controller_1.StockController.getAllStock);
router.get('/:id', (0, auth_1.default)('admin'), Stock_controller_1.StockController.getStockById);
router.post('/create', (0, auth_1.default)('admin'), (0, validateRequest_1.default)(Stock_validation_1.createStockSchema), Stock_controller_1.StockController.createStock);
router.put('/update/:id', (0, auth_1.default)('admin'), cloudinary_1.upload.single('file'), Stock_controller_1.StockController.updateStock);
router.delete('/:id', Stock_controller_1.StockController.deleteStock);
exports.StockRoutes = router;
