const router = require("express").Router();
const _ = require("lodash");

const Exams = require("../models/Exams");
const ApiOptimizer = require("../api");
const errorHandler = require("../middleware/errorHandler");
const checkTeacher = require("../middleware/checkTeacher");
const handleExam = require("../controllers/examController");

const exams = new ApiOptimizer(Exams);
const modelName = "Exams";

/**
 * @swagger
 * /exams/:
 *   get:
 *     summary: Retrieve all exams
 *     tags: [Exams]
 *     responses:
 *       200:
 *         description: A list of exams.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Exam'
 *       500:
 *         description: Error fetching exams.
 */

/**
 * @swagger
 * /exams/{id}:
 *   get:
 *     summary: Retrieve an exam by its ID
 *     tags: [Exams]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: An exam object.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Exam'
 *       404:
 *         description: Exam not found.
 */

/**
 * @swagger
 * /exams/{id}:
 *   delete:
 *     summary: Delete an exam by its ID
 *     tags: [Exams]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Exam deleted successfully.
 *       404:
 *         description: Exam not found.
 */

/**
 * @swagger
 * /exams/add:
 *   post:
 *     summary: Create a new exam
 *     tags: [Exams]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Exam'
 *     responses:
 *       201:
 *         description: Exam created successfully.
 *       400:
 *         description: Error creating the exam.
 */

/**
 * @swagger
 * /exams/{id}:
 *   put:
 *     summary: Update an exam
 *     tags: [Exams]
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
 *         description: Exam updated successfully.
 *       404:
 *         description: Exam not found.
 */

/**
 * @swagger
 * /exams/newResult:
 *   post:
 *     summary: Assign an exam to a student
 *     tags: [Exams]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/NewResult'
 *           examples:
 *             assignExam:
 *               summary: Assign an exam to a student example
 *               value:
 *                 examId: "5f8d04034b5a461a3c89ae7c"
 *                 studentId: "5f8d04434b5a46283c89ae7d"
 *     responses:
 *       201:
 *         description: Exam assigned to student successfully.
 *         content:
 *           application/json:
 *             examples:
 *               successResponse:
 *                 summary: Successful response example
 *                 value:
 *                   message: "Exam assigned to student successfully"
 *                   newResult:
 *                     exam: "5f8d04034b5a461a3c89ae7c"
 *                     student: "5f8d04434b5a46283c89ae7d"
 *                     score: 0
 *       400:
 *         description: Error assigning exam to student.
 */

/**
 * @swagger
 * /exams/addTopic:
 *   post:
 *     summary: Add topics to an exam
 *     tags: [Exams]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/NewTopic'
 *           examples:
 *             addTopicExample:
 *               summary: Add topics to an exam example
 *               value:
 *                 examId: "5f8d04034b5a461a3c89ae7c"
 *                 topicIds: ["5f8d05734b5a46283c89ae7f", "5f8d05974b5a46283c89ae80"]
 *     responses:
 *       200:
 *         description: Topics added to exam successfully.
 *         content:
 *           application/json:
 *             examples:
 *               successResponse:
 *                 summary: Successful response example
 *                 value:
 *                   message: "Topics added to exam successfully"
 *                   exam:
 *                     _id: "5f8d04034b5a461a3c89ae7c"
 *                     topics: ["5f8d05734b5a46283c89ae7f", "5f8d05974b5a46283c89ae80"]
 *       404:
 *         description: Exam not found.
 *       400:
 *         description: Error adding topics to exam.
 */

// get all done
router.route("/").get(async (req, res) => {
  try {
    await exams.getAll(req, res);
  } catch (err) {
    errorHandler(err, req, res);
  }
});

//delete an exams by id done
router.route("/:id").delete(async (req, res) => {
  try {
    await exams.deleteById(req, res, modelName);
  } catch (err) {
    errorHandler(err, req, res);
  }
});

// get by id done
router.route("/:id").get(async (req, res) => {
  try {
    await exams.getById(req, res, modelName);
  } catch (err) {
    errorHandler(err, req, res);
  }
});

router.post("/add", async (req, res) => {
  try {
    const { started_at, finished_at } = req.body;
    const startedAt = new Date(started_at + "Z");
    const finishedAt = new Date(finished_at + "Z");

    const newExam = new Exams({
      startedAt,
      finishedAt,
      topics: [],
    });

    await newExam.save();

    res.status(201).send(newExam);
  } catch (err) {
    errorHandler(err, req, res);
  }
});

// Update exams done
router.route("/:id").put(async (req, res) => {
  try {
    const entityId = _.get(req, "params.id");
    const { sudject, status, finished_at, started_at } = req.body;
    const fieldsToUpdate = { sudject, status, finished_at, started_at };
    await exams.updateById({ entityId, fieldsToUpdate, req, res });
  } catch (err) {
    errorHandler(err, req, res);
  }
});

router.post("/newResult", handleExam.assignExamToStudent);

router.post("/addTopic", handleExam.addTopicsToExam);

module.exports = router;
