const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

const Users = require("../models/Users");
const Teachers = require("../models/Teachers");
const Admins = require("../models/Admins");
const Students = require("../models/Students");

const handleLogin = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res
      .status(400)
      .json({ message: "Email and password are required." });
  }

  const foundUser = await Users.findOne({ email: email }).exec();
  console.log(password);
  console.log(foundUser);

  //Unauthorized
  if (!foundUser) {
    return res.status(404).json({
      message: "User email is not found. Invalid login credentials.",
      success: false,
    });
  }

  const isMatch = await bcrypt.compare(password, foundUser.password);
  if (isMatch) {
    const { email, role, _id } = foundUser;
    // create JWTs
    const accessToken = jwt.sign(
      { email: email },
      process.env.ACCESS_TOKEN_SECRET,
      { expiresIn: "1h" }
    );
    const refreshToken = jwt.sign(
      { email: foundUser.email },
      process.env.REFRESH_TOKEN_SECRET,
      { expiresIn: "365d" }
    );

    let secondId;
    let roleSpecificData;
    switch (foundUser.role) {
      case "teacher":
        roleSpecificData = await Teachers.findOne({
          user: foundUser._id,
        }).exec();
        break;
      case "admin":
        roleSpecificData = await Admins.findOne({
          user: foundUser._id,
        }).exec();
        break;
      case "student":
        roleSpecificData = await Students.findOne({
          user: foundUser._id,
        }).exec();
        break;
      // Add cases for other roles if needed
    }
    secondId = roleSpecificData ? roleSpecificData._id : null;

    foundUser.accessToken = accessToken;
    foundUser.refreshToken = refreshToken;

    await foundUser.save();
    // console.log(foundUser);
    res.setHeader("Set-Cookie", `Bearer=${accessToken}`);
    res.setHeader("Access-Control-Allow-Credentials", "true");
    res.status(200).json({
      ...foundUser.toObject(),
      secondId: secondId,
    });
  } else {
    res.status(403).json({
      message: "Incorrect password.",
      success: false,
    });
  }
};

module.exports = handleLogin;
