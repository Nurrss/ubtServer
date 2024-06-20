const mongoose = require("mongoose");
const Exams = require("../models/Exams");
const Results = require("../models/Results");
const Questions = require("../models/Questions");

const getResultForStudent = async (req, res) => {
  const { examId, studentId } = req.body;

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const result = await Results.findOne({ exam: examId, student: studentId });

    if (!result) {
      return res.status(404).json({ message: "Result not found" });
    }

    const exam = await Exams.findById(examId);

    if (!exam) {
      return res.status(404).json({ message: "Exam not found" });
    }

    let overallScore = 0;
    let totalCorrect = 0;
    let totalIncorrect = 0;
    let totalPossiblePoints = 0;

    for (const subject of result.subjects) {
      let totalPoints = 0;
      let correctAnswers = 0;
      let incorrectAnswers = 0;
      let subjectPossiblePoints = 0;

      const examSubject = exam.subjects.find(
        (sub) => sub._id.toString() === subject.id.toString()
      );
      if (!examSubject) {
        return res.status(404).json({ message: "Subject not found in exam" });
      }

      const field = `${result.language}_questions`;
      const questionIds = examSubject[field];

      const questions = await Questions.find({ _id: { $in: questionIds } });
      if (!questions.length) {
        return res.status(404).json({ message: "Questions not found" });
      }

      const answeredQuestionIds = new Set(
        subject.results.map((answer) => answer.questionId.toString())
      );

      // Add unanswered questions to the results
      for (const question of questions) {
        if (!answeredQuestionIds.has(question._id.toString())) {
          subject.results.push({
            questionNumber: question.questionNumber,
            questionId: question._id,
            optionIds: [],
            isCorrect: false,
          });
        }
      }

      // Calculate results
      for (const answer of subject.results) {
        const question = questions.find(
          (q) => q._id.toString() === answer.questionId.toString()
        );

        if (!question) {
          return res.status(404).json({ message: "Question not found" });
        }

        subjectPossiblePoints += question.point;
        totalPossiblePoints += question.point;

        const isCorrect =
          question.correctOptions.length === answer.optionIds.length &&
          question.correctOptions.every((opt) =>
            answer.optionIds.includes(opt.toString())
          );

        answer.isCorrect = isCorrect;

        if (isCorrect) {
          totalPoints += question.point;
          correctAnswers++;
        } else {
          incorrectAnswers++;
        }
      }

      subject.totalPoints = totalPoints;
      subject.totalCorrect = correctAnswers;
      subject.totalIncorrect = incorrectAnswers;
      subject.percent =
        subjectPossiblePoints === 0
          ? "0%"
          : ((totalPoints / subjectPossiblePoints) * 100).toFixed(2) + "%";

      subject.missedPoints = subjectPossiblePoints - totalPoints;

      overallScore += totalPoints;
      totalCorrect += correctAnswers;
      totalIncorrect += incorrectAnswers;
    }

    result.overallScore = overallScore;
    result.totalCorrect = totalCorrect;
    result.totalIncorrect = totalIncorrect;
    result.overallPercent =
      totalPossiblePoints === 0
        ? "0%"
        : ((overallScore / totalPossiblePoints) * 100).toFixed(2) + "%";

    result.missedPoints = totalPossiblePoints - overallScore;

    await result.save();

    await session.commitTransaction();
    session.endSession();

    res.status(200).json({
      message: "Result retrieved and calculated successfully",
      result: {
        _id: result._id,
        exam: result.exam,
        student: result.student,
        subjects: result.subjects.map((subject) => ({
          id: subject.id,
          name: subject.name,
          results: subject.results.map((res) => ({
            questionNumber: res.questionNumber,
            _id: res._id,
            questionId: res.questionId,
            optionIds: res.optionIds,
            isCorrect: res.isCorrect,
          })),
          totalPoints: subject.totalPoints,
          totalCorrect: subject.totalCorrect,
          totalIncorrect: subject.totalIncorrect,
          percent: subject.percent,
          missedPoints: subject.missedPoints,
        })),
        overallScore: result.overallScore,
        missedPoints: result.missedPoints,
        totalCorrect: result.totalCorrect,
        totalIncorrect: result.totalIncorrect,
        overallPercent: result.overallPercent,
        createdAt: result.createdAt,
        updatedAt: result.updatedAt,
        __v: result.__v,
      },
    });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();

    console.error("Error occurred:", error);
    res.status(400).json({
      message: "Error retrieving result",
      error: error.message,
    });
  }
};

module.exports = { getResultForStudent };
