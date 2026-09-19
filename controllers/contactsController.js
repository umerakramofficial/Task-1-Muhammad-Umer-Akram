const db = require('../services/db');
const { HTTP_STATUS } = require('../config/constants');

class ContactsController {

  /**
   * Submit a new contact inquiry form
   * POST /api/contacts
   */
  static async submitContact(req, res, next) {
    try {
      const contactData = req.sanitizedBody;
      const newContact = await db.createContact(contactData);

      return res.status(HTTP_STATUS.CREATED).json({
        success: true,
        message: 'Thank you! Your message has been received successfully.',
        data: {
          id: newContact.id,
          name: newContact.name,
          email: newContact.email,
          subject: newContact.subject,
          createdAt: newContact.createdAt
        }
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * Retrieve all contact submissions [Protected: Admin]
   * GET /api/contacts
   */
  static async getAllContacts(req, res, next) {
    try {
      const contacts = await db.getAllContacts();

      return res.status(HTTP_STATUS.OK).json({
        success: true,
        count: contacts.length,
        data: contacts
      });
    } catch (err) {
      next(err);
    }
  }
}

module.exports = ContactsController;
