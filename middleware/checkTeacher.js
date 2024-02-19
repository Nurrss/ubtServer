const { ROLES } = require('../enums');

/**
 * @DESC Check Role Middleware
 */
const checkTeacher = (req, res, next) => {
    const role = req.user.role;
    if (role !== ROLES.ADMIN || role !== ROLES.TEACHER) {
        return res.status(403).json('Forbidden');
    }
    next();
  };

  
  module.exports = checkTeacher;
  