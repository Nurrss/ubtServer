const router = require("express").Router();
const _ = require("lodash");

const Exams = require("../models/Exams");
const ApiOptimizer = require("../api");
const errorHandler = require("../middleware/errorHandler");
const checkTeacher = require("../middleware/checkTeacher");
const handleExam = require("../controllers/examController");

const exams = new ApiOptimizer(Exams);
const modelName = "Exams";

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

// add new exams done
router.post("/add", async (req, res) => {
  try {
    const { sudject, status, finished_at, started_at } = req.body;
    const entity = { sudject, status, finished_at, started_at };
    await exams.add({ entity, res });
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
