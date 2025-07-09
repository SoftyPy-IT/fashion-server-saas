"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.offersRoutes = void 0;
const express_1 = require("express");
const offers_controller_1 = require("./offers.controller");
const auth_1 = __importDefault(require("../../middlewares/auth"));
const validateRequest_1 = __importDefault(require("../../middlewares/validateRequest"));
const offers_validation_1 = require("./offers.validation");
const router = (0, express_1.Router)();
router.get('/all', offers_controller_1.offersController.getAllOffers);
router.get('/all/products', (0, auth_1.default)('admin'), offers_controller_1.offersController.getAllOffersProducts);
router.get('/:id', offers_controller_1.offersController.getOffersById);
router.post('/create', (0, auth_1.default)('admin'), (0, validateRequest_1.default)(offers_validation_1.createOffersSchema), offers_controller_1.offersController.createOffers);
router.put('/update/:id', (0, auth_1.default)('admin'), (0, validateRequest_1.default)(offers_validation_1.updateOffersSchema), offers_controller_1.offersController.updateOffers);
router.delete('/:id', offers_controller_1.offersController.deleteOffers);
exports.offersRoutes = router;
