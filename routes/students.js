const router = require("express").Router();
const _ = require("lodash");

const Students = require("../models/Students");
const ApiOptimizer = require("../api");
const errorHandler = require("../middleware/errorHandler");
const getExamController = require("../controllers/examController");

const student = new ApiOptimizer(Students);
const modelName = "Students";

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

router.get("/getexam/:examId", getExamController.getExamQuestionsForStudent);
router.post("/submit", getExamController.submitAndCheckAnswers);
router.get("/result/:studentId", getExamController.getResultByStudentId);

module.exports = router;
