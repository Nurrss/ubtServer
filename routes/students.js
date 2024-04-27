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
