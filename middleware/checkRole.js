/**
 * @DESC Check Role Middleware
 */
const checkRole = roles => async (req, res, next) => {
  const accessToken = req.header('Authorization');
    if (!accessToken) {
      return res.status(401).json({ message: 'JWT required.' });
    }
    const role = req.user.role
    !roles.includes(role)
    ? res.status(403).json('Sorry you do not have access to this route')
    : next();
};

module.exports = checkRole;
