const mongoose = require("mongoose");
const Exams = require("../models/Exams");
const Subjects = require("../models/Subjects");

const adminCreatesExamWithAllSubjects = async (req, res) => {
  try {
    const { started_at, finished_at } = req.body;

    // Retrieve all subjects with their associated topics and questions
    const allSubjects = await Subjects.find().populate({
      path: "topics",
      populate: {
        path: "ru_questions kz_questions",
        select: "_id",
      },
    });

    const subjectsWithQuestions = allSubjects.map((subject) => {
      const questions = subject.topics.flatMap((topic) => [
        ...topic.ru_questions,
        ...topic.kz_questions,
      ]);
      return {
        _id: subject._id,
        ru_subject: subject.ru_subject,
        kz_subject: subject.kz_subject,
        topics: subject.topics.map((topic) => topic._id),
        questions: questions.map((question) => question._id),
      };
    });

    const newExam = new Exams({
      subjects: subjectsWithQuestions,
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
