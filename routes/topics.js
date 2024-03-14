const router = require("express").Router();
const _ = require("lodash");

const Topics = require("../models/Topics");
const ApiOptimizer = require("../api");
const errorHandler = require("../middleware/errorHandler");
const checkTeacher = require("../middleware/checkTeacher");

const topics = new ApiOptimizer(Topics);
const modelName = "Topics";

// get all done
router.route("/").get(async (req, res) => {
  try {
    await topics.getAll(req, res);
  } catch (err) {
    errorHandler(err, req, res);
  }
});

// add new results done
router.post("/add", async (req, res) => {
  try {
    const { title, subject } = req.body;
    const entity = { title, subject };
    await topics.add({ entity, res });
  } catch (err) {
    errorHandler(err, req, res);
  }
});

//delete an questions by id done
router.route("/:id").delete(async (req, res) => {
  try {
    await topics.deleteById(req, res, modelName);
  } catch (err) {
    errorHandler(err, req, res);
  }
});

// get by id done
router.route("/:id").get(async (req, res) => {
  try {
    await topics.getById(req, res, modelName);
  } catch (err) {
    errorHandler(err, req, res);
  }
});

// Update questions done
router.route("/:id").put(async (req, res) => {
  try {
    const entityId = _.get(req, "params.id");
    const { title, subject } = req.body;
    const fieldsToUpdate = { title, subject };
    await topics.updateById({ entityId, fieldsToUpdate, req, res });
  } catch (err) {
    errorHandler(err, req, res);
  }
});

module.exports = router;
