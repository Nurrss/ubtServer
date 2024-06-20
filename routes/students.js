const router = require("express").Router();
const _ = require("lodash");
const bcrypt = require("bcrypt");
const { hashConstance, ROLES } = require("../enums");

const Students = require("../models/Students");
const Users = require("../models/Users");
const ApiOptimizer = require("../api");
const errorHandler = require("../middleware/errorHandler");
const {
  registerStudentsFromUrl,
} = require("../controllers/excelRegisterController");
const { studentStartsExam } = require("../controllers/studentStartsExam");
const { submitOrUpdateBatchAnswers } = require("../controllers/submitAnswer");
const { getResultForStudent } = require("../controllers/GetResultForStudent");
const {
  getAllResultsForStudent,
} = require("../controllers/getAllResultsForStudent");

const student = new ApiOptimizer(Students);
const user = new ApiOptimizer(Users);
const modelName = "Students";

/**
 * @swagger
 * components:
 *   schemas:
 *     Student:
 *       type: object
 *       required:
 *         - user
 *         - class
 *       properties:
 *         user:
 *           type: string
 *           description: The ID of the user associated with the student.
 *         class:
 *           type: string
 *           description: The ID of the class to which the student belongs.
 *         results:
 *           type: array
 *           items:
 *             type: string
 *           description: Array of result IDs associated with the successful exam submissions of the student.
 *         inn:
 *           type: string
 *           description: The Individual Taxpayer Identification Number of the student.
 *
 * paths:
 *   /students:
 *     get:
 *       tags:
 *         - Students
 *       summary: Retrieve a list of all students.
 *       responses:
 *         200:
 *           description: A list of students.
 *           content:
 *             application/json:
 *               schema:
 *                 type: array
 *                 items:
 *                   $ref: '#/components/schemas/Student'
 *     post:
 *       tags:
 *         - Students
 *       summary: Register a new student.
 *       requestBody:
 *         required: true
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Student'
 *       responses:
 *         201:
 *           description: Student registered successfully.
 *           content:
 *             application/json:
 *               schema:
 *                 $ref: '#/components/schemas/Student'
 *
 *   /students/{id}:
 *     get:
 *       tags:
 *         - Students
 *       summary: Fetch a single student by their ID.
 *       parameters:
 *         - in: path
 *           name: id
 *           required: true
 *           schema:
 *             type: string
 *       responses:
 *         200:
 *           description: Detailed information about the student.
 *           content:
 *             application/json:
 *               schema:
 *                 $ref: '#/components/schemas/Student'
 *     put:
 *       tags:
 *         - Students
 *       summary: Update details of an existing student.
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
 *               $ref: '#/components/schemas/Student'
 *       responses:
 *         200:
 *           description: Student updated successfully.
 *     delete:
 *       tags:
 *         - Students
 *       summary: Delete a student by their ID.
 *       parameters:
 *         - in: path
 *           name: id
 *           required: true
 *           schema:
 *             type: string
 *       responses:
 *         200:
 *           description: Student deleted successfully.
 *
 *   /students/excel:
 *     post:
 *       tags:
 *         - Students
 *       summary: Register students from an Excel file.
 *       requestBody:
 *         required: true
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 fileUrl:
 *                   type: string
 *                   description: URL of the Excel file to register students from.
 *       responses:
 *         201:
 *           description: Students registered successfully from Excel.
 *         400:
 *           description: Error occurred during registration.
 *
 *   /students/startExam:
 *     post:
 *       tags:
 *         - Students
 *       summary: Student starts an exam.
 *       requestBody:
 *         required: true
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 examId:
 *                   type: string
 *                   description: The ID of the exam to start.
 *                 selectedSubjectIds:
 *                   type: array
 *                   items:
 *                     type: string
 *                   description: List of subject IDs selected for the exam.
 *                 studentId:
 *                   type: string
 *                   description: The ID of the student starting the exam.
 *       responses:
 *         200:
 *           description: Exam started successfully for the student.
 *         400:
 *           description: Error starting the exam.
 */
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
 *                     isCcorrect:
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
 *
 * paths:
 *   /students/getResult:
 *     post:
 *       tags:
 *         - Students
 *       summary: Retrieve the results for a student for a specific exam
 *       requestBody:
 *         required: true
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 examId:
 *                   type: string
 *                   description: The ID of the exam to retrieve results for
 *                 studentId:
 *                   type: string
 *                   description: The ID of the student to retrieve results for
 *       responses:
 *         200:
 *           description: Detailed information about the student's results
 *           content:
 *             application/json:
 *               schema:
 *                 $ref: '#/components/schemas/Result'
 *         404:
 *           description: Results not found
 *         400:
 *           description: Error retrieving results
 */
/**
 * @swagger
 * paths:
 *   /submitOrUpdateAnswer:
 *     post:
 *       tags:
 *         - Students
 *       summary: Submit or update an answer for a question during an exam
 *       requestBody:
 *         required: true
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               required:
 *                 - examId
 *                 - studentId
 *                 - subjectName
 *                 - questionId
 *                 - optionIds
 *                 - questionNumber
 *                 - language
 *               properties:
 *                 examId:
 *                   type: string
 *                   description: The ID of the exam
 *                 studentId:
 *                   type: string
 *                   description: The ID of the student
 *                 subjectName:
 *                   type: string
 *                   description: The name of the subject
 *                 questionId:
 *                   type: string
 *                   description: The ID of the question to be answered
 *                 optionIds:
 *                   type: array
 *                   items:
 *                     type: string
 *                   description: Array of IDs of selected options
 *                 questionNumber:
 *                   type: integer
 *                   description: The sequential number of the question in the subject
 *                 language:
 *                   type: string
 *                   description: Language of the question (e.g., 'ru', 'kz')
 *       responses:
 *         200:
 *           description: Answer submitted or updated successfully
 *           content:
 *             application/json:
 *               schema:
 *                 type: object
 *                 properties:
 *                   message:
 *                     type: string
 *                     description: Success message
 *                   result:
 *                     $ref: '#/components/schemas/Result'
 *         400:
 *           description: Error in submitting or updating the answer
 *           content:
 *             application/json:
 *               schema:
 *                 type: object
 *                 properties:
 *                   message:
 *                     type: string
 *                     description: Error message
 *                   error:
 *                     type: string
 *                     description: Detailed error message
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
    const student = await Students.findById(req.params.id);
    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    await student.deleteOne(); // Убедитесь, что используется метод deleteOne

    res
      .status(200)
      .json({ message: "Student and related data deleted successfully" });
  } catch (err) {
    errorHandler(err, req, res); // Используйте middleware для обработки ошибок
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
    const hashedPassword = await bcrypt.hash(password, hashConstance);

    const fieldsToUpdate = { inn, password: hashedPassword };
    await user.updateById({ entityId, fieldsToUpdate, req, res });
  } catch (err) {
    errorHandler(err, req, res);
  }
});

// router.post("/getexam/:examId", getExamController.getExamQuestionsForStudent);
router.post("/excel", registerStudentsFromUrl);
router.post("/startExam", studentStartsExam);
router.post("/submitOrUpdateAnswer", submitOrUpdateBatchAnswers);
router.post("/getResult", getResultForStudent);
router.get("/getAllResultsForStudent/:id", getAllResultsForStudent);

module.exports = router;
