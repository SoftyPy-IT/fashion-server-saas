"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadFileWithData = void 0;
const cloudinary_1 = require("../utils/cloudinary");
const AppError_1 = __importDefault(require("../errors/AppError"));
const http_status_1 = __importDefault(require("http-status"));
const uploadFileWithData = (schema) => {
    return (req, res, next) => {
        cloudinary_1.upload.single('file')(req, res, (err) => {
            var _a, _b;
            if (err) {
                return next(new AppError_1.default(http_status_1.default.BAD_REQUEST, err.message));
            }
            try {
                if (req.body.data) {
                    req.body = schema.parse(JSON.parse(req.body.data));
                }
                return next();
            }
            catch (error) {
                return next(new AppError_1.default(http_status_1.default.BAD_REQUEST, (_b = (_a = error.errors) !== null && _a !== void 0 ? _a : error.message) !== null && _b !== void 0 ? _b : 'Invalid data'));
            }
        });
    };
};
exports.uploadFileWithData = uploadFileWithData;
