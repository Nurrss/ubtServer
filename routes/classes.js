const router = require("express").Router();
const _ = require("lodash");

const Classes = require("../models/Classes");
const ApiOptimizer = require("../api");
const errorHandler = require("../middleware/errorHandler");

const clases = new ApiOptimizer(Classes);
const modelName = "Classes";


router.route("/").get(async (req, res) => {
  try {
    await clases.getAll(req, res);
  } catch (err) {
    errorHandler(err, req, res);
  }
});

router.route("/:id").get(async (req, res) => {
  try {
    await clases.getById(req, res, modelName);
    res.status(200).json({ clases });
  } catch (err) {
    errorHandler(err, req, res);
  }
});

router.route("/add").post(async (req, res) => {
  try {
    const { studentsCount, literal, className } = req.body;
    const entity = { studentsCount, literal, className };
    await clases.add({ entity, res });
  } catch (err) {
    errorHandler(err, req, res);
  }
});

router.route("/:id").put(async (req, res) => {
  try {
    const entityId = _.get(req, "params.id");
    const { studentsCount, literal, className } = req.body;
    const fieldsToUpdate = { studentsCount, literal, className };
    await admin.updateById({ entityId, fieldsToUpdate, req, res });
  } catch (err) {
    errorHandler(err, req, res);
  }
});

module.exports = router;
