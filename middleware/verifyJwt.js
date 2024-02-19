const jwt = require('jsonwebtoken');

/**
 * @DESC Verify JWT from authorization header Middleware
 */
const verifyJwt = (req, res, next) => {
  try {
    // console.log(req.header('Authorization'), 8)
    // const accessToken = req.header('Authorization');

    // const jwtToken = accessToken.replace('Bearer ', '');
    const jwtToken =req.cookies.Bearer;
    console.log(jwtToken, 15);
    jwt.verify(jwtToken, process.env.ACCESS_TOKEN_SECRET, (error, decoded) => {
      if (error) {
        return res.status(401).json({ message: 'Invalid token.' });
      }
      req.user = decoded.UserInfo;

      next();
    });
  } catch (error) {
    console.error('Error in verifyJwt middleware:', error);
    res.status(500).json('Internal Server Error', error);
  }
};

module.exports = verifyJwt;
