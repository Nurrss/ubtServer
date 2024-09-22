const mongoose = require("mongoose");
const Exams = require("../models/Exams");
const Results = require("../models/Results");
const Questions = require("../models/Questions");
const Students = require("../models/Students");

const getResultForStudent = async (req, res) => {
  const { examId, studentId } = req.body;

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const result = await Results.findOne({
      exam: examId,
      student: studentId,
    })
      .populate({
        path: "student",
        populate: {
          path: "user",
          select: "name surname",
        },
      })
      .session(session);

    if (!result) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({ message: "Result not found" });
    }

    const exam = await Exams.findById(examId).session(session);

    if (!exam) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({ message: "Exam not found" });
    }

    let overallScore = 0;
    let totalCorrect = 0;
    let totalIncorrect = 0;
    let totalPossiblePoints = 0;

    const subjectIds = result.subjects.map((sub) => sub.id.toString());
    const examSubjects = exam.subjects.filter((sub) =>
      subjectIds.includes(sub._id.toString())
    );

    if (examSubjects.length !== subjectIds.length) {
      await session.abortTransaction();
      session.endSession();
      return res
        .status(404)
        .json({ message: "Some subjects not found in exam" });
    }

    const questionIds = examSubjects.flatMap(
      (sub) => sub[`${result.language}_questions`]
    );
    const questions = await Questions.find({
      _id: { $in: questionIds },
    }).session(session);

    const questionMap = new Map(questions.map((q) => [q._id.toString(), q]));

    for (const subject of result.subjects) {
      let totalPoints = 0;
      let correctAnswers = 0;
      let incorrectAnswers = 0;
      let subjectPossiblePoints = 0;

      const examSubject = examSubjects.find(
        (sub) => sub._id.toString() === subject.id.toString()
      );
      const field = `${result.language}_questions`;
      const subjectQuestionIds = examSubject[field];

      const subjectQuestions = subjectQuestionIds
        .map((id) => questionMap.get(id.toString()))
        .filter(Boolean);

      const answeredQuestionIds = new Set(
        subject.results.map((answer) => answer.questionId.toString())
      );

      for (const question of subjectQuestions) {
        if (!answeredQuestionIds.has(question._id.toString())) {
          subject.results.push({
            questionNumber: question.questionNumber,
            questionId: question._id,
            optionIds: [],
            isCorrect: false,
          });
        }
      }

      for (const answer of subject.results) {
        const question = questionMap.get(answer.questionId.toString());

        if (!question) {
          // If the question is not found, continue without aborting
          console.warn(`Question with ID ${answer.questionId} not found`);
          continue;
        }

        subjectPossiblePoints += question.point;
        totalPossiblePoints += question.point;

        const isCorrect =
          question.correctOptions.length === answer.optionIds.length &&
          question.correctOptions.every((opt) =>
            answer.optionIds.includes(opt.toString())
          );

        let questionPoints = 0; // Track points awarded for this question

        // Implement the new point calculation logic for twoPoints type questions
        if (question.point === 2) {
          const correctOptions = question.correctOptions.map((opt) =>
            opt.toString()
          );
          const selectedOptions = answer.optionIds.map((opt) => opt.toString());
          const correctCount = selectedOptions.filter((opt) =>
            correctOptions.includes(opt)
          ).length;

          // Case: Two points question with 1 correct option
          if (correctOptions.length === 1) {
            if (selectedOptions.length === 1 && correctCount === 1) {
              questionPoints = 2; // Full points
            } else if (selectedOptions.length === 2 && correctCount === 1) {
              questionPoints = 1; // Partial points
            } else {
              questionPoints = 0; // No points
            }
          }
          // Case: Two points question with 2 correct options
          else if (correctOptions.length === 2) {
            if (selectedOptions.length === 2 && correctCount === 2) {
              questionPoints = 2; // Full points
            } else if (selectedOptions.length === 2 && correctCount === 1) {
              questionPoints = 1; // Partial points
            } else if (selectedOptions.length === 3 && correctCount === 2) {
              questionPoints = 1; // Partial points
            } else {
              questionPoints = 0; // No points
            }
          }
          // Case: Two points question with 3 correct options
          else if (correctOptions.length === 3) {
            if (selectedOptions.length === 3 && correctCount === 3) {
              questionPoints = 3; // Full points
            } else if (selectedOptions.length === 3 && correctCount === 2) {
              questionPoints = 1; // Partial points
            } else {
              questionPoints = 0; // No points
            }
          }
        } else {
          // Default behavior for other types of questions
          questionPoints = isCorrect ? question.point : 0;
        }

        // Update the answer's correctness and points
        answer.isCorrect = questionPoints > 0;
        totalPoints += questionPoints;

        if (questionPoints > 0) {
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

    await result.save({ session });

    await session.commitTransaction();
    session.endSession();

    // Fetch and populate all results for the given exam
    const allResults = await Results.find({ exam: examId })
      .populate({
        path: "student",
        populate: {
          path: "user",
          select: "name surname",
        },
      })
      .sort({ overallScore: -1 });

    const top10Results = allResults.slice(0, 10).map((res, index) => ({
      rank: index + 1,
      name: res.student.user.name,
      surname: res.student.user.surname,
      overallPoint: res.overallScore,
      missedPoint: res.missedPoints,
    }));

    const studentRank =
      allResults.findIndex(
        (res) => res.student._id.toString() === studentId.toString()
      ) + 1;

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
        startedAt: result.startedAt,
        finishedAt: result.finishedAt,
        durationInHours: result.durationInHours,
        durationInMinutes: result.durationInMinutes,
        durationInSeconds: result.durationInSeconds,
        __v: result.__v,
      },
      top10Results,
      studentRank,
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
