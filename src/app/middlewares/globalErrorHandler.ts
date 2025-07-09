/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable no-unused-vars */
import { ErrorRequestHandler } from 'express';
import { ZodError } from 'zod';
import config from '../config';
import AppError from '../errors/AppError';
import handleCastError from '../errors/handleCastError';
import handleDuplicateError from '../errors/handleDuplicateError';
import handleValidationError from '../errors/handleValidationError';
import handleZodError from '../errors/handleZodError';
import { TErrorSources } from '../interface/error';
import { logError } from '../utils/logger'; // Import the enhanced logger

const globalErrorHandler: ErrorRequestHandler = (err, req, res, next) => {
  let statusCode = 500;
  let message = 'Something went wrong!';
  let errorSources: TErrorSources = [
    {
      path: '',
      message: 'Something went wrong'
    }
  ];

  // Log request details to provide context for debugging
  const requestInfo = {
    url: req.originalUrl || req.url,
    method: req.method,
    body: config.NODE_ENV === 'development' ? req.body : undefined,
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
  if (err instanceof ZodError) {
    const simplifiedError = handleZodError(err);
    statusCode = simplifiedError?.statusCode;
    message = simplifiedError?.message;
    errorSources = simplifiedError?.errorSources;

    // Log validation errors with request context
    logError(
      {
        ...err,
        type: 'ZodError',
        message,
        statusCode
      },
      requestInfo
    );
  } else if (err?.name === 'ValidationError') {
    const simplifiedError = handleValidationError(err);
    statusCode = simplifiedError?.statusCode;
    message = simplifiedError?.message;
    errorSources = simplifiedError?.errorSources;

    // Log mongoose validation errors
    logError(
      {
        ...err,
        type: 'ValidationError',
        message,
        statusCode
      },
      requestInfo
    );
  } else if (err?.name === 'CastError') {
    const simplifiedError = handleCastError(err);
    statusCode = simplifiedError?.statusCode;
    message = simplifiedError?.message;
    errorSources = simplifiedError?.errorSources;

    // Log mongoose cast errors
    logError(
      {
        ...err,
        type: 'CastError',
        message,
        statusCode
      },
      requestInfo
    );
  } else if (err?.code === 11000) {
    const simplifiedError = handleDuplicateError(err);
    statusCode = simplifiedError?.statusCode;
    message = simplifiedError?.message;
    errorSources = simplifiedError?.errorSources;

    // Log duplicate key errors
    logError(
      {
        ...err,
        type: 'DuplicateKeyError',
        message,
        statusCode
      },
      requestInfo
    );
  } else if (err instanceof AppError) {
    statusCode = err?.statusCode;
    message = err.message;
    errorSources = [
      {
        path: '',
        message: err?.message
      }
    ];

    // Log custom application errors
    logError(err, requestInfo);
  } else if (err instanceof Error) {
    message = err.message;
    errorSources = [
      {
        path: '',
        message: err?.message
      }
    ];

    // Log general errors
    logError(err, requestInfo);
  } else {
    // Log unknown errors
    logError(
      {
        message: 'Unknown error type',
        unknownError: err
      },
      requestInfo
    );
  }

  // Return response to client
  return res.status(statusCode).json({
    success: false,
    message,
    errorSources,
    ...(config.NODE_ENV === 'development' ? { err } : {}),
    stack: config.NODE_ENV === 'development' ? err?.stack : null
  });
};

export default globalErrorHandler;
