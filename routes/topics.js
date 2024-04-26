const router = require("express").Router();
const _ = require("lodash");

const Topics = require("../models/Topics");
const Subjects = require("../models/Subjects");
const ApiOptimizer = require("../api");
const errorHandler = require("../middleware/errorHandler");
const checkTeacher = require("../middleware/checkRole");

const topics = new ApiOptimizer(Topics);
const modelName = "Topics";

router.route("/").get(async (req, res) => {
  try {
    await topics.getAll(req, res);
  } catch (err) {
    errorHandler(err, req, res);
  }
});

router.post("/add", async (req, res) => {
  try {
    const { title, subjectId } = req.body;

    if (!subjectId) {
      return res.status(400).json({ message: "Subject ID is required" });
    }

    const subject = await Subjects.findById(subjectId);
    if (!subject) {
      return res.status(404).json({ message: "Subject not found" });
    }

    const newTopic = new Topics({ title });
    const savedTopic = await newTopic.save();

    subject.topics.push(savedTopic._id);
    await subject.save();

    res
      .status(201)
      .json({ message: "Topic added successfully", topic: savedTopic });
  } catch (err) {
    errorHandler(err, req, res);
  }
});

router.route("/:id").delete(async (req, res) => {
  try {
    await topics.deleteById(req, res, modelName);
  } catch (err) {
    errorHandler(err, req, res);
  }
});

router.route("/:id").get(async (req, res) => {
  try {
    await topics.getById(req, res, modelName);
  } catch (err) {
    errorHandler(err, req, res);
  }
});

router.route("/:id").put(async (req, res) => {
  try {
    const entityId = _.get(req, "params.id");
    const { title, subjectId } = req.body;
    const fieldsToUpdate = { title, subject: subjectId };
    await topics.updateById({ entityId, fieldsToUpdate, req, res });
  } catch (err) {
    errorHandler(err, req, res);
  }
});

module.exports = router;
