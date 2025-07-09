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
exports.bytesToMB = exports.imageValidator = exports.renderEjs = void 0;
const ejs_1 = __importDefault(require("ejs"));
const AppError_1 = __importDefault(require("../errors/AppError"));
const http_status_1 = __importDefault(require("http-status"));
const renderEjs = (fileName, payload) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const filePath = `${process.cwd()}/views/${fileName}.ejs`;
        const html = yield ejs_1.default.renderFile(filePath, payload);
        return html;
    }
    catch (error) {
        throw new AppError_1.default(http_status_1.default.INTERNAL_SERVER_ERROR, error.message || 'Something went wrong while rendering ejs file');
    }
});
exports.renderEjs = renderEjs;
const supportedMimeTypes = ['image/png', 'image/jpg', 'image/jpeg', 'image/webp', 'image/gif'];
const imageValidator = (size, mime) => {
    if ((0, exports.bytesToMB)(size) > 2) {
        return 'Image size should be less than 2MB';
    }
    else if (!supportedMimeTypes.includes(mime)) {
        return 'Image type not supported! Please upload a png or jpg/jpeg image';
    }
    return null;
};
exports.imageValidator = imageValidator;
const bytesToMB = (bytes) => {
    return bytes / (1024 * 1024);
};
exports.bytesToMB = bytesToMB;
