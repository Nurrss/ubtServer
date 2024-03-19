const router = require("express").Router();

const handleLogin = require("../controllers/authController");
const handleRefreshToken = require("../controllers/authRefreshTokenController");

/**
 * @swagger
 * /auth:
 *   post:
 *     summary: Authenticate a user and retrieve an access and refresh token.
 *     description: Login with email and password to obtain both access and refresh JSON web tokens for user authentication and authorization.
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LoginRequest'
 *           examples:
 *             loginCredentials:
 *               summary: Login credentials
 *               value:
 *                 email: user@example.com
 *                 password: "123456"
 *     responses:
 *       200:
 *         description: Authentication successful. Returns access and refresh tokens.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AuthResponse'
 *             examples:
 *               authSuccess:
 *                 summary: Successful authentication
 *                 value:
 *                   accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiIxMjM0NTY3ODkwIiwicm9sZSI6InVzZXIiLCJpYXQiOjE1MTYyMzkwMjJ9.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c"
 *                   refreshToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiIxMjM0NTY3ODkwIiwicm9sZSI6InVzZXIiLCJpYXQiOjE1MTYyMzkwMjJ9.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5d"
 *                   success: true
 *       400:
 *         description: Bad request, email and password are required.
 *       403:
 *         description: Forbidden, incorrect password.
 *       404:
 *         description: User not found, invalid login credentials.
 */

/**
 * @swagger
 * /auth/refreshToken:
 *   post:
 *     summary: Refresh authentication token
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - refreshToken
 *             properties:
 *               refreshToken:
 *                 type: string
 *                 description: JWT refresh token to be refreshed
 *     responses:
 *       200:
 *         description: Access token refreshed successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AuthResponse'
 *       401:
 *         description: Invalid refreshToken
 *       500:
 *         description: Internal Server Error
 */

router.post("/", handleLogin);

router.post("/refreshToken", handleRefreshToken);

module.exports = router;
