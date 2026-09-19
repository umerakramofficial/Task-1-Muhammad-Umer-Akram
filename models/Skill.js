const mongoose = require('mongoose');

const skillSchema = new mongoose.Schema({
  customId: {
    type: String,
    unique: true,
    sparse: true
  },
  title: {
    type: String,
    required: [true, 'Skill title is required.'],
    unique: true,
    trim: true
  },
  icon: {
    type: String,
    required: [true, 'Skill icon class is required.']
  },
  iconColor: {
    type: String,
    required: [true, 'Skill icon color is required.']
  },
  description: {
    type: String,
    required: [true, 'Skill description is required.'],
    trim: true
  },
  badges: {
    type: [String],
    default: []
  }
}, {
  timestamps: true,
  toJSON: {
    transform: (doc, ret) => {
      ret.id = ret.customId || ret._id.toString();
      delete ret._id;
      delete ret.__v;
      return ret;
    }
  }
});

module.exports = mongoose.model('Skill', skillSchema);
