const router = require("express").Router();
const _ = require("lodash");

const Teachers = require("../models/Teachers");
const ApiOptimizer = require("../api");
const errorHandler = require("../middleware/errorHandler");

const teacher = new ApiOptimizer(Teachers);
const modelName = "Teacher";

// get all done
router.route("/").get(async (req, res) => {
  try {
    await teacher.getAll(req, res);
  } catch (err) {
    errorHandler(err, req, res);
  }
});

//delete an teacher by id done
router.route("/:id").delete(async (req, res) => {
  try {
    await teacher.deleteById(req, res, modelName);
  } catch (err) {
    errorHandler(err, req, res);
  }
});

// get by id done
router.route("/:id").get(async (req, res) => {
  try {
    await teacher.getById(req, res, modelName);
  } catch (err) {
    errorHandler(err, req, res);
  }
});

// Update teacher done
router.route("/:id").put(async (req, res) => {
  try {
    const entityId = _.get(req, "params.id");
    const { name, email, password, classes, literal } = req.body;
    const fieldsToUpdate = { name, email, password, classes, literal };
    await teacher.updateById({ entityId, fieldsToUpdate, req, res });
  } catch (err) {
    errorHandler(err, req, res);
  }
});

module.exports = router;
