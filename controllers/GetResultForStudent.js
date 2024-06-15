const mongoose = require("mongoose");
const Exams = require("../models/Exams");
const Results = require("../models/Results");
const Questions = require("../models/Questions");

const getResultForStudent = async (req, res) => {
  const { examId, studentId } = req.body;

  try {
    console.log("Request details:", { examId, studentId });

    // Fetch the result for the student
    const studentResult = await Results.findOne({
      exam: examId,
      student: studentId,
    }).populate({
      path: "student",
      populate: {
        path: "user",
        select: "name surname",
      },
    });

    if (!studentResult) {
      return res
        .status(404)
        .json({ message: "No result found for this student in the exam." });
    }

    // Fetch the exam details
    const exam = await Exams.findById(examId).populate({
      path: "subjects",
      select: "questions ru_subject kz_subject",
    });

    if (!exam || !exam.subjects || exam.subjects.length === 0) {
      return res
        .status(404)
        .json({ message: "No subjects found for this exam." });
    }

    // Fetch all questions for the subjects in the exam in a single query
    const questionIds = exam.subjects.reduce((acc, subject) => {
      return acc.concat(subject.questions);
    }, []);
    const questions = await Questions.find({
      _id: { $in: questionIds },
    }).select("_id point correctOptions");

    const questionMap = questions.reduce((acc, question) => {
      acc[question._id.toString()] = question;
      return acc;
    }, {});

    // Initialize skipped questions handling
    const processedSubjects = new Set();

    // Calculate the results based on the submitted answers in the studentResult
    for (let subjectResult of studentResult.subjects) {
      processedSubjects.add(subjectResult.name);
      let subjectTotalCorrect = 0;
      let subjectTotalIncorrect = 0;
      let subjectTotalPoints = 0;

      for (let answer of subjectResult.results) {
        const question = questionMap[answer.questionId.toString()];

        if (question) {
          const correctOptions = question.correctOptions.map((opt) =>
            opt.toString()
          );
          const optionIds = answer.optionIds.map((id) => id.toString());
          const isCorrect =
            optionIds.every((id) => correctOptions.includes(id)) &&
            optionIds.length === correctOptions.length;

          answer.isCorrect = isCorrect;

          if (isCorrect) {
            subjectTotalCorrect++;
            subjectTotalPoints += question.point;
          } else {
            subjectTotalIncorrect++;
          }

          answer.questionNumber =
            subjectResult.results.findIndex(
              (r) => r.questionId.toString() === question._id.toString()
            ) + 1;
        }
      }

      // Check for skipped questions and add them
      const subjectQuestions = exam.subjects.find(
        (subject) =>
          subject[studentResult.language + "_subject"] === subjectResult.name
      ).questions;

      for (let questionId of subjectQuestions) {
        if (
          !subjectResult.results.some(
            (r) => r.questionId.toString() === questionId.toString()
          )
        ) {
          const question = questionMap[questionId.toString()];
          if (question) {
            subjectResult.results.push({
              questionId: question._id,
              optionIds: [],
              isCorrect: false,
              questionNumber: subjectResult.results.length + 1,
            });
            subjectTotalIncorrect++;
          }
        }
      }

      subjectResult.totalCorrect = subjectTotalCorrect;
      subjectResult.totalIncorrect = subjectTotalIncorrect;
      subjectResult.totalPoints = subjectTotalPoints;
      subjectResult.percent = (
        (subjectTotalPoints /
          subjectQuestions.reduce(
            (sum, qId) => sum + questionMap[qId.toString()].point,
            0
          )) *
        100
      ).toFixed(2);
    }

    // Handle subjects that were not answered at all
    for (let subject of exam.subjects) {
      const subjectName = subject[studentResult.language + "_subject"];
      if (!processedSubjects.has(subjectName)) {
        const newSubjectResult = {
          name: subjectName,
          results: [],
          totalPoints: 0,
          totalCorrect: 0,
          totalIncorrect: 0,
          percent: "0%",
        };

        for (let questionId of subject.questions) {
          const question = questionMap[questionId.toString()];
          if (question) {
            newSubjectResult.results.push({
              questionId: question._id,
              optionIds: [],
              isCorrect: false,
              questionNumber: newSubjectResult.results.length + 1,
            });
            newSubjectResult.totalIncorrect++;
          }
        }

        studentResult.subjects.push(newSubjectResult);
      }
    }

    // Calculate overall scores
    let totalCorrect = 0;
    let totalIncorrect = 0;
    let totalPoints = 0;
    let totalAvailablePoints = 0;

    for (const subject of exam.subjects) {
      const subjectResult = studentResult.subjects.find(
        (sub) => sub.name === subject[studentResult.language + "_subject"]
      );

      if (subjectResult) {
        totalCorrect += subjectResult.totalCorrect;
        totalIncorrect += subjectResult.totalIncorrect;
        totalPoints += subjectResult.totalPoints;
        totalAvailablePoints += subject.questions.reduce((sum, qId) => {
          const q = questionMap[qId.toString()];
          return sum + q.point;
        }, 0);
      }
    }

    studentResult.totalCorrect = totalCorrect;
    studentResult.totalIncorrect = totalIncorrect;
    studentResult.overallScore = totalPoints;
    studentResult.overallPercent =
      ((totalPoints / totalAvailablePoints) * 100).toFixed(2) + "%";
    studentResult.finishedAt = new Date();
    const durationInMillis = studentResult.finishedAt - studentResult.startedAt;
    const durationInHours = durationInMillis / (1000 * 60 * 60);
    studentResult.duration = parseFloat(durationInHours.toFixed(2)); // Save the duration in hours as a number

    await studentResult.save();

    // Get all valid results
    const allResults = await Results.find({ exam: examId })
      .sort({ overallScore: -1 })
      .populate({
        path: "student",
        populate: {
          path: "user",
          select: "name surname",
        },
      });

    const validResults = allResults.filter(
      (result) => result.student && result.student.user
    );

    const top10Results = validResults.slice(0, 10).map((result) => ({
      ...result.toObject(),
      student: {
        name: result.student.user.name,
        surname: result.student.user.surname,
      },
    }));

    const studentRank =
      validResults.findIndex(
        (result) => result.student._id.toString() === studentId
      ) + 1;

    res.status(200).json({
      top10: top10Results,
      studentResult: {
        ...studentResult.toObject(),
        student: {
          name: studentResult.student.user.name,
          surname: studentResult.student.user.surname,
        },
      },
      studentRank,
    });
  } catch (error) {
    console.error("Error retrieving results:", error);
    res
      .status(400)
      .json({ message: "Error retrieving results", error: error.message });
  }
};

module.exports = { getResultForStudent };
