const router = require("express").Router();
const _ = require("lodash");

const Options = require("../models/Options");
const ApiOptimizer = require("../api");
const errorHandler = require("../middleware/errorHandler");
const checkTeacher = require("../middleware/checkTeacher");

const options = new ApiOptimizer(Options);
const modelName = "Options";

// get all done
router.route("/").get(async (req, res) => {
  try {
    await options.getAll(req, res);
  } catch (err) {
    errorHandler(err, req, res);
  }
});

//delete an options by id done
router.route("/:id").delete(async (req, res) => {
  try {
    await options.deleteById(req, res, modelName);
  } catch (err) {
    errorHandler(err, req, res);
  }
});

// get by id done
router.route("/:id").get(async (req, res) => {
  try {
    await options.getById(req, res, modelName);
  } catch (err) {
    errorHandler(err, req, res);
  }
});

// add new options done
router.post("/add", checkTeacher, async (req, res) => {
  try {
    const { question, text } = req.body;
    const entity = { question, text };
    await options.add({ entity, res });
  } catch (err) {
    errorHandler(err, req, res);
  }
});

// Update options done
router.route("/:id").put(async (req, res) => {
  try {
    const entityId = _.get(req, "params.id");
    const { question, text } = req.body;
    const fieldsToUpdate = { question, text };
    await options.updateById({ entityId, fieldsToUpdate, req, res });
  } catch (err) {
    errorHandler(err, req, res);
  }
});

module.exports = router;
