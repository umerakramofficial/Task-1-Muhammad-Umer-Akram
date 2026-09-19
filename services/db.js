const mongoose = require('mongoose');
const User = require('../models/User');
const Project = require('../models/Project');
const Contact = require('../models/Contact');
const Skill = require('../models/Skill');

class DatabaseService {
  
  // User Operations
  async findUserByEmail(email) {
    if (!email) return null;
    return await User.findOne({ email: email.toLowerCase() });
  }

  async findUserById(id) {
    if (!id) return null;
    if (mongoose.isValidObjectId(id)) {
      return await User.findById(id);
    }
    return null;
  }

  async createUser(userData) {
    const user = new User(userData);
    await user.save();
    return user.toJSON();
  }

  // Project Operations
  async getAllProjects(category = null) {
    const filter = {};
    if (category && category !== 'all') {
      filter.category = category;
    }
    const projects = await Project.find(filter).sort({ createdAt: -1 });
    return projects.map(p => p.toJSON());
  }

  async getProjectById(id) {
    if (!id) return null;
    const filterConditions = [{ customId: String(id) }];
    if (mongoose.isValidObjectId(id)) {
      filterConditions.push({ _id: id });
    }
    const project = await Project.findOne({ $or: filterConditions });
    return project ? project.toJSON() : null;
  }

  async createProject(projectData) {
    // Generate next numerical customId if not provided
    if (!projectData.customId) {
      const count = await Project.countDocuments();
      projectData.customId = String(count + 1);
    }
    const project = new Project(projectData);
    await project.save();
    return project.toJSON();
  }

  async updateProject(id, updateData) {
    if (!id) return null;
    const filterConditions = [{ customId: String(id) }];
    if (mongoose.isValidObjectId(id)) {
      filterConditions.push({ _id: id });
    }
    
    const updated = await Project.findOneAndUpdate(
      { $or: filterConditions },
      { $set: updateData },
      { new: true, runValidators: true }
    );
    return updated ? updated.toJSON() : null;
  }

  async deleteProject(id) {
    if (!id) return false;
    const filterConditions = [{ customId: String(id) }];
    if (mongoose.isValidObjectId(id)) {
      filterConditions.push({ _id: id });
    }

    const deleted = await Project.findOneAndDelete({ $or: filterConditions });
    return !!deleted;
  }

  // Contact Operations
  async createContact(contactData) {
    const contact = new Contact(contactData);
    await contact.save();
    return contact.toJSON();
  }

  async getAllContacts() {
    const contacts = await Contact.find().sort({ createdAt: -1 });
    return contacts.map(c => c.toJSON());
  }

  // Skill Operations
  async getAllSkills() {
    const skills = await Skill.find().sort({ createdAt: 1 });
    return skills.map(s => s.toJSON());
  }
}

const db = new DatabaseService();
module.exports = db;
