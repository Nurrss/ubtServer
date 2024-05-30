const router = require("express").Router();
const _ = require("lodash");

const Topics = require("../models/Topics");
const Subjects = require("../models/Subjects");
const ApiOptimizer = require("../api");
const errorHandler = require("../middleware/errorHandler");
const checkTeacher = require("../middleware/checkRole");
const { AddTopicToSubject } = require("../controllers/AddTopicToSubject");

const {
  getTopicsWithQuestionCount,
} = require("../controllers/GetQuestionIdsByPoints");

const topics = new ApiOptimizer(Topics);
const modelName = "Topics";

/**
 * @swagger
 * tags:
 *   name: Topics
 *   description: API endpoints for managing topics
 *
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
 *             $ref: '#/components/schemas/Question'
 *     Question:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           description: The unique identifier for a question
 *         type:
 *           type: string
 *           description: The type of the question
 *
 * /topics:
 *   get:
 *     tags:
 *       - Topics
 *     summary: Retrieve all topics
 *     responses:
 *       200:
 *         description: A list of topics with question counts.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Topic'
 *
 * /topics/add:
 *   post:
 *     tags:
 *       - Topics
 *     summary: Add a new topic
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
 *       201:
 *         description: Topic added successfully.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Topic'
 *       400:
 *         description: Bad request if required fields are missing.
 *       404:
 *         description: Subject not found.
 *
 * /topics/{id}:
 *   get:
 *     tags:
 *       - Topics
 *     summary: Retrieve a topic by ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Specific topic retrieved.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Topic'
 *       404:
 *         description: Topic not found.
 *
 *   put:
 *     tags:
 *       - Topics
 *     summary: Update a topic by ID
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
 *       200:
 *         description: Topic updated successfully.
 *       404:
 *         description: Topic not found.
 *
 *   delete:
 *     tags:
 *       - Topics
 *     summary: Delete a topic by ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Topic deleted successfully.
 *       404:
 *         description: Topic not found.
 */

router.route("/").get(async (req, res) => {
  try {
    const topics = await getTopicsWithQuestionCount(); // Ensure it is called as a function
    res.json(topics);
  } catch (err) {
    errorHandler(err, req, res);
  }
});

router.route("/:id").get(async (req, res) => {
  try {
    const topics = await getTopicsWithQuestionCount();
    const topic = topics.find((t) => t._id.toString() === req.params.id);
    if (!topic) {
      res.status(404).send({ message: "Topic not found" });
      return;
    }
    res.json(topic);
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
