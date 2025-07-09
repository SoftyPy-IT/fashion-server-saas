"use strict";
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.logError = exports.morganMiddleware = exports.systemLogs = void 0;
const morgan_1 = __importDefault(require("morgan"));
require("winston-daily-rotate-file");
const winston_1 = require("winston");
const path_1 = __importDefault(require("path"));
const { combine, timestamp, printf, errors } = winston_1.format;
// Define log file paths
const logDir = path_1.default.join(__dirname, '..', '..', '..', 'logs');
const logFiles = {
    combined: path_1.default.join(logDir, `combined-%DATE%.log`),
    error: path_1.default.join(logDir, `error-%DATE%.log`),
    exception: path_1.default.join(logDir, 'exception.log'),
    rejection: path_1.default.join(logDir, 'rejection.log')
};
// Custom log format for human readability with error stack traces
const logFormat = printf((_a) => {
    var { level, message, timestamp, stack } = _a, metadata = __rest(_a, ["level", "message", "timestamp", "stack"]);
    let logMessage = `[${timestamp}] ${level.toUpperCase()}: ${message}`;
    // Add error stack trace if available
    if (stack) {
        logMessage += `\n${stack}`;
    }
    // Add any additional metadata
    if (Object.keys(metadata).length > 0) {
        logMessage += `\n${JSON.stringify(metadata, null, 2)}`;
    }
    return logMessage;
});
// Setup file rotation for all logs
const fileRotateTransport = new winston_1.transports.DailyRotateFile({
    filename: logFiles.combined,
    datePattern: 'YYYY-MM-DD',
    maxFiles: '14d'
});
// Setup file rotation specifically for errors
const errorRotateTransport = new winston_1.transports.DailyRotateFile({
    filename: logFiles.error,
    datePattern: 'YYYY-MM-DD',
    level: 'error',
    maxFiles: '30d' // Keep error logs longer
});
// Create the Winston logger instance
exports.systemLogs = (0, winston_1.createLogger)({
    level: process.env.NODE_ENV === 'development' ? 'debug' : 'http',
    format: combine(timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }), errors({ stack: true }), // Capture and format error stacks
    logFormat),
    defaultMeta: { service: 'api-service' },
    transports: [
        // Console transport for development
        new winston_1.transports.Console({
            level: 'debug',
            format: combine(winston_1.format.colorize(), timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }), logFormat)
        }),
        fileRotateTransport,
        errorRotateTransport
    ],
    exceptionHandlers: [
        new winston_1.transports.File({
            filename: logFiles.exception
        }),
        new winston_1.transports.Console({
            format: combine(winston_1.format.colorize(), timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }), logFormat)
        })
    ],
    rejectionHandlers: [
        new winston_1.transports.File({
            filename: logFiles.rejection
        }),
        new winston_1.transports.Console({
            format: combine(winston_1.format.colorize(), timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }), logFormat)
        })
    ],
    exitOnError: false // Don't exit on handled exceptions
});
// Morgan middleware to log incoming requests
exports.morganMiddleware = (0, morgan_1.default)(function (tokens, req, res) {
    return `[${tokens.date(req, res, 'iso')}] ${tokens.method(req, res)} ${tokens.url(req, res)} ${tokens.status(req, res)} - ${tokens['response-time'](req, res)} ms`;
}, {
    stream: {
        write: (message) => {
            exports.systemLogs.http(message.trim());
        }
    }
});
// Helper function to log any error with full details
const logError = (err, requestInfo) => {
    const errorDetails = {
        message: err.message || 'Unknown error',
        stack: err.stack,
        code: err.code,
        name: err.name,
        statusCode: err.statusCode || 500,
        requestInfo: requestInfo || {}
    };
    exports.systemLogs.error(`Error: ${errorDetails.message}`, errorDetails);
};
exports.logError = logError;
