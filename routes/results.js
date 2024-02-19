const router = require("express").Router();
const _ = require("lodash");

const Results = require("../models/Results");
const ApiOptimizer = require("../api");
const errorHandler = require("../middleware/errorHandler");
const checkTeacher = require("../middleware/checkTeacher");

const results = new ApiOptimizer(Results);
const modelName = "Results";

// get all done
router.route("/").get(async (req, res) => {
  try {
    await results.getAll(req, res);
  } catch (err) {
    errorHandler(err, req, res);
  }
});

//delete an results by id done
router.route("/:id").delete(async (req, res) => {
  try {
    await results.deleteById(req, res, modelName);
  } catch (err) {
    errorHandler(err, req, res);
  }
});

// get by id done
router.route("/:id").get(async (req, res) => {
  try {
    await results.getById(req, res, modelName);
  } catch (err) {
    errorHandler(err, req, res);
  }
});

// add new results done
router.post("/add", checkTeacher, async (req, res) => {
  try {
    const { exam, student } = req.body;
    const entity = { exam, student };
    await results.add({ entity, res });
  } catch (err) {
    errorHandler(err, req, res);
  }
});

// Update results done
router.route("/:id").put(async (req, res) => {
  try {
    const entityId = _.get(req, "params.id");
    const { exam, student } = req.body;
    const fieldsToUpdate = { exam, student };
    await results.updateById({ entityId, fieldsToUpdate, req, res });
  } catch (err) {
    errorHandler(err, req, res);
  }
});

module.exports = router;
