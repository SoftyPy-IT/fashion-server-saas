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
exports.storefrontService = exports.manageSliders = exports.updateStorefront = exports.getAllStorefront = void 0;
const http_status_1 = __importDefault(require("http-status"));
const storefront_model_1 = __importDefault(require("./storefront.model"));
const AppError_1 = __importDefault(require("../../errors/AppError"));
const getAllStorefront = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const result = yield storefront_model_1.default.findOne();
        if (!result) {
            throw new AppError_1.default(http_status_1.default.NOT_FOUND, 'Storefront not found');
        }
        result.sliders.sort((a, b) => a.order - b.order);
        return result;
    }
    catch (error) {
        throw new AppError_1.default(http_status_1.default.INTERNAL_SERVER_ERROR, 'Internal Server Error');
    }
});
exports.getAllStorefront = getAllStorefront;
const updateStorefront = (id, req) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const storefront = yield storefront_model_1.default.findById(id);
        if (!storefront) {
            throw new AppError_1.default(http_status_1.default.NOT_FOUND, 'This storefront does not exist');
        }
        const updatedStorefront = yield storefront_model_1.default.findByIdAndUpdate(id, { $set: req.body }, { new: true, runValidators: true });
        return updatedStorefront;
    }
    catch (error) {
        throw new AppError_1.default(http_status_1.default.BAD_REQUEST, error.message);
    }
});
exports.updateStorefront = updateStorefront;
const manageSliders = (id, req) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const storefront = yield storefront_model_1.default.findById(id);
        if (!storefront) {
            throw new AppError_1.default(http_status_1.default.NOT_FOUND, 'This storefront does not exist');
        }
        const { sliders } = req.body;
        if (sliders && Array.isArray(sliders)) {
            // Clear existing sliders
            storefront.sliders = [];
            // Add new sliders
            sliders.forEach((slider) => {
                storefront === null || storefront === void 0 ? void 0 : storefront.sliders.push(slider);
            });
        }
        const updatedStorefront = yield storefront.save();
        return updatedStorefront;
    }
    catch (error) {
        throw new AppError_1.default(http_status_1.default.BAD_REQUEST, error.message);
    }
});
exports.manageSliders = manageSliders;
exports.storefrontService = {
    getAllStorefront: exports.getAllStorefront,
    updateStorefront: exports.updateStorefront,
    manageSliders: exports.manageSliders
};
