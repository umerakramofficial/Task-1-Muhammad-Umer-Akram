const db = require('../services/db');
const { HTTP_STATUS } = require('../config/constants');

class SkillsController {

  /**
   * Get technical skills capabilities
   * GET /api/skills
   */
  static async getAllSkills(req, res, next) {
    try {
      const skills = await db.getAllSkills();

      return res.status(HTTP_STATUS.OK).json({
        success: true,
        count: skills.length,
        data: skills
      });
    } catch (err) {
      next(err);
    }
  }
}

module.exports = SkillsController;
