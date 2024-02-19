const router = require("express").Router();

const handleLogin = require("../controllers/authController");
const handleRefreshToken = require("../controllers/authRefreshTokenController");

router.post("/", handleLogin);

router.post("/refreshToken", handleRefreshToken);

module.exports = router;
