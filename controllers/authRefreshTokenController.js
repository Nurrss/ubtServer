const jwt = require('jsonwebtoken');

const Users = require('../models/Users');

const handleRefreshToken = async (req, res) => {
    const refreshToken = req.body.refreshToken;
    const user = Users.findOne({refreshToken});
    if (!user) {
        return res.status(401).json({ error: 'Invalid refreshToken' });
    }
    const email = user.email
    const firstName = user.firstName
    const lastName = user.lastName
    const role = user.role

  // Проверяем валидность refreshToken и его срок действия
  try {
    jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
    const accessToken = generateAccessToken(email, firstName, lastName, role)
    res.json({
        accessToken,
        refreshToken,
        success: true,
      });
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      // Если refreshToken истек, генерируем новый refreshToken и accessToken
      const newRefreshToken = generateRefreshToken(email, firstName, lastName, role);
      const newAccessToken = generateAccessToken(email, firstName, lastName, role);

      user.refreshToken = newRefreshToken;
      await user.save();

      return res.json({ 
        accessToken: newAccessToken, 
        refreshToken: newRefreshToken,
        success: true });
    } 

    return res.status(401).json({ error: 'Invalid refreshToken' });
  }
};

function generateAccessToken(email, firstName, lastName, role)
{
  return jwt.sign(
        {
          UserInfo: {
            email,
            firstName,
            role,
            lastName
          },
        },
        process.env.ACCESS_TOKEN_SECRET,
        { expiresIn: '1h' },
      );
}

function generateRefreshToken(email, firstName, lastName, role)
{
    const refreshToken = jwt.sign(
      {
        UserInfo: {
          email,
          firstName,
          role,
          lastName
        },
      },
      process.env.REFRESH_TOKEN_SECRET,
      { expiresIn: '365d' },
      );
      return refreshToken;
}

module.exports = handleRefreshToken;
