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

    // Build aggregation pipeline based on provided filters
    let matchStage = { exam: new mongoose.Types.ObjectId(examId) };

    if (classId && mongoose.Types.ObjectId.isValid(classId)) {
      const studentsInClass = await Students.find({ class: classId }).select(
        "_id"
      );
      matchStage.student = {
        $in: studentsInClass.map((student) => student._id),
      };
    }

    let aggregationPipeline = [
      { $match: matchStage },
      {
        $lookup: {
          from: "students",
          localField: "student",
          foreignField: "_id",
          as: "studentDetails",
        },
      },
      { $unwind: "$studentDetails" },
      {
        $lookup: {
          from: "users",
          localField: "studentDetails.user",
          foreignField: "_id",
          as: "studentUserDetails",
        },
      },
      { $unwind: "$studentUserDetails" },
      {
        $lookup: {
          from: "classes",
          localField: "studentDetails.class",
          foreignField: "_id",
          as: "studentClassDetails",
        },
      },
      { $unwind: "$studentClassDetails" },
      {
        $project: {
          student: {
            name: "$studentUserDetails.name",
            surname: "$studentUserDetails.surname",
            className: {
              $concat: [
                "$studentClassDetails.class",
                "$studentClassDetails.literal",
              ],
            },
          },
          overallScore: 1,
          overallPercent: 1,
          totalCorrect: 1,
          totalIncorrect: 1,
          subjects: 1,
          startedAt: 1,
          finishedAt: 1,
          duration: 1,
        },
      },
    ];

    if (subjectId && mongoose.Types.ObjectId.isValid(subjectId)) {
      const subject = await Subjects.findById(subjectId).select(
        "ru_subject kz_subject"
      );
      const subjectName = subject.ru_subject; // Assuming language is ru

      aggregationPipeline.push({
        $addFields: {
          subjects: {
            $filter: {
              input: "$subjects",
              as: "subject",
              cond: { $eq: ["$$subject.name", subjectName] },
            },
          },
        },
      });
    }

    // Execute aggregation pipeline
    const results = await Results.aggregate(aggregationPipeline);

    // Calculate the ranks
    results.sort((a, b) => b.overallScore - a.overallScore);
    results.forEach((result, index) => {
      result.rank = index + 1;
    });

    // Calculate the top 10 students
    const top10Results = results.slice(0, 10);

    // Calculate additional metrics
    const totalStudents = results.length;
    const passedStudents = results.filter(
      (result) => parseFloat(result.overallPercent) >= 50
    ).length;
    const averageScore = (
      results.reduce((sum, result) => sum + result.overallScore, 0) /
      totalStudents
    ).toFixed(2);
    const averagePercent = (
      results.reduce(
        (sum, result) => sum + parseFloat(result.overallPercent),
        0
      ) / totalStudents
    ).toFixed(2);

    res.status(200).json({
      message: "Results fetched successfully",
      top10Results: top10Results.map((result) => ({
        student: result.student,
        overallScore: result.overallScore,
        overallPercent: result.overallPercent,
        totalCorrect: result.totalCorrect,
        totalIncorrect: result.totalIncorrect,
        rank: result.rank,
      })),
      results,
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
