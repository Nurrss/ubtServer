const router = require("express").Router();
const _ = require("lodash");

const Users = require("../models/Users");
const ApiOptimizer = require("../api");

const checkRole = require("../middleware/checkRole");
const errorHandler = require("../middleware/errorHandler");
const { ROLES } = require("../enums");

const user = new ApiOptimizer(Users);
const modelName = "User";

/**
 * @swagger
 * tags:
 *   name: Users
 *   description: Endpoints for managing users
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     User:
 *       type: object
 *       required:
 *         - email
 *         - password
 *         - role
 *       properties:
 *         email:
 *           type: string
 *           format: email
 *           description: "The email address of the user"
 *         password:
 *           type: string
 *           minLength: 6
 *           description: "The password of the user"
 *         name:
 *           type: string
 *           description: "The name of the user"
 *         surname:
 *           type: string
 *           description: "The surname of the user"
 *         refreshToken:
 *           type: string
 *           description: "The refresh token of the user"
 *         accessToken:
 *           type: string
 *           description: "The access token of the user"
 *         role:
 *           type: string
 *           enum: ["admin", "student", "users"]
 *           description: "The role of the user"
 */

/**
 * @swagger
 * /users:
 *   get:
 *     summary: Retrieve all users
 *     tags: [Users]
 *     responses:
 *       '200':
 *         description: A list of users
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/User'
 *   post:
 *     summary: Create a new users
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/User'
 *     responses:
 *       '200':
 *         description: New users created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 */

/**
 * @swagger
 * /users/{id}:
 *   get:
 *     summary: Retrieve a specific users by ID
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID of the users to retrieve
 *         schema:
 *           type: string
 *     responses:
 *       '200':
 *         description: users data
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *   put:
 *     summary: Update a users by ID
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID of the users to update
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/User'
 *     responses:
 *       '200':
 *         description: users updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *   delete:
 *     summary: Delete a users by ID
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID of the users to delete
 *         schema:
 *           type: string
 *     responses:
 *       '200':
 *         description: users deleted successfully
 */

router.route("/").get(async (req, res) => {
  try {
    await user.getAll(req, res);
  } catch (err) {
    errorHandler(err, req, res);
  }
});

router.route("/:id").delete(async (req, res) => {
  try {
    await user.deleteById(req, res, modelName);
  } catch (err) {
    errorHandler(err, req, res);
  }
});

router.route("/:id").get(async (req, res) => {
  try {
    await user.getById(req, res, modelName);
  } catch (err) {
    errorHandler(err, req, res);
  }
});

router.put("/:id", async (req, res) => {
  try {
    const entityId = _.get(req, "params.id");
    const { role } = req.body;
    const fieldsToUpdate = { role };

    await user.update({ entityId, fieldsToUpdate, req, res });
  } catch (err) {
    errorHandler(err, req, res);
  }
});

module.exports = router;
