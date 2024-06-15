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
    console.log(studentResult);
    if (!studentResult) {
      return res
        .status(404)
        .json({ message: "No result found for this student in the exam." });
    }

    // Set a default language if it is not provided
    const language = studentResult.language || "kz";

    const exam = await Exams.findById(examId).populate({
      path: "subjects",
      select: "questions ru_subject kz_subject",
    });

    if (!exam || !exam.subjects || exam.subjects.length === 0) {
      return res
        .status(404)
        .json({ message: "No subjects found for this exam." });
    }

    const allResults = await Results.find({ exam: examId })
      .sort({ overallScore: -1 })
      .populate({
        path: "student",
        populate: {
          path: "user",
          select: "name surname",
        },
      });

    console.log("All Results:", allResults);

    if (!allResults || allResults.length === 0) {
      return res
        .status(404)
        .json({ message: "No results found for this exam." });
    }

    const validResults = allResults.filter(
      (result) => result.student && result.student.user
    );

    console.log("Valid Results:", validResults);

    if (validResults.length === 0) {
      return res
        .status(404)
        .json({ message: "No valid results found for this exam." });
    }

    // Perform calculations
    for (let result of validResults) {
      let totalCorrect = 0;
      let totalIncorrect = 0;
      let totalPoints = 0;
      let totalAvailablePoints = 0; // Total points available in the exam

      for (let subject of exam.subjects) {
        const subjectResult = result.subjects.find(
          (sub) => sub.name === subject[language + "_subject"]
        );

        if (!subjectResult) continue;

        let subjectTotalCorrect = 0;
        let subjectTotalIncorrect = 0;
        let subjectTotalPoints = 0;

        // Dynamically assign question numbers based on the questions array in the subject
        let questionNumberMap = {};
        subject.questions.forEach((questionId, index) => {
          questionNumberMap[questionId.toString()] = index + 1;
        });

        for (let questionId of subject.questions) {
          // Declare the question variable before using it
          let question = await Questions.findById(questionId).select(
            "_id point correctOptions"
          );

          totalAvailablePoints += question.point; // Sum of all points available

          const answer = subjectResult.results.find(
            (r) => r.questionId.toString() === questionId.toString()
          );

          const correctOptions = question.correctOptions.map((opt) =>
            opt.toString()
          );

          if (answer) {
            const optionIds = answer.optionIds.map((id) => id.toString());
            const isCorrect =
              optionIds.every((id) => correctOptions.includes(id)) &&
              optionIds.length === correctOptions.length;

            answer.isCorrect = isCorrect; // Set the isCorrect field
            answer.questionNumber = questionNumberMap[questionId.toString()]; // Assign question number from map

            if (isCorrect) {
              subjectTotalCorrect++;
              subjectTotalPoints += question.point;
            } else {
              subjectTotalIncorrect++;
            }
          } else {
            // If the question was not answered, count it as incorrect and create an entry
            subjectResult.results.push({
              questionId: question._id,
              optionIds: [],
              isCorrect: false,
              questionNumber: questionNumberMap[questionId.toString()], // Assign question number from map
            });
            subjectTotalIncorrect++;
          }
        }

        subjectResult.totalCorrect = subjectTotalCorrect;
        subjectResult.totalIncorrect = subjectTotalIncorrect;
        subjectResult.totalPoints = subjectTotalPoints;
        subjectResult.percent = (
          (subjectTotalCorrect /
            (subjectTotalCorrect + subjectTotalIncorrect)) *
          100
        ).toFixed(2);

        totalCorrect += subjectTotalCorrect;
        totalIncorrect += subjectTotalIncorrect;
        totalPoints += subjectTotalPoints;
      }

      result.totalCorrect = totalCorrect;
      result.totalIncorrect = totalIncorrect;
      result.overallScore = totalPoints;
      result.overallPercent =
        ((totalPoints / totalAvailablePoints) * 100).toFixed(2) + "%";
      result.finishedAt = new Date();
      const durationInMillis = result.finishedAt - result.startedAt;
      const durationInHours = durationInMillis / (1000 * 60 * 60);
      result.duration = parseFloat(durationInHours.toFixed(2)); // Save the duration in hours as a number

      await result.save();
    }

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
