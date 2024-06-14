const mongoose = require("mongoose");
const Exams = require("../models/Exams");
const Subjects = require("../models/Subjects");
const Questions = require("../models/Questions");
const Results = require("../models/Results");

const submitOrUpdateBatchAnswers = async (req, res) => {
  const { answers } = req.body;

  if (!Array.isArray(answers) || answers.length === 0) {
    return res.status(400).json({ message: "Answers are required" });
  }

  try {
    const { examId, studentId } = answers[0];

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

    for (const answer of answers) {
      const { subjectId, questionId, optionIds, questionNumber, language } =
        answer;

      if (
        !subjectId ||
        !questionId ||
        !optionIds ||
        !questionNumber ||
        !language
      ) {
        return res.status(400).json({ message: "All fields are required" });
      }

      const question = await Questions.findById(questionId);
      if (!question) {
        return res.status(404).json({ message: "Question not found" });
      }

      const subject = await Subjects.findById(subjectId).select(
        language === "ru" ? "ru_subject" : "kz_subject"
      );
      if (!subject) {
        return res.status(404).json({ message: "Subject not found" });
      }
      const subjectName =
        language === "ru" ? subject.ru_subject : subject.kz_subject;

      let subjectResult = result.subjects.find(
        (sub) => sub.name === subjectName
      );

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

      const answerDoc = subjectResult.results.find(
        (r) => r.questionNumber === questionNumber
      );
      if (answerDoc) {
        answerDoc.optionIds = optionIds.map(
          (id) => new mongoose.Types.ObjectId(id)
        );
        answerDoc.questionId = questionId;
      } else {
        subjectResult.results.push({
          questionNumber,
          optionIds: optionIds.map((id) => new mongoose.Types.ObjectId(id)),
          questionId,
        });
      }
    }

    await result.save();

    res.status(200).json({
      message: "Batch answers submitted or updated successfully",
      result: {
        _id: result._id,
        exam: result.exam,
        student: result.student,
        subjects: result.subjects.map((sub) => ({
          name: sub.name,
          results: sub.results.map((res) => ({
            questionNumber: res.questionNumber,
            _id: res._id,
            questionId: res.questionId,
            optionIds: res.optionIds,
          })),
        })),
        createdAt: result.createdAt,
        updatedAt: result.updatedAt,
        __v: result.__v,
      },
    });
  } catch (error) {
    console.error("Error occurred:", error);
    res.status(400).json({
      message: "Error submitting or updating batch answers",
      error: error.message,
    });
  }
};

module.exports = { submitOrUpdateBatchAnswers };
