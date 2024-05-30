const router = require("express").Router();
const _ = require("lodash");

const Subjects = require("../models/Subjects");
const Topics = require("../models/Topics");
const ApiOptimizer = require("../api");
const errorHandler = require("../middleware/errorHandler");
const checkTeacher = require("../middleware/checkRole");

const subjects = new ApiOptimizer(Subjects);
const modelName = "Subjects";

/**
 * @swagger
 * components:
 *   schemas:
 *     Subject:
 *       type: object
 *       properties:
 *         topics:
 *           type: array
 *           items:
 *             type: string
 *           description: Array of topic IDs associated with the subject
 *         subject:
 *           type: string
 *           description: The name of the subject
 */

/**
 * @swagger
 * /subjects:
 *   get:
 *     tags: [Subjects]
 *     summary: Get all subjects
 *     responses:
 *       200:
 *         description: A list of all subjects
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Subject'
 *
 *   post:
 *     tags: [Subjects]
 *     summary: Create a new subject
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Subject'
 *     responses:
 *       201:
 *         description: Subject created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Subject'
 *
 * /subjects/{id}:
 *   get:
 *     tags: [Subjects]
 *     summary: Get a subject by ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: The subject
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Subject'
 *
 *   put:
 *     tags: [Subjects]
 *     summary: Update a subject by ID
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
 *             $ref: '#/components/schemas/Subject'
 *     responses:
 *       200:
 *         description: Subject updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Subject'
 *
 *   delete:
 *     tags: [Subjects]
 *     summary: Delete a subject by ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Subject deleted successfully
 */

router.route("/").get(async (req, res) => {
  try {
    await subjects.getAll(req, res);
  } catch (err) {
    errorHandler(err, req, res);
  }
});

router.post("/add", async (req, res) => {
  try {
    const { subject } = req.body;
    const entity = { subject };
    await subjects.add({ entity, res });
  } catch (err) {
    errorHandler(err, req, res);
  }
});

router.route("/:id").delete(async (req, res) => {
  try {
    await subjects.deleteById(req, res, modelName);
  } catch (err) {
    errorHandler(err, req, res);
  }
});

router.route("/:id").get(async (req, res) => {
  try {
    const subject = await Subjects.findById(req.params.id).populate({
      path: "topics",
      select: "title",
    });

    if (!subject) {
      res.status(404).send({ message: "Subject not found" });
      return;
    }

    res.json(subject);
  } catch (err) {
    errorHandler(err, req, res);
  }
});

router.route("/:id").put(async (req, res) => {
  try {
    const entityId = _.get(req, "params.id");
    const { subject } = req.body;
    const fieldsToUpdate = { subject };
    await subjects.updateById({ entityId, fieldsToUpdate, req, res });
  } catch (err) {
    errorHandler(err, req, res);
  }
});

module.exports = router;
