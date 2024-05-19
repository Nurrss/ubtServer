const router = require("express").Router();
const _ = require("lodash");

const Options = require("../models/Options");
const ApiOptimizer = require("../api");
const errorHandler = require("../middleware/errorHandler");
const checkTeacher = require("../middleware/checkTeacher");

const options = new ApiOptimizer(Options);
const modelName = "Options";

/**
 * @swagger
 * components:
 *   schemas:
 *     Option:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           description: The ID of the option
 *         text:
 *           type: string
 *           description: The text of the option
 *         isCorrect:
 *           type: boolean
 *           description: Indicates whether the option is correct
 */

/**
 * @swagger
 * /options:
 *   get:
 *     tags: [Options]
 *     summary: Get all options
 *     responses:
 *       200:
 *         description: A list of all options
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Option'
 *
 * /options/add:
 *   post:
 *     tags: [Options]
 *     summary: Add a new option
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               question:
 *                 type: string
 *                 description: The ID of the question associated with the option
 *               text:
 *                 type: string
 *                 description: The text of the option
 *               isCorrect:
 *                 type: boolean
 *                 description: Indicates whether the option is correct
 *     responses:
 *       201:
 *         description: Option added successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: A success message
 *                 option:
 *                   $ref: '#/components/schemas/Option'
 *       400:
 *         description: Bad request
 *
 * /options/{id}:
 *   get:
 *     tags: [Options]
 *     summary: Get an option by ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: The option
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Option'
 *
 *   put:
 *     tags: [Options]
 *     summary: Update an option by ID
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
 *             $ref: '#/components/schemas/Option'
 *     responses:
 *       200:
 *         description: Option updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Option'
 *
 *   delete:
 *     tags: [Options]
 *     summary: Delete an option by ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Option deleted successfully
 */

router.route("/").get(async (req, res) => {
  try {
    await options.getAll(req, res);
  } catch (err) {
    errorHandler(err, req, res);
  }
});

router.route("/:id").delete(async (req, res) => {
  try {
    await options.deleteById(req, res, modelName);
  } catch (err) {
    errorHandler(err, req, res);
  }
});

router.route("/:id").get(async (req, res) => {
  try {
    await options.getById(req, res, modelName);
  } catch (err) {
    errorHandler(err, req, res);
  }
});

router.post("/add", async (req, res) => {
  try {
    const { question, text } = req.body;
    const entity = { question, text };
    await options.add({ entity, res });
  } catch (err) {
    errorHandler(err, req, res);
  }
});

router.route("/:id").put(async (req, res) => {
  try {
    const entityId = _.get(req, "params.id");
    const { question, text } = req.body;
    const fieldsToUpdate = { question, text };
    await options.updateById({ entityId, fieldsToUpdate, req, res });
  } catch (err) {
    errorHandler(err, req, res);
  }
});

module.exports = router;
