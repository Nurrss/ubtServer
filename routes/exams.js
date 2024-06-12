const router = require("express").Router();
const _ = require("lodash");

const Exams = require("../models/Exams");
const ApiOptimizer = require("../api");
const errorHandler = require("../middleware/errorHandler");
const checkTeacher = require("../middleware/checkRole");
const handleExam = require("../controllers/examController");
const {
  adminCreatesExamWithAllSubjects,
} = require("../controllers/AdminCreateExam");

const exams = new ApiOptimizer(Exams);
const modelName = "Exams";

/**
 * @swagger
 * components:
 *   schemas:
 *     Subject:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           description: The ID of the subject
 *         name:
 *           type: string
 *           description: The name of the subject
 *     Exam:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           description: The ID of the exam
 *         subjects:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/Subject'
 *           description: The subjects included in the exam
 *         status:
 *           type: string
 *           enum: [active, inactive]
 *           description: The status of the exam
 *         startedAt:
 *           type: string
 *           format: date-time
 *           description: The start date and time of the exam
 *         results:
 *           type: array
 *           items:
 *             type: string
 *           description: The IDs of the results associated with the exam
 *         finishedAt:
 *           type: string
 *           format: date-time
 *           description: The end date and time of the exam
 *         examType:
 *           type: string
 *           enum: [last, random]
 *           description: The type of the exam
 *         amountOfPassed:
 *           type: number
 *           description: The number of participants who passed the exam
 *
 * tags:
 *   - name: Exams
 *     description: Endpoints for managing exams
 *
 * /exams:
 *   get:
 *     tags: [Exams]
 *     summary: Get all exams
 *     responses:
 *       200:
 *         description: A list of all exams
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Exam'
 *
 * /exams/add:
 *   post:
 *     tags: [Exams]
 *     summary: Create an exam with all subjects
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Exam'
 *     responses:
 *       201:
 *         description: Exam created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Exam'
 *       400:
 *         description: Error creating exam
 *
 * /exams/{id}:
 *   get:
 *     tags: [Exams]
 *     summary: Get an exam by ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Exam found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Exam'
 *       404:
 *         description: Exam not found
 *   put:
 *     tags: [Exams]
 *     summary: Update an exam by ID
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
 *             $ref: '#/components/schemas/Exam'
 *     responses:
 *       200:
 *         description: Exam updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Exam'
 *       400:
 *         description: Error updating exam
 *   delete:
 *     tags: [Exams]
 *     summary: Delete an exam by ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Exam deleted successfully
 *       404:
 *         description: Exam not found
 */

router.route("/").get(async (req, res) => {
  try {
    await exams.getAll(req, res);
  } catch (err) {
    errorHandler(err, req, res);
  }
});

router.route("/:id").delete(async (req, res) => {
  try {
    const exam = await Exams.findById(req.params.id);
    if (!exam) {
      return res.status(404).json({ message: "Exam not found" });
    }

    await exam.deleteOne();

    res
      .status(200)
      .json({ message: "Exam and related data deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.route("/:id").get(async (req, res) => {
  try {
    await exams.getById(req, res, modelName);
  } catch (err) {
    errorHandler(err, req, res);
  }
});

router.post("/add", adminCreatesExamWithAllSubjects);

router.route("/:id").put(async (req, res) => {
  try {
    const entityId = _.get(req, "params.id");
    const { started_at, finished_at, examType } = req.body;
    const fieldsToUpdate = {
      startedAt: new Date(started_at + "Z"),
      finishedAt: new Date(finished_at + "Z"),
      examType,
    };
    await exams.updateById({ entityId, fieldsToUpdate, req, res });
  } catch (err) {
    errorHandler(err, req, res);
  }
});

module.exports = router;
