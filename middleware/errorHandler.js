const { HTTP_STATUS } = require('../config/constants');

/**
 * Centralized Error Handling Middleware
 */
const errorHandler = (err, req, res, next) => {
  console.error(' [Centralized Error Handler]:', err);

  // JSON Body Syntax Parsing Error (Malformed JSON)
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    return res.status(HTTP_STATUS.BAD_REQUEST).json({
      success: false,
      error: {
        code: 'MALFORMED_JSON',
        message: 'The request body contains invalid JSON syntax.'
      }
    });
  }

  // Mongoose Duplicate Key Error (E11000)
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue || {})[0] || 'field';
    return res.status(HTTP_STATUS.BAD_REQUEST).json({
      success: false,
      error: {
        code: 'DUPLICATE_KEY_ERROR',
        message: `An entry with this ${field} already exists.`
      }
    });
  }

  // Mongoose Validation Error
  if (err.name === 'ValidationError') {
    const details = Object.values(err.errors).map(e => e.message);
    return res.status(HTTP_STATUS.BAD_REQUEST).json({
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Database schema validation failed.',
        details
      }
    });
  }

  // Mongoose Invalid ObjectId (CastError)
  if (err.name === 'CastError') {
    return res.status(HTTP_STATUS.BAD_REQUEST).json({
      success: false,
      error: {
        code: 'INVALID_ID_FORMAT',
        message: `Invalid format for field '${err.path}'.`
      }
    });
  }

  // Custom Application Status Code or Default 500
  const statusCode = err.statusCode || HTTP_STATUS.INTERNAL_SERVER_ERROR;
  const message = err.message || 'An unexpected internal server error occurred.';

  return res.status(statusCode).json({
    success: false,
    error: {
      code: err.code || 'INTERNAL_SERVER_ERROR',
      message: message,
      ...(process.env.NODE_ENV === 'development' ? { stack: err.stack } : {})
    }
  });
};

/**
 * 404 Route Not Found Handler
 */
const notFoundHandler = (req, res) => {
  return res.status(HTTP_STATUS.NOT_FOUND).json({
    success: false,
    error: {
      code: 'RESOURCE_NOT_FOUND',
      message: `The requested endpoint '${req.originalUrl}' does not exist on this server.`
    }
  });
};

module.exports = {
  errorHandler,
  notFoundHandler
};
