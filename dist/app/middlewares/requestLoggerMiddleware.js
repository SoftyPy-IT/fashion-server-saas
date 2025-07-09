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
Object.defineProperty(exports, "__esModule", { value: true });
exports.asyncErrorHandler = exports.getRequestLogger = exports.requestLoggerMiddleware = void 0;
const uuid_1 = require("uuid");
const logger_1 = require("../utils/logger");
// Add correlation ID to each request for tracking
const requestLoggerMiddleware = (req, res, next) => {
    // Generate unique ID for this request
    const correlationId = (0, uuid_1.v4)();
    // Add correlation ID to request object
    req.correlationId = correlationId;
    // Add correlation ID to response headers
    res.setHeader('X-Correlation-ID', correlationId);
    // Create a child logger specific to this request
    const requestLogger = logger_1.systemLogs.child({ correlationId });
    req.logger = requestLogger;
    // Log the start of the request
    requestLogger.info(`Request started: ${req.method} ${req.originalUrl || req.url}`);
    // Log request completion time
    const startTime = Date.now();
    // Log when request completes
    res.on('finish', () => {
        const duration = Date.now() - startTime;
        const level = res.statusCode >= 400 ? 'warn' : 'info';
        requestLogger[level](`Request completed: ${req.method} ${req.originalUrl || req.url} - Status: ${res.statusCode} - Duration: ${duration}ms`);
    });
    // Log if request fails
    res.on('error', (error) => {
        requestLogger.error(`Request failed: ${req.method} ${req.originalUrl || req.url}`, { error });
    });
    next();
};
exports.requestLoggerMiddleware = requestLoggerMiddleware;
// Helper to access the request logger
const getRequestLogger = (req) => {
    return req.logger || logger_1.systemLogs;
};
exports.getRequestLogger = getRequestLogger;
// Custom express error handler to catch and log route errors
const asyncErrorHandler = (fn) => {
    return (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            yield fn(req, res, next);
        }
        catch (error) {
            // Log the error with the request's correlation ID
            const logger = (0, exports.getRequestLogger)(req);
            logger.error(`Unhandled route error: ${error.message}`, {
                stack: error.stack,
                route: `${req.method} ${req.originalUrl || req.url}`
            });
            next(error);
        }
    });
};
exports.asyncErrorHandler = asyncErrorHandler;
