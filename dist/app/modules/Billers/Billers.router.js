"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BillersRoutes = void 0;
const express_1 = require("express");
const Billers_controller_1 = require("./Billers.controller");
const auth_1 = __importDefault(require("../../middlewares/auth"));
const validateRequest_1 = __importDefault(require("../../middlewares/validateRequest"));
const Billers_validation_1 = require("./Billers.validation");
const router = (0, express_1.Router)();
router.get('/all', (0, auth_1.default)('admin'), Billers_controller_1.BillersController.getAllBillers);
router.get('/:id', (0, auth_1.default)('admin'), Billers_controller_1.BillersController.getBillersById);
router.post('/create', (0, auth_1.default)('admin'), (0, validateRequest_1.default)(Billers_validation_1.createBillersSchema), Billers_controller_1.BillersController.createBillers);
router.put('/update/:id', (0, auth_1.default)('admin'), (0, validateRequest_1.default)(Billers_validation_1.updateBillersSchema), Billers_controller_1.BillersController.updateBillers);
router.delete('/:id', (0, auth_1.default)('admin'), Billers_controller_1.BillersController.deleteBillers);
exports.BillersRoutes = router;
