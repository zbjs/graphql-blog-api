// src/middleware/error.middleware.ts
import { Request, Response, NextFunction } from 'express';
import { GraphQLError } from 'graphql';
import { logger } from '../config/logger';

// Custom error class for API errors
export class ApiError extends Error {
  constructor(
    public statusCode: number,
    public message: string,
    public code?: string,
    public errors?: any[]
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

// Convert various error types to ApiError
const normalizeError = (error: any): ApiError => {
  if (error instanceof ApiError) {
    return error;
  }

  if (error instanceof GraphQLError) {
    return new ApiError(
      400,
      error.message,
      'GRAPHQL_ERROR',
    );
  }

  if (error.name === 'ValidationError') {
    return new ApiError(
      400,
      'Validation Error',
      'VALIDATION_ERROR',
      Object.values(error.errors).map((err: any) => ({
        field: err.path,
        message: err.message
      }))
    );
  }

  if (error.name === 'MongoError' && error.code === 11000) {
    return new ApiError(
      409,
      'Duplicate Entry',
      'DUPLICATE_ERROR',
      [{
        field: Object.keys(error.keyValue)[0],
        message: `${Object.keys(error.keyValue)[0]} already exists`
      }]
    );
  }

  // Default to 500 internal server error
  return new ApiError(
    500,
    'Internal Server Error',
    'INTERNAL_ERROR'
  );
};

// Main error handling middleware
export const errorMiddleware = (
  error: Error,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const normalizedError = normalizeError(error);

  // Log the error
  logger.error('Error:', {
    message: normalizedError.message,
    code: normalizedError.code,
    stack: normalizedError.stack,
    path: req.path,
    method: req.method,
    userId: req.user?.id,
    errors: normalizedError.errors
  });

  // Send response
  res.status(normalizedError.statusCode).json({
    status: 'error',
    message: normalizedError.message,
    code: normalizedError.code,
    errors: normalizedError.errors,
    ...(process.env.NODE_ENV === 'development' && {
      stack: normalizedError.stack
    })
  });
};

// Catch 404 errors
export const notFoundMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const error = new ApiError(
    404,
    'Resource not found',
    'NOT_FOUND'
  );
  next(error);
};

// Handle uncaught exceptions
process.on('uncaughtException', (error: Error) => {
  logger.error('Uncaught Exception:', {
    message: error.message,
    stack: error.stack
  });
  process.exit(1);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason: any) => {
  logger.error('Unhandled Rejection:', {
    message: reason?.message || reason,
    stack: reason?.stack
  });
  process.exit(1);
});