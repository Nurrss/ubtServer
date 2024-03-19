const router = require("express").Router();
const _ = require("lodash");

const Students = require("../models/Students");
const ApiOptimizer = require("../api");
const errorHandler = require("../middleware/errorHandler");
const getExamController = require("../controllers/examController");
const registerExcel = require("../controllers/excelRegisterController");
const {
  registerStudentsFromUrl,
} = require("../controllers/excelRegisterController");

const student = new ApiOptimizer(Students);
const modelName = "Students";

/**
 * @swagger
 * tags:
 *   - name: Students
 *     description: Operations on students.
 *   - name: Exams
 *     description: Exam submission and results.
 *
 * /students/:
 *   get:
 *     summary: Retrieve all students
 *     tags: [Students]
 *     responses:
 *       200:
 *         description: A list of students.
 *       500:
 *         description: Server error
 *
 * /students/add:
 *   post:
 *     summary: Add a new student
 *     tags: [Students]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           example:
 *             name: John
 *             surname: Doe
 *             password: password123
 *             inn: "1234567890"
 *             results: []
 *             classes: "10A"
 *     responses:
 *       200:
 *         description: New student added successfully.
 *       400:
 *         description: Error in adding the student
 *
 * /students/{id}:
 *   get:
 *     summary: Get a student by ID
 *     tags: [Students]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: The ID of the student
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Details of a specific student.
 *       404:
 *         description: Student not found
 *   delete:
 *     summary: Delete a student by ID
 *     tags: [Students]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: The ID of the student to delete
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Student deleted successfully.
 *       404:
 *         description: Student not found
 *   put:
 *     summary: Update a student by ID
 *     tags: [Students]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: The ID of the student to update
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           example:
 *             password: newPassword123
 *             inn: "0987654321"
 *     responses:
 *       200:
 *         description: Student updated successfully.
 *       404:
 *         description: Student not found
 *
 * /exams/submit:
 *   post:
 *     summary: Submit and check exam answers for a student
 *     tags: [Exams]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           example:
 *             resultsId: "resultIdHere"
 *             answers: [{ questionId: "questionIdHere", optionId: "optionIdHere" }]
 *     responses:
 *       200:
 *         description: Exam submitted and checked successfully.
 *       404:
 *         description: Result not found
 *       400:
 *         description: Error submitting and checking exam
 *
 * /students/excel:
 *   post:
 *     summary: Register students from an Excel file URL
 *     tags: [Students]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           example:
 *             fileUrl: "https://example.com/students.xlsx"
 *     responses:
 *       201:
 *         description: Students registered successfully from the Excel file.
 *       500:
 *         description: Error registering students
 */

// get all done
router.route("/").get(async (req, res) => {
  try {
    await student.getAll(req, res);
  } catch (err) {
    errorHandler(err, req, res);
  }
});

//delete an student by id done
router.route("/:id").delete(async (req, res) => {
  try {
    await student.deleteById(req, res, modelName);
  } catch (err) {
    errorHandler(err, req, res);
  }
});

// get by id done
router.route("/:id").get(async (req, res) => {
  try {
    await student.getById(req, res, modelName);
  } catch (err) {
    errorHandler(err, req, res);
  }
});

// add new student
router.route("/add").post(async (req, res) => {
  try {
    const { name, surname, password, inn, results, classes } = req.body;
    const entity = { name, surname, password, inn, results, classes };
    await student.add({ entity, res });
  } catch (err) {
    errorHandler(err, req, res);
  }
});

// Update student
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
router.post("/submit", getExamController.submitAndCheckAnswers);
router.get("/result/:studentId", getExamController.getResultByStudentId);
router.post("/excel", registerStudentsFromUrl);

module.exports = router;
