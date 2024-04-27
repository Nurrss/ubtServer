const router = require("express").Router();
const _ = require("lodash");

const Results = require("../models/Results");
const ApiOptimizer = require("../api");
const errorHandler = require("../middleware/errorHandler");
const checkTeacher = require("../middleware/checkRole");

const results = new ApiOptimizer(Results);
const modelName = "Results";

router.route("/").get(async (req, res) => {
  try {
    await results.getAll(req, res);
  } catch (err) {
    errorHandler(err, req, res);
  }
});

router.route("/:id").delete(async (req, res) => {
  try {
    await results.deleteById(req, res, modelName);
  } catch (err) {
    errorHandler(err, req, res);
  }
});

router.route("/:id").get(async (req, res) => {
  try {
    await results.getById(req, res, modelName);
  } catch (err) {
    errorHandler(err, req, res);
  }
});

router.post("/add", checkTeacher, async (req, res) => {
  try {
    const { exam, student, score } = req.body;
    const entity = { exam, student, score };
    await results.add({ entity, res });
  } catch (err) {
    errorHandler(err, req, res);
  }
});

router.route("/:id").put(async (req, res) => {
  try {
    const entityId = _.get(req, "params.id");
    const { exam, student, score } = req.body;
    const fieldsToUpdate = { exam, student, score };
    await results.updateById({ entityId, fieldsToUpdate, req, res });
  } catch (err) {
    errorHandler(err, req, res);
  }
});

module.exports = router;
