const router = require("express").Router();
const _ = require("lodash");

const Admins = require("../models/Admins");
const ApiOptimizer = require("../api");
const errorHandler = require("../middleware/errorHandler");
const checkTeacher = require("../middleware/checkTeacher");

const admin = new ApiOptimizer(Admins);
const modelName = "Admins";

// get all done
router.route("/").get(async (req, res) => {
  try {
    await admin.getAll(req, res);
  } catch (err) {
    errorHandler(err, req, res);
  }
});

//delete an admin by id done
router.route("/:id").delete(async (req, res) => {
  try {
    await admin.deleteById(req, res, modelName);
  } catch (err) {
    errorHandler(err, req, res);
  }
});

// get by id done
router.route("/:id").get(async (req, res) => {
  try {
    await admin.getById(req, res, modelName);
  } catch (err) {
    errorHandler(err, req, res);
  }
});

// add new admin done
router.post("/add", async (req, res) => {
  try {
    const { inn, password } = req.body;
    const entity = { inn, password };
    await admin.add({ entity, res });
  } catch (err) {
    errorHandler(err, req, res);
  }
});

// Update admin done
router.route("/:id").put(async (req, res) => {
  try {
    const entityId = _.get(req, "params.id");
    const { inn, password } = req.body;
    const fieldsToUpdate = { inn, password };
    await admin.updateById({ entityId, fieldsToUpdate, req, res });
  } catch (err) {
    errorHandler(err, req, res);
  }
});

module.exports = router;
