const router = require("express").Router();
const _ = require("lodash");

const Admins = require("../models/Admins");
const Users = require("../models/Users");
const Students = require("../models/Students");
const Classes = require("../models/Classes");
const ApiOptimizer = require("../api");
const errorHandler = require("../middleware/errorHandler");

const admin = new ApiOptimizer(Admins);
const modelName = "Admins";

router.route("/").get(async (req, res) => {
  try {
    console.log("here1");
    await admin.getAll(req, res);
  } catch (err) {
    errorHandler(err, req, res);
  }
});

router.route("/:id").delete(async (req, res) => {
  try {
    await admin.deleteById(req, res, modelName);
  } catch (err) {
    errorHandler(err, req, res);
  }
});

router.route("/:id").get(async (req, res) => {
  try {
    await admin.getById(req, res, modelName);
  } catch (err) {
    errorHandler(err, req, res);
  }
});

router.route("/:id").put(async (req, res) => {
  try {
    const entityId = _.get(req, "params.id");
    const { email, password } = req.body;
    const fieldsToUpdate = { email, password };
    await admin.updateById({ entityId, fieldsToUpdate, req, res });
  } catch (err) {
    errorHandler(err, req, res);
  }
});

module.exports = router;
