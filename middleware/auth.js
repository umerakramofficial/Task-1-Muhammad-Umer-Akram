const jwt = require('jsonwebtoken');
const { HTTP_STATUS } = require('../config/constants');

const JWT_SECRET = process.env.JWT_SECRET || 'auratech_super_secret_jwt_key_2026';

/**
 * Authentication Middleware (AuthN)
 * Verifies stateless JWT Bearer token in request headers.
 */
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Format: Bearer <token>

  if (!token) {
    return res.status(HTTP_STATUS.UNAUTHORIZED).json({
      success: false,
      error: {
        code: 'UNAUTHORIZED',
        message: 'Authentication token is missing. Please log in to access this resource.'
      }
    });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(HTTP_STATUS.UNAUTHORIZED).json({
        success: false,
        error: {
          code: 'INVALID_TOKEN',
          message: 'Authentication token is invalid or expired.'
        }
      });
    }

    req.user = user;
    next();
  });
};

/**
 * Authorization Middleware (AuthZ)
 * Enforces role-based access control (RBAC).
 */
const requireRole = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(HTTP_STATUS.UNAUTHORIZED).json({
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: 'User authentication required.'
        }
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(HTTP_STATUS.FORBIDDEN).json({
        success: false,
        error: {
          code: 'FORBIDDEN',
          message: 'Forbidden. You do not have sufficient permissions to perform this action.'
        }
      });
    }

    next();
  };
};

module.exports = {
  authenticateToken,
  requireRole,
  JWT_SECRET
};
