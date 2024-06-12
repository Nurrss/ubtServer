const Results = require("../models/Results");
const Students = require("../models/Students");

const getResultsForExam = async (req, res) => {
  const { examId } = req.body;

  try {
    // Log request details
    console.log("Request details:", { examId });

    const allResults = await Results.find({ exam: examId })
      .sort({ overallScore: -1 })
      .populate({
        path: "student",
        populate: {
          path: "user",
          select: "name surname",
        },
      })
      .exec();

    // Log all results
    console.log("All Results for exam:", allResults);

    if (!allResults || allResults.length === 0) {
      return res
        .status(404)
        .json({ message: "No results found for this exam." });
    }

    // Map top 10 results
    const top10Results = allResults.slice(0, 10).map((result) => ({
      ...result.toObject(),
      student: {
        name: result.student.user.name,
        surname: result.student.user.surname,
      },
    }));

    // Prepare results with rank
    const rankedResults = allResults.map((result, index) => ({
      rank: index + 1,
      student: {
        name: result.student.user.name,
        surname: result.student.user.surname,
      },
      overallScore: result.overallScore,
      subjects: result.subjects,
    }));

    res.status(200).json({
      top10: top10Results,
      allResults: rankedResults,
    });
  } catch (error) {
    console.error("Error retrieving results:", error);
    res
      .status(400)
      .json({ message: "Error retrieving results", error: error.message });
  }
};

module.exports = { getResultsForExam };
