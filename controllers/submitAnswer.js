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

    const subject = await Subjects.findById(subjectId).select(
      language === "ru" ? "ru_subject" : "kz_subject"
    );
    if (!subject) {
      return res.status(404).json({ message: "Subject not found" });
    }
    const subjectName =
      language === "ru" ? subject.ru_subject : subject.kz_subject;

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

    const answer = subjectResult.results.find(
      (r) => r.questionNumber === questionNumber
    );
    if (answer) {
      answer.optionIds = optionIds.map((id) => new mongoose.Types.ObjectId(id));
      answer.questionId = questionId;
      // Ensure the questionId is updated
    } else {
      subjectResult.results.push({
        questionNumber,
        optionIds: optionIds.map((id) => new mongoose.Types.ObjectId(id)),
        questionId,
      });
    }

    await result.save();

    res.status(200).json({
      message: "Answer submitted or updated successfully",
      result: {
        _id: result._id,
        exam: result.exam,
        student: result.student,
        subjects: result.subjects.map((sub) => ({
          name: sub.name,
          results: sub.results.map((res) => ({
            questionNumber: res.questionNumber,
            _id: res._id,
            questionId: res.questionId, // Include questionId in response
            optionIds: res.optionIds, // Include optionIds in response
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
      message: "Error submitting or updating answer",
      error: error.message,
    });
  }
};

module.exports = { submitOrUpdateAnswer };
