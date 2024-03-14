const Users = require("../models/Users");
const router = require("express").Router();

router.get("/", async (req, res) => {
  const { jwt: refreshToken } = req.cookies;

  if (!refreshToken) {
    res.clearCookie("jwt", { httpOnly: true, sameSite: "None", secure: true });
    return res
      .status(204)
      .send({ message: "No JWT found, user is logged out." });
  }

  const filter = { refreshToken };
  const update = { refreshToken: null };
  const updatedUser = await Users.findOneAndUpdate(filter, update, {
    new: true,
  });

  if (!updatedUser) {
    res.clearCookie("jwt", { httpOnly: true, sameSite: "None", secure: true });
    return res
      .status(204)
      .send({ message: "No matching user for JWT, cookie cleared." });
  }

  res.clearCookie("jwt", { httpOnly: true, sameSite: "None", secure: true });
  return res.status(204).json({ message: "User logged out successfully." });
});

module.exports = router;
