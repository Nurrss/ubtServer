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
 *       properties:
 *         _id:
 *           type: string
 *           description: The ID of the option
 *         text:
 *           type: string
 *           description: The text of the option
 *
 *     Question:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           description: The ID of the question
 *         question:
 *           type: string
 *           description: The text of the question
 *         image:
 *           type: string
 *           description: The image URL associated with the question
 *         options:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/Option'
 *           description: The options associated with the question
 *         point:
 *           type: number
 *           description: The point value of the question
 *         type:
 *           type: string
 *           enum: [twoPoints, onePoint]
 *           description: The type of question
 *         correctOptions:
 *           type: array
 *           items:
 *             type: string
 *           description: The IDs of the correct options
 */

/**
 * @swagger
 * /questions:
 *   get:
 *     tags: [Questions]
 *     summary: Get all questions
 *     responses:
 *       200:
 *         description: A list of all questions
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Question'
 *
 * /question/add:
 *   post:
 *     summary: Add a new question
 *     tags: [Questions]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               question:
 *                 type: string
 *                 description: The text of the question
 *               image:
 *                 type: string
 *                 description: The image URL associated with the question
 *               options:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     text:
 *                       type: string
 *                       description: The text of the option
 *                     isCorrect:
 *                       type: boolean
 *                       description: Indicates whether the option is correct
 *                 description: The options associated with the question
 *               point:
 *                 type: number
 *                 description: The point value of the question
 *               type:
 *                 type: string
 *                 enum: [twoPoints, onePoint]
 *                 description: The type of question
 *               correctOptions:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: The IDs of the correct options
 *               topicId:
 *                 type: string
 *                 description: The ID of the topic associated with the question
 *     responses:
 *       201:
 *         description: Question added successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: A success message
 *                 question:
 *                   $ref: '#/components/schemas/Question'
 *       400:
 *         description: Bad request, topic ID is required
 *       404:
 *         description: Topic not found
 *
 * /questions/{id}:
 *   get:
 *     tags: [Questions]
 *     summary: Get a question by ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: The question
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Question'
 *
 *   put:
 *     tags: [Questions]
 *     summary: Update a question by ID
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
 *
 *   delete:
 *     tags: [Questions]
 *     summary: Delete a question by ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Question deleted successfully
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
