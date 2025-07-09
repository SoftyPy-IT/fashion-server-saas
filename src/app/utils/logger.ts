import morgan from 'morgan';
import 'winston-daily-rotate-file';
import { createLogger, format, transports } from 'winston';
import path from 'path';

const { combine, timestamp, printf, errors } = format;

// Define log file paths
const logDir = path.join(__dirname, '..', '..', '..', 'logs');
const logFiles = {
  combined: path.join(logDir, `combined-%DATE%.log`),
  error: path.join(logDir, `error-%DATE%.log`),
  exception: path.join(logDir, 'exception.log'),
  rejection: path.join(logDir, 'rejection.log')
};

// Custom log format for human readability with error stack traces
const logFormat = printf(({ level, message, timestamp, stack, ...metadata }) => {
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
const fileRotateTransport = new transports.DailyRotateFile({
  filename: logFiles.combined,
  datePattern: 'YYYY-MM-DD',
  maxFiles: '14d'
});

// Setup file rotation specifically for errors
const errorRotateTransport = new transports.DailyRotateFile({
  filename: logFiles.error,
  datePattern: 'YYYY-MM-DD',
  level: 'error',
  maxFiles: '30d' // Keep error logs longer
});

// Create the Winston logger instance
export const systemLogs = createLogger({
  level: process.env.NODE_ENV === 'development' ? 'debug' : 'http',
  format: combine(
    timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    errors({ stack: true }), // Capture and format error stacks
    logFormat
  ),
  defaultMeta: { service: 'api-service' },
  transports: [
    // Console transport for development
    new transports.Console({
      level: 'debug',
      format: combine(format.colorize(), timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }), logFormat)
    }),
    fileRotateTransport,
    errorRotateTransport
  ],
  exceptionHandlers: [
    new transports.File({
      filename: logFiles.exception
    }),
    new transports.Console({
      format: combine(format.colorize(), timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }), logFormat)
    })
  ],
  rejectionHandlers: [
    new transports.File({
      filename: logFiles.rejection
    }),
    new transports.Console({
      format: combine(format.colorize(), timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }), logFormat)
    })
  ],
  exitOnError: false // Don't exit on handled exceptions
});

// Morgan middleware to log incoming requests
export const morganMiddleware = morgan(
  function (tokens, req, res) {
    return `[${tokens.date(req, res, 'iso')}] ${tokens.method(req, res)} ${tokens.url(
      req,
      res
    )} ${tokens.status(req, res)} - ${tokens['response-time'](req, res)} ms`;
  },
  {
    stream: {
      write: (message) => {
        systemLogs.http(message.trim());
      }
    }
  }
);

// Helper function to log any error with full details
export const logError = (err: any, requestInfo?: Record<string, any>) => {
  const errorDetails = {
    message: err.message || 'Unknown error',
    stack: err.stack,
    code: err.code,
    name: err.name,
    statusCode: err.statusCode || 500,
    requestInfo: requestInfo || {}
  };

  systemLogs.error(`Error: ${errorDetails.message}`, errorDetails);
};
