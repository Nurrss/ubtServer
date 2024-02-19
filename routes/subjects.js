const router = require("express").Router();
const _ = require("lodash");

const Subjects = require("../models/Subjects");
const ApiOptimizer = require("../api");
const errorHandler = require("../middleware/errorHandler");
const checkTeacher = require("../middleware/checkTeacher");

const subjects = new ApiOptimizer(Subjects);
const modelName = "Subjects";

// get all done
router.route("/").get(async (req, res) => {
  try {
    await subjects.getAll(req, res);
  } catch (err) {
    errorHandler(err, req, res);
  }
});

//delete an subjects by id done
router.route("/:id").delete(async (req, res) => {
  try {
    await subjects.deleteById(req, res, modelName);
  } catch (err) {
    errorHandler(err, req, res);
  }
});

// get by id done
router.route("/:id").get(async (req, res) => {
  try {
    await subjects.getById(req, res, modelName);
  } catch (err) {
    errorHandler(err, req, res);
  }
});

// add new subjects done
router.post("/add", checkTeacher, async (req, res) => {
  try {
    const { questions } = req.body;
    const entity = { questions };
    await subjects.add({ entity, res });
  } catch (err) {
    errorHandler(err, req, res);
  }
});

// Update subjects done
router.route("/:id").put(async (req, res) => {
  try {
    const entityId = _.get(req, "params.id");
    const { questions } = req.body;
    const fieldsToUpdate = { questions };
    await subjects.updateById({ entityId, fieldsToUpdate, req, res });
  } catch (err) {
    errorHandler(err, req, res);
  }
});

module.exports = router;
