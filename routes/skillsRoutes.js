const express = require('express');
const router = express.Router();
const SkillsController = require('../controllers/skillsController');

// Public Route
router.get('/', SkillsController.getAllSkills);

module.exports = router;
