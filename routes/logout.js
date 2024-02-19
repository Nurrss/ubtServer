const Users = require("../models/Users");

const router = require("express").Router();

router.get("/", async (req, res) => {
  const cookies = req.cookies;
  if (!cookies) return res.sendStatus(204);
  if (!cookies.jwt)
    return res.sendStatus(204).send({ message: "JWT is required" });
  const refreshToken = cookies.jwt;

  const filter = { refreshToken };
  const update = { refreshToken: null };
  const updatedUser = await Users.findOneAndUpdate(filter, update, {
    new: true,
  });
  if (!updatedUser) {
    res.clearCookie("jwt", { httpOnly: true, sameSite: "None", secure: true });
    return res.sendStatus(204);
  }

  await updatedUser.save();

  res.clearCookie("jwt", { httpOnly: true, sameSite: "None", secure: true });
  res.sendStatus(204);
});

module.exports = router;
