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

    // Fetch the result for the student or create a new one
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

    // Fetch all necessary questions and subjects in one go
    const questionIds = answers.map(
      (answer) => new mongoose.Types.ObjectId(answer.questionId)
    );
    const subjectIds = answers.map(
      (answer) => new mongoose.Types.ObjectId(answer.subjectId)
    );

    const [questions, subjects] = await Promise.all([
      Questions.find({ _id: { $in: questionIds } }).select(
        "_id point correctOptions"
      ),
      Subjects.find({ _id: { $in: subjectIds } }).select(
        "ru_subject kz_subject"
      ),
    ]);

    // Create maps for quick lookup
    const questionMap = new Map(questions.map((q) => [q._id.toString(), q]));
    const subjectMap = new Map(subjects.map((s) => [s._id.toString(), s]));

    // Process each answer and prepare the result document
    answers.forEach((answer) => {
      const { subjectId, questionId, optionIds, questionNumber, language } =
        answer;

      const question = questionMap.get(questionId.toString());
      const subject = subjectMap.get(subjectId.toString());

      if (!question || !subject) {
        throw new Error("Question or subject not found");
      }

      const subjectName =
        language === "ru" ? subject.ru_subject : subject.kz_subject;
      let subjectResult = result.subjects.find(
        (sub) => sub.id.toString() === subjectId.toString()
      );

      if (!subjectResult) {
        subjectResult = {
          id: subjectId,
          name: subjectName,
          results: [],
          totalPoints: 0,
          totalCorrect: 0,
          totalIncorrect: 0,
          missedPoints: 0,
          percent: "0%",
        };
        result.subjects.push(subjectResult);
      }

      const existingAnswerIndex = subjectResult.results.findIndex(
        (r) => r.questionNumber === questionNumber
      );
      if (existingAnswerIndex !== -1) {
        subjectResult.results[existingAnswerIndex].optionIds = optionIds.map(
          (id) => new mongoose.Types.ObjectId(id)
        );
        subjectResult.results[existingAnswerIndex].questionId = questionId;
      } else {
        subjectResult.results.push({
          questionNumber,
          optionIds: optionIds.map((id) => new mongoose.Types.ObjectId(id)),
          questionId,
        });
      }
    });

    // Use bulkWrite for efficiency
    const bulkOps = [
      {
        updateOne: {
          filter: { exam: examId, student: studentId },
          update: { $set: result },
          upsert: true,
        },
      },
    ];

    await Results.bulkWrite(bulkOps);

    res.status(200).json({
      message: "Batch answers submitted or updated successfully",
      result: {
        _id: result._id,
        exam: result.exam,
        student: result.student,
        subjects: result.subjects.map((sub) => ({
          id: sub.id,
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
