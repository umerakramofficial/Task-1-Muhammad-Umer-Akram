const mongoose = require('mongoose');

const contactSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Contact name is required.'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Contact email address is required.'],
    lowercase: true,
    trim: true
  },
  subject: {
    type: String,
    required: [true, 'Contact subject is required.'],
    trim: true
  },
  message: {
    type: String,
    required: [true, 'Contact message is required.'],
    trim: true
  }
}, {
  timestamps: true,
  toJSON: {
    transform: (doc, ret) => {
      ret.id = ret._id.toString();
      delete ret._id;
      delete ret.__v;
      return ret;
    }
  }
});

module.exports = mongoose.model('Contact', contactSchema);
