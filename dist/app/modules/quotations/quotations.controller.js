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
exports.quotationsController = void 0;
const quotations_service_1 = require("./quotations.service");
const http_status_1 = __importDefault(require("http-status"));
const sendResponse_1 = __importDefault(require("../../utils/sendResponse"));
const catchAsync_1 = __importDefault(require("../../utils/catchAsync"));
const getAllQuotations = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield quotations_service_1.quotationsService.getAllQuotations(req.query);
    (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: http_status_1.default.OK,
        message: 'Quotations retrieved successfully',
        data: result.result,
        meta: result.meta
    });
}));
const getQuotationsById = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield quotations_service_1.quotationsService.getQuotationsById(req.params.id);
    (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: http_status_1.default.OK,
        message: 'Quotations retrieved successfully',
        data: result
    });
}));
const createQuotations = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield quotations_service_1.quotationsService.createQuotations(req);
    (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: http_status_1.default.CREATED,
        message: 'Quotations created successfully',
        data: result
    });
}));
const updateQuotations = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield quotations_service_1.quotationsService.updateQuotations(req.params.id, req);
    (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: http_status_1.default.OK,
        message: 'Quotations updated successfully',
        data: result
    });
}));
const deleteQuotations = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    yield quotations_service_1.quotationsService.deleteQuotations(req.params.id);
    (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: http_status_1.default.OK,
        message: 'Quotations deleted successfully',
        data: null
    });
}));
const generateQuotationPdf = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield quotations_service_1.quotationsService.generateQuotationPdf(req.params.id);
    res.set({
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="quotation-${req.params.id}.pdf"`
    });
    res.send(result);
}));
exports.quotationsController = {
    getAllQuotations,
    getQuotationsById,
    createQuotations,
    updateQuotations,
    deleteQuotations,
    generateQuotationPdf
};
