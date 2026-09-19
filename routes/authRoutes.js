const express = require('express');
const router = express.Router();
const AuthController = require('../controllers/authController');
const Gatekeeper = require('../middleware/gatekeeper');
const { authenticateToken } = require('../middleware/auth');
const { contactSubmissionLimiter } = require('../middleware/rateLimiter');

// POST /api/auth/register
router.post('/register', contactSubmissionLimiter, Gatekeeper.validateRegistration, AuthController.register);

// POST /api/auth/login
router.post('/login', contactSubmissionLimiter, Gatekeeper.validateLogin, AuthController.login);

// GET /api/auth/me (Protected)
router.get('/me', authenticateToken, AuthController.getProfile);

module.exports = router;
