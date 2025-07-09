"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sectionRoutes = void 0;
const express_1 = require("express");
const section_controller_1 = require("./section.controller");
const auth_1 = __importDefault(require("../../middlewares/auth"));
const validateRequest_1 = __importDefault(require("../../middlewares/validateRequest"));
const section_validation_1 = require("./section.validation");
const router = (0, express_1.Router)();
router.get('/all', section_controller_1.sectionController.getAllSection);
router.get('/:id', section_controller_1.sectionController.getSectionById);
router.post('/create', (0, auth_1.default)('admin'), (0, validateRequest_1.default)(section_validation_1.createSectionSchema), section_controller_1.sectionController.createSection);
router.put('/update/:id', (0, auth_1.default)('admin'), (0, validateRequest_1.default)(section_validation_1.updateSectionSchema), section_controller_1.sectionController.updateSection);
router.delete('/:id', (0, auth_1.default)('admin'), section_controller_1.sectionController.deleteSection);
exports.sectionRoutes = router;
