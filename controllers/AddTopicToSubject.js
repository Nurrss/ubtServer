const _ = require("lodash");

const Topics = require("../models/Topics");
const Subjects = require("../models/Subjects");
const ApiOptimizer = require("../api");
const errorHandler = require("../middleware/errorHandler");
const checkTeacher = require("../middleware/checkRole");

const topics = new ApiOptimizer(Topics);
const modelName = "Topics";

const AddTopicToSubject = async (req, res) => {
  try {
    const { kz_title, ru_title, subjectId } = req.body;

    if (!subjectId) {
      return res.status(400).json({ message: "Subject ID is required" });
    }

    const newTopic = new Topics({ kz_title, ru_title });
    const savedTopic = await newTopic.save();

    // Update the subject to include the new topic
    await Subjects.findByIdAndUpdate(subjectId, {
      $push: { topics: savedTopic._id },
    });

    res.status(201).json({
      message: "Topic added successfully",
      topic: savedTopic,
    });
  } catch (err) {
    errorHandler(err, req, res);
  }
};

module.exports = { AddTopicToSubject };
