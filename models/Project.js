const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema({
  customId: {
    type: String,
    unique: true,
    sparse: true
  },
  title: {
    type: String,
    required: [true, 'Project title is required.'],
    trim: true
  },
  category: {
    type: String,
    required: [true, 'Project category is required.'],
    enum: ['frontend', 'fullstack', 'ui']
  },
  summary: {
    type: String,
    required: [true, 'Project summary is required.'],
    trim: true
  },
  description: {
    type: String,
    required: [true, 'Project description is required.'],
    trim: true
  },
  tech: {
    type: [String],
    required: [true, 'Tech stack array is required.']
  },
  iconClass: {
    type: String,
    default: 'fa-code'
  },
  gradientClass: {
    type: String,
    default: 'img-gradient-1'
  },
  githubUrl: {
    type: String,
    default: 'https://github.com'
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
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

module.exports = mongoose.model('Project', projectSchema);
