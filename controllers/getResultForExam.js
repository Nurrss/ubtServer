const mongoose = require("mongoose");
const Results = require("../models/Results");
const Students = require("../models/Students");
const Exams = require("../models/Exams");
const Subjects = require("../models/Subjects");

const getAllResultForExam = async (req, res) => {
  const { examId, classId, subjectId } = req.body;

  try {
    if (!mongoose.Types.ObjectId.isValid(examId)) {
      return res.status(400).json({ message: "Invalid exam ID" });
    }

    const examPromise = Exams.findById(examId).select("subjects").lean();
    const studentsInClassPromise =
      classId && mongoose.Types.ObjectId.isValid(classId)
        ? Students.find({ class: classId }).select("_id").lean()
        : Promise.resolve([]);

    const [exam, studentsInClass] = await Promise.all([
      examPromise,
      studentsInClassPromise,
    ]);

    if (!exam) {
      return res.status(404).json({ message: "Exam not found" });
    }

    let matchStage = { exam: new mongoose.Types.ObjectId(examId) };
    if (studentsInClass.length > 0) {
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
      const subject = await Subjects.findById(subjectId)
        .select("ru_subject")
        .lean();
      const subjectName = subject.ru_subject;

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

    const results = await Results.aggregate(aggregationPipeline);

    results.sort((a, b) => b.overallScore - a.overallScore);
    results.forEach((result, index) => {
      result.rank = index + 1;
    });

    const top10Results = results.slice(0, 10);
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
