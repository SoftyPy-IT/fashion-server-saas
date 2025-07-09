"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.purchaseController = void 0;
const purchase_service_1 = require("./purchase.service");
const http_status_1 = __importDefault(require("http-status"));
const sendResponse_1 = __importDefault(require("../../utils/sendResponse"));
const catchAsync_1 = __importDefault(require("../../utils/catchAsync"));
const getAllPurchase = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield purchase_service_1.purchaseService.getAllPurchases(req.query);
    (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: http_status_1.default.OK,
        message: 'Purchase retrieved successfully',
        data: result.result,
        meta: result.meta
    });
}));
const getPurchaseById = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield purchase_service_1.purchaseService.getPurchaseById(req.params.id);
    (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: http_status_1.default.OK,
        message: 'Purchase retrieved successfully',
        data: result
    });
}));
const createPurchase = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield purchase_service_1.purchaseService.createPurchase(req);
    (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: http_status_1.default.CREATED,
        message: 'Purchase created successfully',
        data: result
    });
}));
const updatePurchase = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield purchase_service_1.purchaseService.updatePurchase(req.params.id, req);
    (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: http_status_1.default.OK,
        message: 'Purchase updated successfully',
        data: result
    });
}));
const deletePurchase = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    yield purchase_service_1.purchaseService.deletePurchase(req.params.id);
    (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: http_status_1.default.OK,
        message: 'Purchase deleted successfully',
        data: null
    });
}));
const generatePurchasePdf = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield purchase_service_1.purchaseService.generatePurchasePdf(req.params.id);
    res.set({
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="quotation-${req.params.id}.pdf"`
    });
    res.send(result);
}));
exports.purchaseController = {
    getAllPurchase,
    getPurchaseById,
    createPurchase,
    updatePurchase,
    deletePurchase,
    generatePurchasePdf
};
