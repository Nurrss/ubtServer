const router = require("express").Router();

const handleNewUser = require("../controllers/registerController");

router.post("/", handleNewUser);

/**
 * @swagger
 * tags:
 *   - name: Auth
 *     description: User registration and authentication
 *
 * /register:
 *   post:
 *     summary: Register a new user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *               - role
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 description: The user's email address.
 *               password:
 *                 type: string
 *                 format: password
 *                 description: The user's password.
 *               role:
 *                 type: string
 *                 enum: [STUDENT, TEACHER, ADMIN]
 *                 description: The user's role in the system.
 *           examples:
 *             newUser:
 *               summary: New user registration example
 *               value:
 *                 email: "newuser@example.com"
 *                 password: "securePassword123"
 *                 role: "STUDENT"
 *     responses:
 *       200:
 *         description: User registered successfully.
 *         content:
 *           application/json:
 *             examples:
 *               successfulRegistration:
 *                 value:
 *                   email: "newuser@example.com"
 *                   role: "STUDENT"
 *       400:
 *         description: Error in user registration (e.g., missing data, email already registered).
 *         content:
 *           application/json:
 *             examples:
 *               emailAlreadyRegistered:
 *                 value:
 *                   message: "Email is already registered."
 *                   success: false
 *               missingData:
 *                 value:
 *                   message: "Email and password are required."
 *                   success: false
 *       500:
 *         description: Server error during registration.
 */

module.exports = router;
