const express = require('express');
const router = express.Router();
const ContactsController = require('../controllers/contactsController');
const Gatekeeper = require('../middleware/gatekeeper');
const { contactSubmissionLimiter } = require('../middleware/rateLimiter');
const { authenticateToken, requireRole } = require('../middleware/auth');

// Public Route: Submit Contact Inquiry (Rate-limited + Gatekeeper validation)
router.post(
  '/',
  contactSubmissionLimiter,
  Gatekeeper.validateContactSubmission,
  ContactsController.submitContact
);

// Admin Protected Route: Retrieve all submitted inquiries
router.get(
  '/',
  authenticateToken,
  requireRole('admin'),
  ContactsController.getAllContacts
);

module.exports = router;
