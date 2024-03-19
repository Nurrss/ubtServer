const router = require("express").Router();
const _ = require("lodash");

const Admins = require("../models/Admins");
const ApiOptimizer = require("../api");
const errorHandler = require("../middleware/errorHandler");

const admin = new ApiOptimizer(Admins);
const modelName = "Admins";

/**
 * @swagger
 * /admins:
 *   get:
 *     summary: Returns a list of all admins
 *     tags: [Admins]
 *     responses:
 *       200:
 *         description: A list of admins.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Admin'
 */
router.route("/").get(async (req, res) => {
  try {
    await admin.getAll(req, res);
  } catch (err) {
    errorHandler(err, req, res);
  }
});

/**
 * @swagger
 * /admins/{id}:
 *   delete:
 *     summary: Deletes a single admin by ID
 *     tags: [Admins]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID of the admin to delete
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Admin deleted successfully
 */
router.route("/:id").delete(async (req, res) => {
  try {
    await admin.deleteById(req, res, modelName);
  } catch (err) {
    errorHandler(err, req, res);
  }
});

/**
 * @swagger
 * /admins/{id}:
 *   get:
 *     summary: Gets a single admin by ID
 *     tags: [Admins]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID of the admin to get
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: An admin object.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Admin'
 */
router.route("/:id").get(async (req, res) => {
  try {
    await admin.getById(req, res, modelName);
  } catch (err) {
    errorHandler(err, req, res);
  }
});

/**
 * @swagger
 * /admins/{id}:
 *   put:
 *     summary: Updates an admin by ID
 *     tags: [Admins]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID of the admin to update
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Admin'
 *     responses:
 *       200:
 *         description: Admin updated successfully
 */
router.route("/:id").put(async (req, res) => {
  try {
    const entityId = _.get(req, "params.id");
    const { email, password } = req.body;
    const fieldsToUpdate = { email, password };
    await admin.updateById({ entityId, fieldsToUpdate, req, res });
  } catch (err) {
    errorHandler(err, req, res);
  }
});

module.exports = router;
