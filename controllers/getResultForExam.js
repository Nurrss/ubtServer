const mongoose = require("mongoose");
const Results = require("../models/Results");
const Students = require("../models/Students");
const Exams = require("../models/Exams");
const Subjects = require("../models/Subjects");

const getAllResultForExam = async (req, res) => {
  const { examId, classId, subjectId } = req.body;

  try {
    // Validate examId
    if (!mongoose.Types.ObjectId.isValid(examId)) {
      return res.status(400).json({ message: "Invalid exam ID" });
    }

    // Fetch the exam details
    const exam = await Exams.findById(examId).populate({
      path: "subjects",
      select: "questions ru_subject kz_subject",
    });

    if (!exam) {
      return res.status(404).json({ message: "Exam not found" });
    }

    // Build query based on provided filters
    let query = { exam: examId };

    if (classId && mongoose.Types.ObjectId.isValid(classId)) {
      const studentsInClass = await Students.find({ class: classId }).select(
        "_id"
      );
      query.student = { $in: studentsInClass.map((student) => student._id) };
    }

    // Fetch results with optional filters
    const results = await Results.find(query).populate({
      path: "student",
      populate: {
        path: "user",
        select: "name surname",
      },
    });

    // If subjectId is provided, filter results by subject
    let filteredResults = results;
    if (subjectId && mongoose.Types.ObjectId.isValid(subjectId)) {
      const subject = await Subjects.findById(subjectId).select(
        "ru_subject kz_subject"
      );
      const subjectName = subject.ru_subject; // Assuming language is ru

      filteredResults = results.map((result) => {
        const subjectResult = result.subjects.find(
          (sub) => sub.name === subjectName
        );
        return {
          ...result._doc,
          subjects: subjectResult ? [subjectResult] : [],
        };
      });
    }

    // Calculate the ranks
    filteredResults.sort((a, b) => b.overallScore - a.overallScore);
    filteredResults = filteredResults.map((result, index) => ({
      ...result._doc,
      rank: index + 1,
    }));

    // Calculate the top 10 students
    const top10Results = filteredResults.slice(0, 10);

    // Calculate additional metrics
    const totalStudents = filteredResults.length;
    const passedStudents = filteredResults.filter(
      (result) => parseFloat(result.overallPercent) >= 50
    ).length;
    const averageScore = (
      filteredResults.reduce((sum, result) => sum + result.overallScore, 0) /
      totalStudents
    ).toFixed(2);
    const averagePercent = (
      filteredResults.reduce(
        (sum, result) => sum + parseFloat(result.overallPercent),
        0
      ) / totalStudents
    ).toFixed(2);

    // Format the results to only include the required fields
    const formattedResults = filteredResults.map((result) => {
      const studentName =
        result.student && result.student.user
          ? result.student.user.name
          : "Unknown";
      const studentSurname =
        result.student && result.student.user
          ? result.student.user.surname
          : "Unknown";

      return {
        student: {
          name: studentName,
          surname: studentSurname,
        },
        overallScore: result.overallScore,
        overallPercent: result.overallPercent,
        totalCorrect: result.totalCorrect,
        totalIncorrect: result.totalIncorrect,
        rank: result.rank,
        subjects: result.subjects.map((sub) => ({
          name: sub.name,
          totalPoints: sub.totalPoints,
          totalCorrect: sub.totalCorrect,
          totalIncorrect: sub.totalIncorrect,
          percent: sub.percent,
        })),
        startedAt: result.startedAt,
        finishedAt: result.finishedAt,
        duration: result.duration,
      };
    });

    res.status(200).json({
      message: "Results fetched successfully",
      top10Results: top10Results.map((result) => {
        const studentName =
          result.student && result.student.user
            ? result.student.user.name
            : "Unknown";
        const studentSurname =
          result.student && result.student.user
            ? result.student.user.surname
            : "Unknown";

        return {
          student: {
            name: studentName,
            surname: studentSurname,
          },
          overallScore: result.overallScore,
          overallPercent: result.overallPercent,
          totalCorrect: result.totalCorrect,
          totalIncorrect: result.totalIncorrect,
          rank: result.rank,
        };
      }),
      results: formattedResults,
      metrics: {
        totalStudents,
        passedStudents,
        averageScore,
        averagePercent,
      },
    });
  } catch (error) {
    console.error("Error fetching results:", error);
    res.status(500).json({
      message: "Error fetching results",
      error: error.message,
    });
  }
};

module.exports = { getAllResultForExam };
