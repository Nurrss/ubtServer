const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

const Users = require('../models/Users');

const handleLogin = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res
      .status(400)
      .json({ message: 'Email and password are required.' });
  }

  const foundUser = await Users.findOne({ email: email }).exec();

  //Unauthorized
  if (!foundUser) {
    return res.status(404).json({
      message: 'User email is not found. Invalid login credentials.',
      success: false,
    });
  }

  const isMatch = await bcrypt.compare(password, foundUser.password);
  if (isMatch) {
    const { email, firstName, lastName, role, _id } = foundUser;
    // create JWTs
    const accessToken = jwt.sign(
      {
        UserInfo: {
          _id,
          email,
          firstName,
          role,
          lastName
        },
      },
      process.env.ACCESS_TOKEN_SECRET,
      { expiresIn: '1h' },
    );
    const refreshToken = jwt.sign(
      { email: foundUser.email },
      process.env.REFRESH_TOKEN_SECRET,
      { expiresIn: '365d' },
    );

    // Saving refreshToken with current user
    foundUser.refreshToken = refreshToken;
    await foundUser.save();
    res.setHeader("Set-Cookie", `Bearer=${accessToken}`);
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.status(200).send({
      accessToken,
      refreshToken,
      success: true,
    });
  } else {
    res.status(403).json({
      message: 'Incorrect password.',
      success: false,
    });
  }
};

module.exports = handleLogin;
