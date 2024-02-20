const jwt = require("jsonwebtoken");
const Users = require("../models/Users");

const handleRefreshToken = async (req, res) => {
  const refreshToken = req.body.refreshToken;

  try {
    // Await the result of finding the user
    const user = await Users.findOne({ refreshToken });

    if (!user) {
      return res.status(401).json({ error: "Invalid refreshToken" });
    }

    const email = user.email;
    const role = user.role;

    jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);

    const accessToken = generateAccessToken(email, role);

    res.json({
      accessToken,
      refreshToken,
      success: true,
    });
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      // Handle token expiration
      try {
        const newRefreshToken = generateRefreshToken(user.email, user.role);
        const newAccessToken = generateAccessToken(user.email, user.role);

        user.refreshToken = newRefreshToken;
        await user.save();

        return res.json({
          accessToken: newAccessToken,
          refreshToken: newRefreshToken,
          success: true,
        });
      } catch (error) {
        return res.status(500).json({ error: "Internal Server Error" });
      }
    }
    return res.status(401).json({ error: "Invalid refreshToken" });
  }
};

function generateAccessToken(email, role) {
  return jwt.sign(
    {
      UserInfo: {
        email,
        role,
      },
    },
    process.env.ACCESS_TOKEN_SECRET,
    { expiresIn: "1h" }
  );
}

function generateRefreshToken(email, role) {
  return jwt.sign(
    {
      UserInfo: {
        email,
        role,
      },
    },
    process.env.REFRESH_TOKEN_SECRET,
    { expiresIn: "365d" }
  );
}

module.exports = handleRefreshToken;
