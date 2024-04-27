const mongoose = require("mongoose");
const Exams = require("../models/Exams");
const Subjects = require("../models/Subjects");
const Questions = require("../models/Questions");

const studentStartsExam = async (req, res) => {
  const { examId, selectedSubjectIds } = req.body;

  try {
    const exam = await Exams.findById(examId).populate({
      path: "subjects",
      match: { _id: { $in: selectedSubjectIds } },
      populate: {
        path: "topics",
        populate: {
          path: "questions",
          populate: { path: "options", select: "text" },
        },
      },
    });

    let questionsBySubject = {};

    exam.subjects.forEach((subject) => {
      subject.topics.forEach((topic) => {
        topic.questions.forEach((question) => {
          if (!questionsBySubject[subject.subject]) {
            questionsBySubject[subject.subject] = [];
          }
          questionsBySubject[subject.subject].push({
            _id: question._id,
            question: question.question,
            image: question.image,
            options: question.options.map((option) => ({
              _id: option._id,
              text: option.text,
            })),
            point: question.point,
            type: question.type,
          });
        });
      });
    });

    res.status(200).json({ questionsBySubject });
  } catch (error) {
    res.status(400).json({ message: "Error starting exam", error });
  }
};

module.exports = { studentStartsExam };
