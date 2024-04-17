const router = require("express").Router();
const _ = require("lodash");

const Questions = require("../models/Questions");
const Options = require("../models/Options");
const ApiOptimizer = require("../api");
const errorHandler = require("../middleware/errorHandler");
const checkTeacher = require("../middleware/checkRole");
const handleQuesion = require("../controllers/questionController");

const questions = new ApiOptimizer(Questions);
const modelName = "Questions";

/**
 * @swagger
 * /questions/:
 *   get:
 *     summary: Get all questions
 *     tags: [Questions]
 *     responses:
 *       200:
 *         description: A list of questions.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Question'
 */

/**
 * @swagger
 * /questions/add:
 *   post:
 *     summary: Add a new question with options and associate it with a topic
 *     tags: [Questions]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Question'
 *           examples:
 *             questionWithOptions:
 *               summary: Example of adding a new question with options
 *               value:
 *                 question: "What is the capital of France?"
 *                 image: ""
 *                 options: ["Paris", "Berlin", "Madrid"]
 *                 point: 5
 *                 status: "active"
 *                 type: "multiple-choice"
 *                 answer: "Paris"
 *                 topicId: "5f8d05974b5a46283c89ae80"
 *     responses:
 *       201:
 *         description: Question and options added successfully.
 *       400:
 *         description: Error adding the question and options.
 */

/**
 * @swagger
 * /questions/{id}:
 *   get:
 *     summary: Get a question by ID
 *     tags: [Questions]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Question data retrieved successfully.
 *       404:
 *         description: Question not found.
 */

/**
 * @swagger
 * /questions/{id}:
 *   delete:
 *     summary: Delete a question by ID
 *     tags: [Questions]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Question deleted successfully.
 *       404:
 *         description: Question not found.
 */

/**
 * @swagger
 * /questions/{id}:
 *   put:
 *     summary: Update a question by ID
 *     tags: [Questions]
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
 *             $ref: '#/components/schemas/Question'
 *     responses:
 *       200:
 *         description: Question updated successfully.
 *       404:
 *         description: Question not found.
 */

// get all done
router.route("/").get(async (req, res) => {
  try {
    await questions.getAll(req, res);
  } catch (err) {
    errorHandler(err, req, res);
  }
});

router.post("/add", handleQuesion.createQuestion);

//delete an questions by id done
router.route("/:id").delete(async (req, res) => {
  try {
    await questions.deleteById(req, res, modelName);
  } catch (err) {
    errorHandler(err, req, res);
  }
});

// get by id done
router.route("/:id").get(async (req, res) => {
  try {
    await questions.getById(req, res, modelName);
  } catch (err) {
    errorHandler(err, req, res);
  }
});

// Update questions done
router.route("/:id").put(async (req, res) => {
  try {
    const entityId = _.get(req, "params.id");
    const { text, image, option, point, status, type, answer } = req.body;
    const fieldsToUpdate = { text, image, option, point, status, type, answer };
    await questions.updateById({ entityId, fieldsToUpdate, req, res });
  } catch (err) {
    errorHandler(err, req, res);
  }
});

module.exports = router;
