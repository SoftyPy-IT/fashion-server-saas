import { v4 as uuidv4 } from 'uuid';
import { Request, Response, NextFunction } from 'express';
import { systemLogs } from '../utils/logger';

// Add correlation ID to each request for tracking
export const requestLoggerMiddleware = (req: Request, res: Response, next: NextFunction) => {
  // Generate unique ID for this request
  const correlationId = uuidv4();

  // Add correlation ID to request object
  (req as any).correlationId = correlationId;

  // Add correlation ID to response headers
  res.setHeader('X-Correlation-ID', correlationId);

  // Create a child logger specific to this request
  const requestLogger = systemLogs.child({ correlationId });
  (req as any).logger = requestLogger;

  // Log the start of the request
  requestLogger.info(`Request started: ${req.method} ${req.originalUrl || req.url}`);

  // Log request completion time
  const startTime = Date.now();

  // Log when request completes
  res.on('finish', () => {
    const duration = Date.now() - startTime;
    const level = res.statusCode >= 400 ? 'warn' : 'info';

    requestLogger[level](
      `Request completed: ${req.method} ${req.originalUrl || req.url} - Status: ${res.statusCode} - Duration: ${duration}ms`
    );
  });

  // Log if request fails
  res.on('error', (error) => {
    requestLogger.error(`Request failed: ${req.method} ${req.originalUrl || req.url}`, { error });
  });

  next();
};

// Helper to access the request logger
export const getRequestLogger = (req: Request) => {
  return (req as any).logger || systemLogs;
};

// Custom express error handler to catch and log route errors
export const asyncErrorHandler = (fn: Function) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      await fn(req, res, next);
    } catch (error) {
      // Log the error with the request's correlation ID
      const logger = getRequestLogger(req);
      logger.error(`Unhandled route error: ${(error as Error).message}`, {
        stack: (error as Error).stack,
        route: `${req.method} ${req.originalUrl || req.url}`
      });

      next(error);
    }
  };
};
