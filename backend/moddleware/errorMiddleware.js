class AppError extends Error {
  constructor(message, statusCode, code = 'INTERNAL_ERROR', details = null) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

const errorMiddleware = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.code = err.code || 'INTERNAL_SERVER_ERROR';

  if (process.env.NODE_ENV === 'development') {
    console.error(err);
  }

  // Handle Mongoose duplicate key error (e.g. unique email)
  if (err.code === 11000 || (err.name === 'MongoServerError' && err.code === 11000)) {
    const field = Object.keys(err.keyValue)[0];
    return res.status(400).json({
      success: false,
      error: {
        code: 'BAD_REQUEST',
        message: `An account with this ${field} already exists.`,
        details: [{ field, issue: 'duplicate_key' }]
      }
    });
  }

  // Handle Mongoose Validation Error
  if (err.name === 'ValidationError') {
    const details = Object.keys(err.errors).map(field => ({
      field,
      issue: err.errors[field].message
    }));
    return res.status(400).json({
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Validation failed',
        details
      }
    });
  }

  // Handle JWT errors
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      success: false,
      error: {
        code: 'UNAUTHORIZED',
        message: 'Invalid authorization token'
      }
    });
  }

  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({
      success: false,
      error: {
        code: 'UNAUTHORIZED',
        message: 'Authorization token expired'
      }
    });
  }

  res.status(err.statusCode).json({
    success: false,
    error: {
      code: err.code,
      message: err.message,
      ...(err.details && { details: err.details })
    }
  });
};

module.exports = {
  AppError,
  errorMiddleware
};
