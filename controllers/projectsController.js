const db = require('../services/db');
const { HTTP_STATUS } = require('../config/constants');

class ProjectsController {

  /**
   * Get all projects (supports ?category= filter)
   * GET /api/projects
   */
  static async getAllProjects(req, res, next) {
    try {
      const { category } = req.query;
      const projects = await db.getAllProjects(category);

      return res.status(HTTP_STATUS.OK).json({
        success: true,
        count: projects.length,
        data: projects
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * Get single project by ID
   * GET /api/projects/:id
   */
  static async getProjectById(req, res, next) {
    try {
      const { id } = req.params;
      const project = await db.getProjectById(id);

      if (!project) {
        return res.status(HTTP_STATUS.NOT_FOUND).json({
          success: false,
          error: {
            code: 'PROJECT_NOT_FOUND',
            message: `Project with ID '${id}' was not found.`
          }
        });
      }

      return res.status(HTTP_STATUS.OK).json({
        success: true,
        data: project
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * Create new project [Protected: Admin]
   * POST /api/projects
   */
  static async createProject(req, res, next) {
    try {
      const projectData = req.sanitizedBody;
      if (req.user && req.user.id) {
        projectData.createdBy = req.user.id;
      }
      const newProject = await db.createProject(projectData);

      return res.status(HTTP_STATUS.CREATED).json({
        success: true,
        message: 'Project created successfully.',
        data: newProject
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * Update existing project [Protected: Admin]
   * PUT /api/projects/:id
   */
  static async updateProject(req, res, next) {
    try {
      const { id } = req.params;
      const updateData = req.sanitizedBody;

      const updatedProject = await db.updateProject(id, updateData);
      if (!updatedProject) {
        return res.status(HTTP_STATUS.NOT_FOUND).json({
          success: false,
          error: {
            code: 'PROJECT_NOT_FOUND',
            message: `Project with ID '${id}' was not found.`
          }
        });
      }

      return res.status(HTTP_STATUS.OK).json({
        success: true,
        message: 'Project updated successfully.',
        data: updatedProject
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * Delete project [Protected: Admin]
   * DELETE /api/projects/:id
   */
  static async deleteProject(req, res, next) {
    try {
      const { id } = req.params;
      const deleted = await db.deleteProject(id);

      if (!deleted) {
        return res.status(HTTP_STATUS.NOT_FOUND).json({
          success: false,
          error: {
            code: 'PROJECT_NOT_FOUND',
            message: `Project with ID '${id}' was not found.`
          }
        });
      }

      // 204 No Content has no body
      return res.status(HTTP_STATUS.NO_CONTENT).send();
    } catch (err) {
      next(err);
    }
  }
}

module.exports = ProjectsController;
