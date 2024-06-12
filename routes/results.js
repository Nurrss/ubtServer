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
 *           description: The ID of the exam associated with the results.
 *         student:
 *           type: string
 *           description: The ID of the student who took the exam.
 *         subjects:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 description: Name of the subject.
 *               results:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     questionNumber:
 *                       type: number
 *                       description: The sequential number of the question.
 *                     isCorrect:
 *                       type: boolean
 *                       description: Whether the answer was correct.
 *               totalPoints:
 *                 type: number
 *                 description: Total points gained in the subject.
 *               totalCorrect:
 *                 type: number
 *                 description: Count of correctly answered questions.
 *               totalIncorrect:
 *                 type: number
 *                 description: Count of incorrectly answered questions.
 *               percent:
 *                 type: string
 *                 description: Percentage of correct answers.
 *         overallScore:
 *           type: number
 *           description: Total score obtained in the exam.
 *         totalCorrect:
 *           type: number
 *           description: Total number of correct answers across all subjects.
 *         totalIncorrect:
 *           type: number
 *           description: Total number of incorrect answers across all subjects.
 *         overallPercent:
 *           type: string
 *           description: Overall percentage score for the entire exam.
 *
 * /results:
 *   get:
 *     tags: [Results]
 *     summary: Retrieves a list of all results.
 *     responses:
 *       200:
 *         description: A list of results.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Result'
 *   post:
 *     tags: [Results]
 *     summary: Creates a new result entry.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Result'
 *     responses:
 *       201:
 *         description: Successfully created a new result.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Result'
 *
 * /results/{id}:
 *   get:
 *     tags: [Results]
 *     summary: Retrieves a result by ID.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Detail of a specific result.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Result'
 *       404:
 *         description: Result not found.
 *   put:
 *     tags: [Results]
 *     summary: Updates an existing result.
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
 *         description: Result updated successfully.
 *       404:
 *         description: Result not found.
 *   delete:
 *     tags: [Results]
 *     summary: Deletes a result by ID.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Result deleted successfully.
 *       404:
 *         description: Result not found.
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
    const result = await Results.findById(req.params.id);
    if (!result) {
      return res.status(404).json({ message: "Result not found" });
    }

    await result.remove();

    res
      .status(200)
      .json({ message: "Result and related references deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
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
