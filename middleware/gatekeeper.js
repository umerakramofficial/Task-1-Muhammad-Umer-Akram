const { HTTP_STATUS } = require('../config/constants');

/**
 * Gatekeeper Rule Engine ('Never Trust the Client')
 * Performs strict Syntactic (format & structure) and Semantic (business logic & rules) validation.
 */
class Gatekeeper {
  
  /**
   * Helper: Return standardized 400 Bad Request error response
   */
  static sendValidationError(res, errors) {
    return res.status(HTTP_STATUS.BAD_REQUEST).json({
      success: false,
      error: {
        code: 'GATEKEEPER_VALIDATION_ERROR',
        message: 'Request payload failed syntactic or semantic validation checks.',
        details: errors
      }
    });
  }

  /**
   * Contact Form Gatekeeper (Syntactic & Semantic)
   */
  static validateContactSubmission(req, res, next) {
    const errors = [];
    const { name, email, subject, message } = req.body || {};

    // --- SYNTACTIC CHECKS ---
    if (!name || typeof name !== 'string') {
      errors.push({ field: 'name', issue: 'Name is required and must be a valid string.' });
    }
    if (!email || typeof email !== 'string') {
      errors.push({ field: 'email', issue: 'Email address is required.' });
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email.trim())) {
        errors.push({ field: 'email', issue: 'Email address format is invalid.' });
      }
    }
    if (!message || typeof message !== 'string') {
      errors.push({ field: 'message', issue: 'Message is required and must be a string.' });
    }

    if (errors.length > 0) {
      return Gatekeeper.sendValidationError(res, errors);
    }

    // --- SEMANTIC CHECKS (Business Logic & Constraints) ---
    const trimmedName = name.trim();
    const trimmedMessage = message.trim();
    const trimmedSubject = subject ? String(subject).trim() : 'No Subject';

    if (trimmedName.length < 2 || trimmedName.length > 100) {
      errors.push({ field: 'name', issue: 'Name must be between 2 and 100 characters long.' });
    }

    if (trimmedMessage.length < 5) {
      errors.push({ field: 'message', issue: 'Message must contain at least 5 characters.' });
    }
    if (trimmedMessage.length > 2000) {
      errors.push({ field: 'message', issue: 'Message exceeds maximum length of 2000 characters.' });
    }

    // Anti-spam semantic check (e.g. test for generic repetitive spam patterns)
    const spamKeywords = ['buy cheap viagra', 'crypto investment guarantee', 'win $1000000 now'];
    const lowerMsg = trimmedMessage.toLowerCase();
    if (spamKeywords.some(keyword => lowerMsg.includes(keyword))) {
      errors.push({ field: 'message', issue: 'Message contains blacklisted spam patterns.' });
    }

    if (errors.length > 0) {
      return Gatekeeper.sendValidationError(res, errors);
    }

    // Attach sanitized data to request
    req.sanitizedBody = {
      name: trimmedName,
      email: email.trim().toLowerCase(),
      subject: trimmedSubject,
      message: trimmedMessage
    };

    next();
  }

  /**
   * User Registration Gatekeeper (Syntactic & Semantic)
   */
  static validateRegistration(req, res, next) {
    const errors = [];
    const { name, email, password } = req.body || {};

    // Syntactic Validation
    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      errors.push({ field: 'name', issue: 'Full name is required.' });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(String(email).trim())) {
      errors.push({ field: 'email', issue: 'Valid email address is required.' });
    }

    if (!password || typeof password !== 'string') {
      errors.push({ field: 'password', issue: 'Password is required.' });
    } else if (password.length < 6) {
      errors.push({ field: 'password', issue: 'Password must be at least 6 characters long.' });
    }

    if (errors.length > 0) {
      return Gatekeeper.sendValidationError(res, errors);
    }

    req.sanitizedBody = {
      name: name.trim(),
      email: String(email).trim().toLowerCase(),
      password
    };

    next();
  }

  /**
   * User Login Gatekeeper (Syntactic)
   */
  static validateLogin(req, res, next) {
    const errors = [];
    const { email, password } = req.body || {};

    if (!email || typeof email !== 'string') {
      errors.push({ field: 'email', issue: 'Email address is required.' });
    }
    if (!password || typeof password !== 'string') {
      errors.push({ field: 'password', issue: 'Password is required.' });
    }

    if (errors.length > 0) {
      return Gatekeeper.sendValidationError(res, errors);
    }

    req.sanitizedBody = {
      email: String(email).trim().toLowerCase(),
      password
    };

    next();
  }

  /**
   * Project Creation/Update Gatekeeper (Syntactic & Semantic)
   */
  static validateProject(req, res, next) {
    const errors = [];
    const { title, category, summary, description, tech } = req.body || {};

    const validCategories = ['frontend', 'fullstack', 'ui'];

    if (!title || typeof title !== 'string' || title.trim().length === 0) {
      errors.push({ field: 'title', issue: 'Project title is required.' });
    }
    if (!category || !validCategories.includes(category)) {
      errors.push({ field: 'category', issue: `Category must be one of: ${validCategories.join(', ')}` });
    }
    if (!summary || typeof summary !== 'string' || summary.trim().length === 0) {
      errors.push({ field: 'summary', issue: 'Project summary is required.' });
    }

    if (errors.length > 0) {
      return Gatekeeper.sendValidationError(res, errors);
    }

    req.sanitizedBody = {
      title: title.trim(),
      category,
      summary: summary.trim(),
      description: description ? description.trim() : summary.trim(),
      tech: Array.isArray(tech) ? tech : ['HTML5', 'CSS Grid', 'JavaScript'],
      iconClass: req.body.iconClass || 'fa-code',
      gradientClass: req.body.gradientClass || 'img-gradient-1',
      githubUrl: req.body.githubUrl || 'https://github.com'
    };

    next();
  }
}

module.exports = Gatekeeper;
