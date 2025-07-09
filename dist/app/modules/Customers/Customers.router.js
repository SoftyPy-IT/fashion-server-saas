"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CustomersRoutes = void 0;
const express_1 = require("express");
const Customers_controller_1 = require("./Customers.controller");
const auth_1 = __importDefault(require("../../middlewares/auth"));
const validateRequest_1 = __importDefault(require("../../middlewares/validateRequest"));
const Customers_validation_1 = require("./Customers.validation");
const router = (0, express_1.Router)();
router.get('/all', (0, auth_1.default)('admin'), Customers_controller_1.CustomersController.getAllCustomers);
router.get('/:id', (0, auth_1.default)('admin'), Customers_controller_1.CustomersController.getCustomersById);
router.post('/create', (0, auth_1.default)('admin'), (0, validateRequest_1.default)(Customers_validation_1.createCustomersSchema), Customers_controller_1.CustomersController.createCustomers);
router.put('/update/:id', (0, auth_1.default)('admin'), (0, validateRequest_1.default)(Customers_validation_1.updateCustomersSchema), Customers_controller_1.CustomersController.updateCustomers);
router.delete('/:id', (0, auth_1.default)('admin'), Customers_controller_1.CustomersController.deleteCustomers);
exports.CustomersRoutes = router;
