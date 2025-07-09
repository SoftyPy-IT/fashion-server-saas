"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.unitRoutes = void 0;
const express_1 = require("express");
const unit_controller_1 = require("./unit.controller");
const validateRequest_1 = __importDefault(require("../../middlewares/validateRequest"));
const unit_validation_1 = require("./unit.validation");
const auth_1 = __importDefault(require("../../middlewares/auth"));
const router = (0, express_1.Router)();
router.get('/all', unit_controller_1.unitController.getAllUnit);
router.get('/:id', unit_controller_1.unitController.getUnitById);
router.post('/create', (0, auth_1.default)('admin'), (0, validateRequest_1.default)(unit_validation_1.createUnitSchema), unit_controller_1.unitController.createUnit);
router.put('/update/:id', (0, auth_1.default)('admin'), (0, validateRequest_1.default)(unit_validation_1.updateUnitSchema), unit_controller_1.unitController.updateUnit);
router.delete('/:id', (0, auth_1.default)('admin'), unit_controller_1.unitController.deleteUnit);
exports.unitRoutes = router;
