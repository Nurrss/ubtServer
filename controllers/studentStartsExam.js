const mongoose = require("mongoose");
const Exams = require("../models/Exams");
const Subjects = require("../models/Subjects");
const Questions = require("../models/Questions");
const Students = require("../models/Students");
const Results = require("../models/Results");

const studentStartsExam = async (req, res) => {
  const { examId, selectedSubjectIds, studentId } = req.body;

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

    if (!exam) {
      return res.status(404).json({ message: "Exam not found" });
    }

    let questionsBySubject = {};
    exam.subjects.forEach((subject) => {
      let questionCounter = 1; // Initialize a counter for numbering questions
      questionsBySubject[subject.subject] = subject.topics.flatMap((topic) =>
        topic.questions.map((question) => {
          const formattedQuestion = {
            _id: question._id,
            questionNumber: questionCounter++, // Increment the counter for each question
            question: question.question,
            image: question.image,
            options: question.options.map((option) => ({
              _id: option._id,
              text: option.text,
            })),
            point: question.point,
            type: question.type,
          };
          return formattedQuestion;
        })
      );
    });

    // Save the initial state of the student's exam
    const result = new Results({
      exam: examId,
      student: studentId,
      subjects: Object.keys(questionsBySubject).map((subjectName) => ({
        name: subjectName,
        results: [],
        totalPoints: 0,
        totalCorrect: 0,
        totalIncorrect: 0,
        percent: "0%",
      })),
      overallScore: 0,
      totalCorrect: 0,
      totalIncorrect: 0,
      overallPercent: "0%",
    });

    await result.save();

    res.status(200).json({ questionsBySubject, resultId: result._id });
  } catch (error) {
    console.error(error);
    res.status(400).json({ message: "Error starting exam", error });
  }
};

module.exports = { studentStartsExam };
