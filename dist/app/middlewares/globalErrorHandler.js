"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const zod_1 = require("zod");
const config_1 = __importDefault(require("../config"));
const AppError_1 = __importDefault(require("../errors/AppError"));
const handleCastError_1 = __importDefault(require("../errors/handleCastError"));
const handleDuplicateError_1 = __importDefault(require("../errors/handleDuplicateError"));
const handleValidationError_1 = __importDefault(require("../errors/handleValidationError"));
const handleZodError_1 = __importDefault(require("../errors/handleZodError"));
const logger_1 = require("../utils/logger"); // Import the enhanced logger
const globalErrorHandler = (err, req, res, next) => {
    let statusCode = 500;
    let message = 'Something went wrong!';
    let errorSources = [
        {
            path: '',
            message: 'Something went wrong'
        }
    ];
    // Log request details to provide context for debugging
    const requestInfo = {
        url: req.originalUrl || req.url,
        method: req.method,
        body: config_1.default.NODE_ENV === 'development' ? req.body : undefined,
        params: req.params,
        query: req.query,
        ip: req.ip,
        headers: {
            'user-agent': req.headers['user-agent'],
            referer: req.headers.referer,
            'content-type': req.headers['content-type']
        }
    };
    // Handle different types of errors
    if (err instanceof zod_1.ZodError) {
        const simplifiedError = (0, handleZodError_1.default)(err);
        statusCode = simplifiedError === null || simplifiedError === void 0 ? void 0 : simplifiedError.statusCode;
        message = simplifiedError === null || simplifiedError === void 0 ? void 0 : simplifiedError.message;
        errorSources = simplifiedError === null || simplifiedError === void 0 ? void 0 : simplifiedError.errorSources;
        // Log validation errors with request context
        (0, logger_1.logError)(Object.assign(Object.assign({}, err), { type: 'ZodError', message,
            statusCode }), requestInfo);
    }
    else if ((err === null || err === void 0 ? void 0 : err.name) === 'ValidationError') {
        const simplifiedError = (0, handleValidationError_1.default)(err);
        statusCode = simplifiedError === null || simplifiedError === void 0 ? void 0 : simplifiedError.statusCode;
        message = simplifiedError === null || simplifiedError === void 0 ? void 0 : simplifiedError.message;
        errorSources = simplifiedError === null || simplifiedError === void 0 ? void 0 : simplifiedError.errorSources;
        // Log mongoose validation errors
        (0, logger_1.logError)(Object.assign(Object.assign({}, err), { type: 'ValidationError', message,
            statusCode }), requestInfo);
    }
    else if ((err === null || err === void 0 ? void 0 : err.name) === 'CastError') {
        const simplifiedError = (0, handleCastError_1.default)(err);
        statusCode = simplifiedError === null || simplifiedError === void 0 ? void 0 : simplifiedError.statusCode;
        message = simplifiedError === null || simplifiedError === void 0 ? void 0 : simplifiedError.message;
        errorSources = simplifiedError === null || simplifiedError === void 0 ? void 0 : simplifiedError.errorSources;
        // Log mongoose cast errors
        (0, logger_1.logError)(Object.assign(Object.assign({}, err), { type: 'CastError', message,
            statusCode }), requestInfo);
    }
    else if ((err === null || err === void 0 ? void 0 : err.code) === 11000) {
        const simplifiedError = (0, handleDuplicateError_1.default)(err);
        statusCode = simplifiedError === null || simplifiedError === void 0 ? void 0 : simplifiedError.statusCode;
        message = simplifiedError === null || simplifiedError === void 0 ? void 0 : simplifiedError.message;
        errorSources = simplifiedError === null || simplifiedError === void 0 ? void 0 : simplifiedError.errorSources;
        // Log duplicate key errors
        (0, logger_1.logError)(Object.assign(Object.assign({}, err), { type: 'DuplicateKeyError', message,
            statusCode }), requestInfo);
    }
    else if (err instanceof AppError_1.default) {
        statusCode = err === null || err === void 0 ? void 0 : err.statusCode;
        message = err.message;
        errorSources = [
            {
                path: '',
                message: err === null || err === void 0 ? void 0 : err.message
            }
        ];
        // Log custom application errors
        (0, logger_1.logError)(err, requestInfo);
    }
    else if (err instanceof Error) {
        message = err.message;
        errorSources = [
            {
                path: '',
                message: err === null || err === void 0 ? void 0 : err.message
            }
        ];
        // Log general errors
        (0, logger_1.logError)(err, requestInfo);
    }
    else {
        // Log unknown errors
        (0, logger_1.logError)({
            message: 'Unknown error type',
            unknownError: err
        }, requestInfo);
    }
    // Return response to client
    return res.status(statusCode).json(Object.assign(Object.assign({ success: false, message,
        errorSources }, (config_1.default.NODE_ENV === 'development' ? { err } : {})), { stack: config_1.default.NODE_ENV === 'development' ? err === null || err === void 0 ? void 0 : err.stack : null }));
};
exports.default = globalErrorHandler;
