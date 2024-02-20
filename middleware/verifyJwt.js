const jwt = require("jsonwebtoken");

const verifyJwt = (req, res, next) => {
  try {
    const jwtToken = req.cookies.Bearer; // Assuming the JWT is stored in a cookie named "Bearer"

    if (!jwtToken) {
      return res.status(401).json({ message: "Missing token." });
    }

    jwt.verify(jwtToken, process.env.ACCESS_TOKEN_SECRET, (error, decoded) => {
      if (error) {
        console.error("JWT verification error:", error);
        return res.status(401).json({ message: "Invalid token." });
      }

      req.user = decoded.UserInfo;
      next();
    });
  } catch (error) {
    console.error("Error in verifyJwt middleware:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

module.exports = verifyJwt;
