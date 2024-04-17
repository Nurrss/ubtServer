const { ROLES } = require("../enums");

/**
 * @DESC Check Role Middleware
 */
const checkRole = (req, res, next) => {
  console.log(req.user);
  const role = req.user.role;
  if (role !== ROLES.ADMIN || role !== ROLES.TEACHER) {
    return res.status(403).json("Forbidden");
  }
  next();
};

module.exports = checkRole;
