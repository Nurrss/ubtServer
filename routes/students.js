const router = require("express").Router();
const _ = require("lodash");

const Students = require("../models/Students");
const ApiOptimizer = require("../api");
const errorHandler = require("../middleware/errorHandler");
const {
  registerStudentsFromUrl,
} = require("../controllers/excelRegisterController");
const { studentStartsExam } = require("../controllers/studentStartsExam");
const { submitOrUpdateAnswer } = require("../controllers/submitAnswer");
const { getResultForStudent } = require("../controllers/GetResultForStudent");

const student = new ApiOptimizer(Students);
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
 *           description: Array of result IDs associated with the student.
 *         inn:
 *           type: string
 *           description: The Individual Taxpayer Identification Number of the student.

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
router.post("/submitOrUpdateAnswer", submitOrUpdateAnswer);
router.post("/getResult", getResultForStudent);

module.exports = router;
