const router = require("express").Router();

const handleLogin = require("../controllers/authController");
const handleRefreshToken = require("../controllers/authRefreshTokenController");

/**
 * @swagger
 * tags:
 *   name: Authentication
 *   description: Endpoints for user authentication
 */

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: User login
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 description: The email address of the user
 *               password:
 *                 type: string
 *                 description: The password of the user
 *     responses:
 *       '200':
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 accessToken:
 *                   type: string
 *                   description: The access token for the user session
 *                 refreshToken:
 *                   type: string
 *                   description: The refresh token for the user session
 *                 secondId:
 *                   type: string
 *                   description: The ID of the user's role-specific data
 *       '400':
 *         description: Invalid request body
 *       '403':
 *         description: Incorrect password
 *       '404':
 *         description: User not found
 */
/**
 * @swagger
 * /auth/refreshToken:
 *   post:
 *     summary: Refresh access token
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               refreshToken:
 *                 type: string
 *                 description: The refresh token
 *     responses:
 *       '200':
 *         description: New access token generated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 accessToken:
 *                   type: string
 *                   description: The new access token
 *                 refreshToken:
 *                   type: string
 *                   description: The same refresh token
 *       '401':
 *         description: Invalid refresh token
 *       '500':
 *         description: Internal server error
 */

router.post("/", handleLogin);

router.post("/refreshToken", handleRefreshToken);

module.exports = router;
