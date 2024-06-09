const Results = require("../models/Results");
const Students = require("../models/Students");

const getResultForStudent = async (req, res) => {
  const { examId, studentId } = req.body;

  try {
    // Log request details
    console.log("Request details:", { examId, studentId });

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
    console.log("All Results:", allResults);

    if (!allResults || allResults.length === 0) {
      return res
        .status(404)
        .json({ message: "No results found for this exam." });
    }

    // Check if the results have valid student references
    allResults.forEach((result) => {
      if (!result.student) {
        console.error(`Result ${result._id} has no valid student reference.`);
      } else {
        console.log(`Result ${result._id} has a valid student reference.`);
      }
    });

    // Filter out results with null students
    const validResults = allResults.filter(
      (result) => result.student && result.student.user
    );

    // Log valid results
    console.log("Valid Results:", validResults);

    if (validResults.length === 0) {
      return res
        .status(404)
        .json({ message: "No valid results found for this exam." });
    }

    // Map top 10 results
    const top10Results = validResults.slice(0, 10).map((result) => ({
      ...result.toObject(),
      student: {
        name: result.student.user.name,
        surname: result.student.user.surname,
      },
    }));

    // Find the specific student's result
    const studentResult = validResults.find(
      (result) => result.student._id.toString() === studentId
    );

    // Log student result
    console.log("Student Result:", studentResult);

    if (!studentResult) {
      return res.status(404).json({ message: "Results not found" });
    }

    // Calculate student's rank
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
