const router = require("express").Router();
const _ = require("lodash");

const Results = require("../models/Results");
const ApiOptimizer = require("../api");
const errorHandler = require("../middleware/errorHandler");
const checkTeacher = require("../middleware/checkRole");

const results = new ApiOptimizer(Results);
const modelName = "Results";

/**
 * @swagger
 * components:
 *   schemas:
 *     Result:
 *       type: object
 *       properties:
 *         exam:
 *           type: string
 *           description: The ID of the exam
 *         student:
 *           type: string
 *           description: The ID of the student
 *         subjects:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 description: The name of the subject
 *               results:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     questionNumber:
 *                       type: integer
 *                       description: The number of the question
 *                     isCorrect:
 *                       type: boolean
 *                       description: Indicates whether the answer is correct
 *               totalPoints:
 *                 type: number
 *                 description: Total points obtained in the subject
 *               totalCorrect:
 *                 type: number
 *                 description: Total correct answers in the subject
 *               totalIncorrect:
 *                 type: number
 *                 description: Total incorrect answers in the subject
 *               percent:
 *                 type: string
 *                 description: Percentage score in the subject
 *         overallScore:
 *           type: number
 *           description: Overall score obtained in the exam
 *         totalCorrect:
 *           type: number
 *           description: Total correct answers in the exam
 *         totalIncorrect:
 *           type: number
 *           description: Total incorrect answers in the exam
 *         overallPercent:
 *           type: string
 *           description: Overall percentage score in the exam
 */

/**
 * @swagger
 * /results:
 *   get:
 *     tags: [Results]
 *     summary: Get all results
 *     responses:
 *       200:
 *         description: A list of all results
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Result'
 *
 *   post:
 *     tags: [Results]
 *     summary: Create a new result
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Result'
 *     responses:
 *       201:
 *         description: Result created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Result'
 *
 * /results/{id}:
 *   get:
 *     tags: [Results]
 *     summary: Get a result by ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: The result
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Result'
 *
 *   put:
 *     tags: [Results]
 *     summary: Update a result by ID
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
 *             $ref: '#/components/schemas/Result'
 *     responses:
 *       200:
 *         description: Result updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Result'
 *
 *   delete:
 *     tags: [Results]
 *     summary: Delete a result by ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Result deleted successfully
 */

router.route("/").get(async (req, res) => {
  try {
    await results.getAll(req, res);
  } catch (err) {
    errorHandler(err, req, res);
  }
});

router.route("/:id").delete(async (req, res) => {
  try {
    await results.deleteById(req, res, modelName);
  } catch (err) {
    errorHandler(err, req, res);
  }
});

router.route("/:id").get(async (req, res) => {
  try {
    await results.getById(req, res, modelName);
  } catch (err) {
    errorHandler(err, req, res);
  }
});

router.post("/add", async (req, res) => {
  try {
    const { exam, student, score } = req.body;
    const entity = { exam, student, score };
    await results.add({ entity, res });
  } catch (err) {
    errorHandler(err, req, res);
  }
});

router.route("/:id").put(async (req, res) => {
  try {
    const entityId = _.get(req, "params.id");
    const { exam, student, score } = req.body;
    const fieldsToUpdate = { exam, student, score };
    await results.updateById({ entityId, fieldsToUpdate, req, res });
  } catch (err) {
    errorHandler(err, req, res);
  }
});

module.exports = router;
