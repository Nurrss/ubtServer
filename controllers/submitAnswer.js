const Results = require("../models/Results");
const Question = require("../models/Questions");
const Subjects = require("../models/Subjects");

const submitAnswer = async (req, res) => {
  const {
    examId,
    studentId,
    subjectName,
    questionId,
    optionIds,
    questionNumber,
  } = req.body;

  try {
    const question = await Question.findById(questionId).populate(
      "correctOptions"
    );
    const subject = await Subjects.findOne({ subject: subjectName }).populate(
      "topics"
    );

    if (!question || !subject) {
      return res.status(404).json({ message: "Question or subject not found" });
    }

    const totalQuestions = subject.topics.reduce(
      (sum, topic) => sum + topic.questions.length,
      0
    );

    const correctOptions = question.correctOptions.map((opt) =>
      opt._id.toString()
    );
    const isCorrect =
      optionIds.every((id) => correctOptions.includes(id)) &&
      optionIds.length === correctOptions.length;

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

    const answerIndex = subjectResult.results.findIndex(
      (r) => r.questionNumber === questionNumber
    );

    if (answerIndex !== -1) {
      // Update points if the answer was previously incorrect but is now correct
      if (!subjectResult.results[answerIndex].isCorrect && isCorrect) {
        subjectResult.totalPoints += question.point;
      }
      // Update the isCorrect value for the question
      subjectResult.results[answerIndex].isCorrect = isCorrect;
    } else {
      // Add a new answer entry
      subjectResult.results.push({ questionNumber, isCorrect });
      if (isCorrect) {
        subjectResult.totalPoints += question.point;
      }
    }

    subjectResult.totalCorrect = subjectResult.results.filter(
      (r) => r.isCorrect
    ).length;
    subjectResult.totalIncorrect = totalQuestions - subjectResult.totalCorrect;
    subjectResult.percent =
      ((subjectResult.totalCorrect / totalQuestions) * 100).toFixed(2) + "%";

    result.overallScore = result.subjects.reduce(
      (total, sub) => total + sub.totalPoints,
      0
    );
    result.totalCorrect = result.subjects.reduce(
      (total, sub) => total + sub.totalCorrect,
      0
    );
    result.totalIncorrect = result.subjects.reduce(
      (total, sub) => total + sub.totalIncorrect,
      0
    );
    result.overallPercent =
      (
        (result.totalCorrect / (result.totalCorrect + result.totalIncorrect)) *
        100
      ).toFixed(2) + "%";

    await result.save();

    res.status(200).json({
      message: "Answer submitted successfully",
      result: result.subjects.map((sub) => ({
        name: sub.name,
        results: sub.results.map((r) => ({
          questionNumber: r.questionNumber,
          isCorrect: r.isCorrect,
        })),
        totalPoints: sub.totalPoints,
        totalCorrect: sub.totalCorrect,
        totalIncorrect: sub.totalIncorrect,
        percent: sub.percent,
      })),
      overallScore: result.overallScore,
      totalCorrect: result.totalCorrect,
      totalIncorrect: result.totalIncorrect,
      overallPercent: result.overallPercent,
    });
  } catch (error) {
    res.status(400).json({ message: "Error submitting answer", error });
  }
};

module.exports = { submitAnswer };
