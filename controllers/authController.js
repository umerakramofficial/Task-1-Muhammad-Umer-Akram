const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../services/db');
const { HTTP_STATUS, ROLES } = require('../config/constants');
const { JWT_SECRET } = require('../middleware/auth');

class AuthController {
  
  /**
   * Register a new user account
   * POST /api/auth/register
   */
  static async register(req, res, next) {
    try {
      const { name, email, password } = req.sanitizedBody;

      // Business logic check: Check if user already exists
      const existingUser = await db.findUserByEmail(email);
      if (existingUser) {
        return res.status(HTTP_STATUS.BAD_REQUEST).json({
          success: false,
          error: {
            code: 'EMAIL_ALREADY_REGISTERED',
            message: 'An account with this email address already exists.'
          }
        });
      }

      // Hash password securely
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      // Save user to data store
      const newUser = await db.createUser({
        name,
        email,
        password: hashedPassword,
        role: ROLES.USER
      });

      // Generate JWT Token
      const userId = newUser.id || newUser._id.toString();
      const token = jwt.sign(
        { id: userId, email: newUser.email, role: newUser.role, name: newUser.name },
        JWT_SECRET,
        { expiresIn: '24h' }
      );

      return res.status(HTTP_STATUS.CREATED).json({
        success: true,
        message: 'User registered successfully.',
        data: {
          token,
          user: {
            id: userId,
            name: newUser.name,
            email: newUser.email,
            role: newUser.role
          }
        }
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * Authenticate user & return JWT token
   * POST /api/auth/login
   */
  static async login(req, res, next) {
    try {
      const { email, password } = req.sanitizedBody;

      const user = await db.findUserByEmail(email);
      if (!user) {
        return res.status(HTTP_STATUS.UNAUTHORIZED).json({
          success: false,
          error: {
            code: 'INVALID_CREDENTIALS',
            message: 'Invalid email or password.'
          }
        });
      }

      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(HTTP_STATUS.UNAUTHORIZED).json({
          success: false,
          error: {
            code: 'INVALID_CREDENTIALS',
            message: 'Invalid email or password.'
          }
        });
      }

      const userId = user.id || user._id.toString();
      const token = jwt.sign(
        { id: userId, email: user.email, role: user.role, name: user.name },
        JWT_SECRET,
        { expiresIn: '24h' }
      );

      return res.status(HTTP_STATUS.OK).json({
        success: true,
        message: 'Login successful.',
        data: {
          token,
          user: {
            id: userId,
            name: user.name,
            email: user.email,
            role: user.role
          }
        }
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * Get current authenticated user profile
   * GET /api/auth/me
   */
  static async getProfile(req, res, next) {
    try {
      const user = await db.findUserById(req.user.id);
      if (!user) {
        return res.status(HTTP_STATUS.NOT_FOUND).json({
          success: false,
          error: {
            code: 'USER_NOT_FOUND',
            message: 'User profile not found.'
          }
        });
      }

      const userId = user.id || user._id.toString();
      return res.status(HTTP_STATUS.OK).json({
        success: true,
        data: {
          user: {
            id: userId,
            name: user.name,
            email: user.email,
            role: user.role,
            createdAt: user.createdAt
          }
        }
      });
    } catch (err) {
      next(err);
    }
  }
}

module.exports = AuthController;
