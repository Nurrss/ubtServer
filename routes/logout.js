const Users = require("../models/Users");
const router = require("express").Router();

/**
 * @swagger
 * /logout:
 *   get:
 *     summary: Log out a user
 *     description: Clears the user's refresh token cookie to log them out.
 *     tags: [Auth]
 *     responses:
 *       204:
 *         description: No content, user logged out successfully.
 *         content:
 *           application/json:
 *             examples:
 *               noJwtFound:
 *                 summary: No JWT found in cookies
 *                 value:
 *                   message: "No JWT found, user is logged out."
 *               userLoggedOut:
 *                 summary: User logged out successfully
 *                 value:
 *                   message: "User logged out successfully."
 *               jwtMismatch:
 *                 summary: No matching user for JWT, cookie cleared
 *                 value:
 *                   message: "No matching user for JWT, cookie cleared."
 *     parameters:
 *       - in: cookie
 *         name: jwt
 *         schema:
 *           type: string
 *         required: false
 *         description: Refresh token JWT stored in a cookie.
 */

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
