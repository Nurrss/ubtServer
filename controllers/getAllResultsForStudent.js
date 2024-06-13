const mongoose = require("mongoose");
const Results = require("../models/Results");
const Students = require("../models/Students");

const getAllResultsForStudent = async (req, res) => {
  const { studentId } = req.body;

  try {
    const allResults = await Results.find({ student: studentId })
      .populate({
        path: "exam",
        select: "createdAt",
      })
      .exec();

    console.log("All Results for student:", allResults);

    if (!allResults || allResults.length === 0) {
      return res
        .status(404)
        .json({ message: "No results found for this student." });
    }

    const formattedResults = allResults.map((result) => ({
      examId: result.exam._id,
      studentId: result.student,
      startedAt: result.exam.createdAt,
      overallPoints: result.overallScore,
      _id: result._id,
    }));

    res.status(200).json({
      results: formattedResults,
    });
  } catch (error) {
    console.error("Error retrieving results:", error);
    res
      .status(400)
      .json({ message: "Error retrieving results", error: error.message });
  }
};

module.exports = { getAllResultsForStudent };
