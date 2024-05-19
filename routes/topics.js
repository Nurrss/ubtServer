const router = require("express").Router();
const _ = require("lodash");

const Topics = require("../models/Topics");
const Subjects = require("../models/Subjects");
const ApiOptimizer = require("../api");
const errorHandler = require("../middleware/errorHandler");
const checkTeacher = require("../middleware/checkRole");
const { AddTopicToSubject } = require("../controllers/AddTopicToSubject");

const topics = new ApiOptimizer(Topics);
const modelName = "Topics";

/**
 * @swagger
 * tags:
 *   name: Topics
 *   description: Endpoints for managing topics
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Topic:
 *       type: object
 *       required:
 *         - title
 *       properties:
 *         title:
 *           type: string
 *           description: The title of the topic
 *         questions:
 *           type: array
 *           items:
 *             type: string
 *           description: Array of question IDs associated with the topic
 */

/**
 * @swagger
 * /topics:
 *   get:
 *     summary: Retrieve all topics
 *     tags: [Topics]
 *     responses:
 *       '200':
 *         description: A list of topics
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Topic'
 */

/**
 * @swagger
 * /topics/add:
 *   post:
 *     summary: Add a new topic
 *     tags: [Topics]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               subjectId:
 *                 type: string
 *     responses:
 *       '201':
 *         description: Topic added successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Success message
 *                 topic:
 *                   $ref: '#/components/schemas/Topic'
 *       '400':
 *         description: Bad request, subject ID is required
 *       '404':
 *         description: Subject not found
 */

/**
 * @swagger
 * /topics/{id}:
 *   delete:
 *     summary: Delete a topic by ID
 *     tags: [Topics]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       '200':
 *         description: Topic deleted successfully
 *       '404':
 *         description: Topic not found
 */

/**
 * @swagger
 * /topics/{id}:
 *   get:
 *     summary: Retrieve a topic by ID
 *     tags: [Topics]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       '200':
 *         description: Specific topic data
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Topic'
 */
/**
 * @swagger
 * /topics/{id}:
 *   put:
 *     summary: Update a topic by ID
 *     tags: [Topics]
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
 *               title:
 *                 type: string
 *               subjectId:
 *                 type: string
 *     responses:
 *       '200':
 *         description: Topic updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Topic'
 */

router.route("/").get(async (req, res) => {
  try {
    await topics.getAll(req, res);
  } catch (err) {
    errorHandler(err, req, res);
  }
});

router.post("/add", AddTopicToSubject);

router.route("/:id").delete(async (req, res) => {
  try {
    await topics.deleteById(req, res, modelName);
  } catch (err) {
    errorHandler(err, req, res);
  }
});

router.route("/:id").get(async (req, res) => {
  try {
    await topics.getById(req, res, modelName);
  } catch (err) {
    errorHandler(err, req, res);
  }
});

router.route("/:id").put(async (req, res) => {
  try {
    const entityId = _.get(req, "params.id");
    const { title, subjectId } = req.body;
    const fieldsToUpdate = { title, subject: subjectId };
    await topics.updateById({ entityId, fieldsToUpdate, req, res });
  } catch (err) {
    errorHandler(err, req, res);
  }
});

module.exports = router;
