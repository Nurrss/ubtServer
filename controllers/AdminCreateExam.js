const mongoose = require("mongoose");
const Exams = require("../models/Exams");
const Subjects = require("../models/Subjects");

const adminCreatesExamWithAllSubjects = async (req, res) => {
  try {
    const { started_at, finished_at } = req.body;

    // Retrieve all subjects with their associated topics
    const allSubjects = await Subjects.find();
    console.log(allSubjects);
    const newExam = new Exams({
      subjects: allSubjects,
      startedAt: new Date(started_at),
      finishedAt: new Date(finished_at),
    });

    await newExam.save();

    res.status(201).json({
      message: "Exam with all subjects created successfully",
      exam: newExam,
    });
  } catch (error) {
    res
      .status(400)
      .json({ message: "Error creating exam with all subjects", error });
  }
};

module.exports = { adminCreatesExamWithAllSubjects };
