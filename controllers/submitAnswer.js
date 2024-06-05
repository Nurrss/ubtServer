const mongoose = require("mongoose");
const Exams = require("../models/Exams");
const Subjects = require("../models/Subjects");
const Questions = require("../models/Questions");
const Results = require("../models/Results");

const submitOrUpdateAnswer = async (req, res) => {
  const {
    examId,
    studentId,
    subjectName,
    questionId,
    optionIds,
    questionNumber,
    language,
  } = req.body;

  try {
    const question = await Questions.findById(questionId).populate(
      "correctOptions"
    );
    if (!question) {
      return res.status(404).json({ message: "Question not found" });
    }

    const subjectField = language === "ru" ? "ru_subject" : "kz_subject";
    const subjectQuery = {};
    subjectQuery[subjectField] = subjectName;

    const subject = await Subjects.findOne(subjectQuery).populate({
      path: "topics",
      populate: {
        path: language === "ru" ? "ru_questions" : "kz_questions",
        populate: {
          path: "options",
        },
      },
    });

    if (!subject) {
      return res.status(404).json({ message: "Subject not found" });
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

    let subjectResult = result.subjects.find((sub) => sub.name === subjectName);
    if (!subjectResult) {
      subjectResult = {
        name: subjectName,
        results: [],
        totalPoints: 0,
        totalCorrect: 0,
        totalIncorrect: 0,
        percent: "0%",
      };
      result.subjects.push(subjectResult);
    }

    const correctOptions = question.correctOptions.map((opt) =>
      opt._id.toString()
    );
    const isCorrect =
      optionIds.every((id) => correctOptions.includes(id)) &&
      optionIds.length === correctOptions.length;

    // Update or add new answer
    const answer = subjectResult.results.find(
      (r) => r.questionNumber === questionNumber
    );
    if (answer) {
      // Update existing answer
      if (answer.isCorrect !== isCorrect) {
        if (isCorrect) {
          subjectResult.totalPoints += question.point;
        } else {
          subjectResult.totalPoints -= question.point;
        }
        answer.isCorrect = isCorrect;
      }
    } else {
      // Add new answer
      subjectResult.results.push({ questionNumber, isCorrect });
      if (isCorrect) {
        subjectResult.totalPoints += question.point;
      }
    }

    // Update counts
    subjectResult.totalCorrect = subjectResult.results.filter(
      (r) => r.isCorrect
    ).length;
    subjectResult.totalIncorrect =
      subjectResult.results.length - subjectResult.totalCorrect;
    subjectResult.percent =
      (
        (subjectResult.totalCorrect / subjectResult.results.length) *
        100
      ).toFixed(2) + "%";

    // Recalculate overall results
    result.overallScore = result.subjects.reduce(
      (sum, sub) => sum + sub.totalPoints,
      0
    );
    result.totalCorrect = result.subjects.reduce(
      (sum, sub) => sum + sub.totalCorrect,
      0
    );
    result.totalIncorrect = result.subjects.reduce(
      (sum, sub) => sum + sub.totalIncorrect,
      0
    );
    result.overallPercent =
      (
        (result.totalCorrect / (result.totalCorrect + result.totalIncorrect)) *
        100
      ).toFixed(2) + "%";

    await result.save();

    res.status(200).json({
      message: "Answer submitted or updated successfully",
      result,
    });
  } catch (error) {
    console.error("Error occurred:", error);
    res.status(400).json({
      message: "Error submitting or updating answer",
      error: error.message,
    });
  }
};

module.exports = { submitOrUpdateAnswer };
