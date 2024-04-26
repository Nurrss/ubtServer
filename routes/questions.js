const router = require("express").Router();
const _ = require("lodash");

const Questions = require("../models/Questions");
const Options = require("../models/Options");
const ApiOptimizer = require("../api");
const errorHandler = require("../middleware/errorHandler");
const checkTeacher = require("../middleware/checkRole");
const { createQuestionWithOptions } = require("../controllers/createQuestion");

const questions = new ApiOptimizer(Questions);
const modelName = "Questions";

router.route("/").get(async (req, res) => {
  try {
    await questions.getAll(req, res);
  } catch (err) {
    errorHandler(err, req, res);
  }
});

router.post("/add", createQuestionWithOptions);

router.route("/:id").delete(async (req, res) => {
  try {
    await questions.deleteById(req, res, modelName);
  } catch (err) {
    errorHandler(err, req, res);
  }
});

router.route("/:id").get(async (req, res) => {
  try {
    await questions.getById(req, res, modelName);
  } catch (err) {
    errorHandler(err, req, res);
  }
});

router.route("/:id").put(async (req, res) => {
  try {
    const entityId = _.get(req, "params.id");
    const { text, image, option, point, status, type, answer } = req.body;
    const fieldsToUpdate = { text, image, option, point, status, type, answer };
    await questions.updateById({ entityId, fieldsToUpdate, req, res });
  } catch (err) {
    errorHandler(err, req, res);
  }
});

module.exports = router;
