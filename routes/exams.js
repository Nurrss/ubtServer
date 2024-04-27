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

router.route("/").get(async (req, res) => {
  try {
    await exams.getAll(req, res);
  } catch (err) {
    errorHandler(err, req, res);
  }
});

router.route("/:id").delete(async (req, res) => {
  try {
    await exams.deleteById(req, res, modelName);
  } catch (err) {
    errorHandler(err, req, res);
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
