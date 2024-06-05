const router = require("express").Router();
const _ = require("lodash");

const Questions = require("../models/Questions");
const Options = require("../models/Options");
const ApiOptimizer = require("../api");
const errorHandler = require("../middleware/errorHandler");
const checkTeacher = require("../middleware/checkRole");
const { createQuestionWithOptions } = require("../controllers/createQuestion");

const questions = new ApiOptimizer(Questions);
const modelName = "Questions";

/**
 * @swagger
 * components:
 *   schemas:
 *     Option:
 *       type: object
 *       required:
 *         - text
 *         - isCorrect
 *       properties:
 *         _id:
 *           type: string
 *           description: The unique identifier for the option.
 *         text:
 *           type: string
 *           description: The text of the option.
 *         isCorrect:
 *           type: boolean
 *           description: Indicates if the option is the correct answer.
 *
 *     Question:
 *       type: object
 *       required:
 *         - question
 *         - options
 *         - point
 *         - type
 *         - language
 *       properties:
 *         _id:
 *           type: string
 *           description: The unique identifier for the question.
 *         question:
 *           type: string
 *           description: The text of the question.
 *         image:
 *           type: string
 *           description: URL of an image associated with the question, if any.
 *         options:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/Option'
 *           description: A list of options for the question.
 *         point:
 *           type: number
 *           description: The number of points the question is worth.
 *         type:
 *           type: string
 *           enum: [twoPoints, onePoint]
 *           description: The type of question based on the scoring system.
 *         correctOptions:
 *           type: array
 *           items:
 *             type: string
 *           description: A list of IDs referencing the correct options.
 *         language:
 *           type: string
 *           enum: [kz, ru]
 *           description: The language of the question.
 *
 * /questions:
 *   get:
 *     tags:
 *       - Questions
 *     summary: Get all questions
 *     responses:
 *       200:
 *         description: A list of questions
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Question'
 *
 * /question/add:
 *   post:
 *     tags:
 *       - Questions
 *     summary: Add a new question
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Question'
 *     responses:
 *       201:
 *         description: Question added successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Question'
 *       400:
 *         description: Bad request, invalid input
 *
 * /questions/{id}:
 *   get:
 *     tags:
 *       - Questions
 *     summary: Get a specific question by ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Question retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Question'
 *       404:
 *         description: Question not found
 *
 *   put:
 *     tags:
 *       - Questions
 *     summary: Update a specific question by ID
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
 *         description: Question updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Question'
 *       400:
 *         description: Bad request, invalid input
 *
 *   delete:
 *     tags:
 *       - Questions
 *     summary: Delete a specific question by ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Question deleted successfully
 *       404:
 *         description: Question not found
 */

router.route("/").get(async (req, res) => {
  try {
    await questions.getAll(req, res);
  } catch (err) {
    errorHandler(err, req, res);
  }
});

router.post("/add", createQuestionWithOptions);

router.route("/:id").delete(async (req, res) => {
  try {
    await questions.deleteById(req, res, modelName);
  } catch (err) {
    errorHandler(err, req, res);
  }
});

router.route("/:id").get(async (req, res) => {
  try {
    await questions.getById(req, res, modelName);
  } catch (err) {
    errorHandler(err, req, res);
  }
});

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
