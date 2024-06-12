const mongoose = require("mongoose");
const Exams = require("../models/Exams");
const Subjects = require("../models/Subjects");
const Questions = require("../models/Questions");
const Results = require("../models/Results");

const submitOrUpdateAnswer = async (req, res) => {
  const {
    examId,
    studentId,
    subjectId,
    questionId,
    optionIds,
    questionNumber,
    language,
  } = req.body;

  if (
    !examId ||
    !studentId ||
    !subjectId ||
    !questionId ||
    !optionIds ||
    !questionNumber ||
    !language
  ) {
    return res.status(400).json({ message: "All fields are required" });
  }

  try {
    const question = await Questions.findById(questionId);
    if (!question) {
      return res.status(404).json({ message: "Question not found" });
    }

    let result = await Results.findOne({ exam: examId, student: studentId });
    if (!result) {
      result = new Results({
        exam: examId,
        student: studentId,
        subjects: [],
        overallScore: 0,
        totalCorrect: 0,
        totalIncorrect: 0,
        overallPercent: "0%",
      });
    }

    let subjectResult = result.subjects.find((sub) => sub.name === subjectId);
    if (!subjectResult) {
      subjectResult = {
        name: subjectId,
        results: [],
        totalPoints: 0,
        totalCorrect: 0,
        totalIncorrect: 0,
        percent: "0%",
      };
      result.subjects.push(subjectResult);
    }

    const answer = subjectResult.results.find(
      (r) => r.questionNumber === questionNumber
    );
    if (answer) {
      answer.optionIds = optionIds;
    } else {
      subjectResult.results.push({ questionNumber, optionIds });
    }

    await result.save();

    res.status(200).json({ message: "Answer received" });
  } catch (error) {
    console.error("Error occurred:", error);
    res.status(400).json({
      message: "Error submitting or updating answer",
      error: error.message,
    });
  }
};

module.exports = { submitOrUpdateAnswer };
