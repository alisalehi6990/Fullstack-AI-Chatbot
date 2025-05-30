import { ApolloError } from 'apollo-server-express';
import { logError } from './logger';

export class AppError extends Error {
  constructor(
    message: string,
    public statusCode: number,
    public code: string,
    public isOperational = true
  ) {
    super(message);
    Object.setPrototypeOf(this, AppError.prototype);
  }
}

export const handleError = (
  error: Error,
  context: {
    userId?: string;
    functionName: string;
    additionalInfo?: any;
  }
): ApolloError => {
  // Log the error
  logError(error, context);

  // Handle known operational errors
  if (error instanceof AppError) {
    return new ApolloError(error.message, error.code);
  }

  // Handle unknown errors
  return new ApolloError(
    'An unexpected error occurred',
    'INTERNAL_SERVER_ERROR'
  );
};

export const createError = (
  message: string,
  code: string,
  statusCode: number = 500
): AppError => {
  return new AppError(message, statusCode, code);
}; 