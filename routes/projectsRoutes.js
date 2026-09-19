const express = require('express');
const router = express.Router();
const ProjectsController = require('../controllers/projectsController');
const Gatekeeper = require('../middleware/gatekeeper');
const { authenticateToken, requireRole } = require('../middleware/auth');

// Public Routes
router.get('/', ProjectsController.getAllProjects);
router.get('/:id', ProjectsController.getProjectById);

// Admin Protected Routes (AuthN + AuthZ)
router.post(
  '/',
  authenticateToken,
  requireRole('admin'),
  Gatekeeper.validateProject,
  ProjectsController.createProject
);

router.put(
  '/:id',
  authenticateToken,
  requireRole('admin'),
  Gatekeeper.validateProject,
  ProjectsController.updateProject
);

router.delete(
  '/:id',
  authenticateToken,
  requireRole('admin'),
  ProjectsController.deleteProject
);

module.exports = router;
