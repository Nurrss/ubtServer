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
 * components:
 *   schemas:
 *     Topic:
 *       type: object
 *       required:
 *         - kz_title
 *         - rus_title
 *       properties:
 *         _id:
 *           type: string
 *           description: The auto-generated ID of the topic
 *         kz_title:
 *           type: string
 *           description: The name of the topic in Kazakh
 *         rus_title:
 *           type: string
 *           description: The name of the topic in Russian
 *         kz_questions:
 *           type: array
 *           items:
 *             type: string
 *             description: IDs of questions in Kazakh associated with the topic
 *         ru_questions:
 *           type: array
 *           items:
 *             type: string
 *             description: IDs of questions in Russian associated with the topic
 *
 * paths:
 *   /topics:
 *     get:
 *       tags:
 *         - Topics
 *       summary: Retrieve all topics
 *       responses:
 *         200:
 *           description: A list of topics
 *           content:
 *             application/json:
 *               schema:
 *                 type: array
 *                 items:
 *                   $ref: '#/components/schemas/Topic'
 *     post:
 *       tags:
 *         - Topics
 *       summary: Add a new topic
 *       requestBody:
 *         required: true
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 kz_title:
 *                   type: string
 *                   description: The Kazakh title of the topic
 *                 rus_title:
 *                   type: string
 *                   description: The Russian title of the topic
 *                 subjectId:
 *                   type: string
 *                   description: ID of the subject the topic belongs to
 *       responses:
 *         201:
 *           description: Topic added successfully
 *           content:
 *             application/json:
 *               schema:
 *                 $ref: '#/components/schemas/Topic'
 *
 *   /topics/{id}:
 *     get:
 *       tags:
 *         - Topics
 *       summary: Retrieve a specific topic by ID
 *       parameters:
 *         - in: path
 *           name: id
 *           required: true
 *           schema:
 *             type: string
 *       responses:
 *         200:
 *           description: Detailed information about the topic
 *           content:
 *             application/json:
 *               schema:
 *                 $ref: '#/components/schemas/Topic'
 *     put:
 *       tags:
 *         - Topics
 *       summary: Update a topic by ID
 *       parameters:
 *         - in: path
 *           name: id
 *           required: true
 *           schema:
 *             type: string
 *       requestBody:
 *         required: true
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 kz_title:
 *                   type: string
 *                   description: Update the Kazakh title of the topic
 *                 rus_title:
 *                   type: string
 *                   description: Update the Russian title of the topic
 *       responses:
 *         200:
 *           description: Topic updated successfully
 *           content:
 *             application/json:
 *               schema:
 *                 $ref: '#/components/schemas/Topic'
 *     delete:
 *       tags:
 *         - Topics
 *       summary: Delete a topic by ID
 *       parameters:
 *         - in: path
 *           name: id
 *           required: true
 *           schema:
 *             type: string
 *       responses:
 *         200:
 *           description: Topic deleted successfully
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
