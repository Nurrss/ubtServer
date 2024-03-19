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
 *   - name: User
 *     description: User management and role-based access control.
 *
 * /users/:
 *   get:
 *     summary: Retrieve all users (Admin only)
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: A list of users.
 *       401:
 *         description: JWT required.
 *       403:
 *         description: Access denied.
 *
 * /users/{id}:
 *   get:
 *     summary: Get a user by ID
 *     tags: [User]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: User retrieved successfully.
 *       404:
 *         description: User not found.
 *   delete:
 *     summary: Delete a user by ID
 *     tags: [User]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: User deleted successfully.
 *       404:
 *         description: User not found.
 *   put:
 *     summary: Update a user's role (Admin only)
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               role:
 *                 type: string
 *           examples:
 *             changeRole:
 *               summary: Change user role example
 *               value:
 *                 role: "admin"
 *     responses:
 *       200:
 *         description: User's role updated successfully.
 *       403:
 *         description: Access denied.
 *       404:
 *         description: User not found.
 *
 * components:
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 *
 * security:
 *   - bearerAuth: []
 */

router.route("/").get(checkRole([ROLES.ADMIN]), async (req, res) => {
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

router.put("/:id", checkRole([ROLES.ADMIN]), async (req, res) => {
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
