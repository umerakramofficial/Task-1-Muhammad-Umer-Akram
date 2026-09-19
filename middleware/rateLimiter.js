const rateLimit = require('express-rate-limit');
const { HTTP_STATUS } = require('../config/constants');

/**
 * General API Rate Limiter
 * 100 requests per 15 minutes window
 */
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    return res.status(HTTP_STATUS.TOO_MANY_REQUESTS).json({
      success: false,
      error: {
        code: 'TOO_MANY_REQUESTS',
        message: 'Too many requests from this IP, please try again after 15 minutes.'
      }
    });
  }
});

/**
 * Strict Contact Form & Auth Submission Limiter
 * 5 submissions per 10 minutes window
 */
const contactSubmissionLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    return res.status(HTTP_STATUS.TOO_MANY_REQUESTS).json({
      success: false,
      error: {
        code: 'TOO_MANY_REQUESTS',
        message: 'Rate limit exceeded: Maximum 5 contact submissions allowed per 10 minutes to prevent spam.'
      }
    });
  }
});

module.exports = {
  apiLimiter,
  contactSubmissionLimiter
};
