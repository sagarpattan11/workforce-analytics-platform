import { Request, Response, NextFunction } from 'express';

export class AppError extends Error {
  public statusCode: number;
  public status: string;

  constructor(message: string, statusCode = 500) {
    super(message);
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    Error.captureStackTrace(this, this.constructor);
  }
}

// 404 Not Found Middleware
export const notFoundHandler = (req: Request, res: Response, next: NextFunction): void => {
  res.status(404).json({
    success: false,
    status: 'fail',
    message: `Cannot find ${req.method} ${req.originalUrl} on this server`,
  });
};

// Central Error Handler Middleware
export const centralErrorHandler = (
  err: Error | AppError,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const statusCode = (err as AppError).statusCode || 500;
  const status = (err as AppError).status || 'error';

  res.status(statusCode).json({
    success: false,
    status,
    message: err.message || 'An unexpected internal server error occurred',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};