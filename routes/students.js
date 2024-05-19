const router = require("express").Router();
const _ = require("lodash");

const Students = require("../models/Students");
const ApiOptimizer = require("../api");
const errorHandler = require("../middleware/errorHandler");
const {
  registerStudentsFromUrl,
} = require("../controllers/excelRegisterController");
const { studentStartsExam } = require("../controllers/studentStartsExam");
const { submitAnswer } = require("../controllers/submitAnswer");
const { getResultForStudent } = require("../controllers/GetResultForStudent");

const student = new ApiOptimizer(Students);
const modelName = "Students";

/**
 * @swagger
 * components:
 *   schemas:
 *     Student:
 *       type: object
 *       properties:
 *         user:
 *           type: string
 *           description: The ID of the user associated with the student
 *         class:
 *           type: string
 *           description: The ID of the class to which the student belongs
 *         results:
 *           type: array
 *           items:
 *             type: string
 *           description: Array of result IDs associated with the student
 *         inn:
 *           type: string
 *           description: The INN (Individual Taxpayer Identification Number) of the student
 */

/**
 * @swagger
 * /students:
 *   get:
 *     tags: [Students]
 *     summary: Get all students
 *     responses:
 *       200:
 *         description: A list of all students
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Student'
 *
 *   post:
 *     tags: [Students]
 *     summary: Create a new student
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Student'
 *     responses:
 *       201:
 *         description: Student created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Student'
 *
 * /students/{id}:
 *   get:
 *     tags: [Students]
 *     summary: Get a student by ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: The student
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Student'
 *
 *   put:
 *     tags: [Students]
 *     summary: Update a student by ID
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
 *             $ref: '#/components/schemas/Student'
 *     responses:
 *       200:
 *         description: Student updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Student'
 *
 *   delete:
 *     tags: [Students]
 *     summary: Delete a student by ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Student deleted successfully
 *
 * /students/add:
 *   post:
 *     tags: [Students]
 *     summary: Add students from Excel file
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             properties:
 *               fileUrl:
 *                 type: string
 *                 description: URL of the Excel file containing student data
 *     responses:
 *       201:
 *         description: Students registered successfully
 *
 * /students/startExam:
 *   post:
 *     tags: [Students]
 *     summary: Start an exam for a student
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             properties:
 *               examId:
 *                 type: string
 *                 description: The ID of the exam
 *               selectedSubjectIds:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: Array of selected subject IDs
 *               studentId:
 *                 type: string
 *                 description: The ID of the student
 *     responses:
 *       200:
 *         description: Exam started successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 questionsBySubject:
 *                   type: object
 *                   description: Object containing questions grouped by subject
 *                 resultId:
 *                   type: string
 *                   description: The ID of the result created for the student's exam
 *
 * /students/submitAnswer:
 *   post:
 *     tags: [Students]
 *     summary: Submit an answer for a question in an exam
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             properties:
 *               examId:
 *                 type: string
 *                 description: The ID of the exam
 *               studentId:
 *                 type: string
 *                 description: The ID of the student
 *               subjectName:
 *                 type: string
 *                 description: The name of the subject
 *               questionId:
 *                 type: string
 *                 description: The ID of the question
 *               optionIds:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: Array of selected option IDs
 *               questionNumber:
 *                 type: integer
 *                 description: The number of the question
 *     responses:
 *       200:
 *         description: Answer submitted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Success message
 *                 result:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       name:
 *                         type: string
 *                         description: The name of the subject
 *                       results:
 *                         type: array
 *                         items:
 *                           type: object
 *                           properties:
 *                             questionNumber:
 *                               type: integer
 *                               description: The number of the question
 *                             isCorrect:
 *                               type: boolean
 *                               description: Indicates whether the answer is correct
 *                       totalPoints:
 *                         type: integer
 *                         description: Total points obtained in the subject
 *                       totalCorrect:
 *                         type: integer
 *                         description: Total correct answers in the subject
 *                       totalIncorrect:
 *                         type: integer
 *                         description: Total incorrect answers in the subject
 *                       percent:
 *                         type: string
 *                         description: Percentage score in the subject
 *                 overallScore:
 *                   type: integer
 *                   description: Overall score obtained in the exam
 *                 totalCorrect:
 *                   type: integer
 *                   description: Total correct answers in the exam
 *                 totalIncorrect:
 *                   type: integer
 *                   description: Total incorrect answers in the exam
 *                 overallPercent:
 *                   type: string
 *                   description: Overall percentage score in the exam
 *
 * /students/getResult:
 *   post:
 *     tags: [Students]
 *     summary: Get result for a student
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             properties:
 *               examId:
 *                 type: string
 *                 description: The ID of the exam
 *               studentId:
 *                 type: string
 *                 description: The ID of the student
 *     responses:
 *       200:
 *         description: Result retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Result'
 */

router.route("/").get(async (req, res) => {
  try {
    await student.getAll(req, res);
  } catch (err) {
    errorHandler(err, req, res);
  }
});

router.route("/:id").delete(async (req, res) => {
  try {
    await student.deleteById(req, res, modelName);
  } catch (err) {
    errorHandler(err, req, res);
  }
});

router.route("/:id").get(async (req, res) => {
  try {
    await student.getById(req, res, modelName);
  } catch (err) {
    errorHandler(err, req, res);
  }
});

router.route("/add").post(async (req, res) => {
  try {
    const { name, surname, password, inn, results, classes } = req.body;
    const entity = { name, surname, password, inn, results, classes };
    await student.add({ entity, res });
  } catch (err) {
    errorHandler(err, req, res);
  }
});

router.route("/:id").put(async (req, res) => {
  try {
    const entityId = _.get(req, "params.id");
    const { password, inn } = req.body;
    const fieldsToUpdate = { inn, password };
    await student.updateById({ entityId, fieldsToUpdate, req, res });
  } catch (err) {
    errorHandler(err, req, res);
  }
});

// router.post("/getexam/:examId", getExamController.getExamQuestionsForStudent);
router.post("/excel", registerStudentsFromUrl);
router.post("/startExam", studentStartsExam);
router.post("/submitAnswer", submitAnswer);
router.post("/getResult", getResultForStudent);

module.exports = router;
