"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.storefrontRoutes = void 0;
const express_1 = require("express");
const storefront_controller_1 = require("./storefront.controller");
const auth_1 = __importDefault(require("../../middlewares/auth"));
const router = (0, express_1.Router)();
router.get('/all', storefront_controller_1.storefrontController.getAllStorefront);
router.put('/update/:id', (0, auth_1.default)('admin'), storefront_controller_1.storefrontController.updateStorefront);
router.put('/manage-banners/:id', (0, auth_1.default)('admin'), storefront_controller_1.storefrontController.manageBanners);
exports.storefrontRoutes = router;
