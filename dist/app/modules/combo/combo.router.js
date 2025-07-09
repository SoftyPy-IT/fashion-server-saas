"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.comboRoutes = void 0;
const express_1 = require("express");
const combo_controller_1 = require("./combo.controller");
const auth_1 = __importDefault(require("../../middlewares/auth"));
const router = (0, express_1.Router)();
router.get('/all', combo_controller_1.comboController.getAllCombo);
router.get('/:id', combo_controller_1.comboController.getComboById);
router.post('/create', (0, auth_1.default)('admin'), combo_controller_1.comboController.createCombo);
router.put('/update/:id', (0, auth_1.default)('admin'), combo_controller_1.comboController.updateCombo);
router.delete('/:id', (0, auth_1.default)('admin'), combo_controller_1.comboController.deleteCombo);
exports.comboRoutes = router;
