const router = require("express").Router();
const _ = require("lodash");

const Users = require("../models/Users");
const ApiOptimizer = require("../api");

const checkRole = require("../middleware/checkRole");
const errorHandler = require("../middleware/errorHandler");
const { ROLES } = require("../enums");

const user = new ApiOptimizer(Users);
const modelName = "User";

router.route("/").get(async (req, res) => {
  try {
    await user.getAll(req, res);
  } catch (err) {
    errorHandler(err, req, res);
  }
});

router.route("/:id").delete(async (req, res) => {
  try {
    await user.deleteById(req, res, modelName);
  } catch (err) {
    errorHandler(err, req, res);
  }
});

router.route("/:id").get(async (req, res) => {
  try {
    await user.getById(req, res, modelName);
  } catch (err) {
    errorHandler(err, req, res);
  }
});

router.put("/:id", async (req, res) => {
  try {
    const entityId = _.get(req, "params.id");
    const { role } = req.body;
    const fieldsToUpdate = { role };

    await user.update({ entityId, fieldsToUpdate, req, res });
  } catch (err) {
    errorHandler(err, req, res);
  }
});

module.exports = router;
