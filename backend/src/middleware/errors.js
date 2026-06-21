// Enhanced error handling with logging and error categorization

// Log errors (in production, use a proper logging library like Winston)
function logError(err, req) {
  const timestamp = new Date().toISOString();
  const method = req?.method || 'UNKNOWN';
  const path = req?.path || req?.url || 'UNKNOWN';
  const ip = req?.ip || req?.connection?.remoteAddress || 'UNKNOWN';
  const userId = req?.user?.id || 'anonymous';

  const logEntry = {
    timestamp,
    method,
    path,
    ip,
    userId,
    statusCode: err.statusCode || 500,
    message: err.message,
    name: err.name,
    stack: process.env.NODE_ENV !== 'production' ? err.stack : undefined,
  };

  // Log to console (replace with proper logger in production)
  if (err.statusCode && err.statusCode < 500) {
    // Client errors (4xx) - less critical
    console.warn('[CLIENT_ERROR]', JSON.stringify(logEntry));
  } else {
    // Server errors (5xx) - critical
    console.error('[SERVER_ERROR]', JSON.stringify(logEntry));
  }

  // In production, send to error tracking service (Sentry, LogRocket, etc.)
  // Example: if (process.env.NODE_ENV === 'production' && err.statusCode >= 500) {
  //   errorTrackingService.captureException(err, { extra: logEntry });
  // }
}

// Standard 404 handler when no route matched
export function notFound(req, res, _next) {
  logError({ statusCode: 404, message: 'Route not found', name: 'NotFoundError' }, req);
  res.status(404).json({ error: 'Not Found' });
}

// Centralized error handler to avoid leaking stack traces to clients
export function errorHandler(err, req, res, _next) {
  // Log the error
  logError(err, req);

  const status = err.statusCode || 500;
  
  // Handle different error types
  let publicMessage = err.publicMessage || err.message || 'Internal Server Error';
  
  // Mongoose validation errors
  if (err.name === 'ValidationError') {
    const fieldErrors = {};
    if (err.errors) {
      Object.keys(err.errors).forEach((key) => {
        fieldErrors[key] = err.errors[key].message;
      });
    }
    return res.status(422).json({
      error: 'Validation failed',
      fieldErrors,
    });
  }

  // Mongoose duplicate key error
  if (err.code === 11000) {
    const field = Object.keys(err.keyPattern || {})[0] || 'field';
    return res.status(409).json({
      error: `${field} already exists`,
      fieldErrors: { [field]: 'Already exists' },
    });
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
    return res.status(401).json({
      error: 'Invalid or expired token',
    });
  }

  // Multer file upload errors
  if (err.name === 'MulterError') {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(413).json({
        error: 'File too large',
      });
    }
    if (err.code === 'LIMIT_FILE_COUNT') {
      return res.status(413).json({
        error: 'Too many files',
      });
    }
    return res.status(400).json({
      error: 'File upload error',
    });
  }

  // Cast errors (invalid ObjectId, etc.)
  if (err.name === 'CastError') {
    return res.status(400).json({
      error: 'Invalid ID format',
    });
  }

  // Build response payload (professional structure)
  const payload = {
    success: false,
    error: publicMessage,
    timestamp: new Date().toISOString(),
  };

  // Include field errors if present
  if (err.fieldErrors) {
    payload.fieldErrors = err.fieldErrors;
  }

  if (err.meta) {
    payload.meta = err.meta;
  }

  // Include request ID for tracking
  if (req.requestId) {
    payload.requestId = req.requestId;
  }

  // Include debug info in development
  if (process.env.NODE_ENV !== 'production') {
    payload.debug = {
      message: err.message,
      stack: err.stack,
      name: err.name,
      path: req.path,
      method: req.method,
    };
  }

  res.status(status).json(payload);
}

// Small helper to create HTTP errors with optional fieldErrors
export function httpError(statusCode, publicMessage, fieldErrors) {
  const e = new Error(publicMessage || 'Error');
  e.statusCode = statusCode;
  e.publicMessage = publicMessage;
  if (fieldErrors) e.fieldErrors = fieldErrors;
  return e;
}

// Async error wrapper - automatically catches errors in async route handlers
export function asyncHandler(fn) {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}
