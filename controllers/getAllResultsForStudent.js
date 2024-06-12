const Results = require("../models/Results");
const Students = require("../models/Students");

const getAllResultsForStudent = async (req, res) => {
  const { studentId } = req.body;

  try {
    // Log request details
    console.log("Request details:", { studentId });

    const student = await Students.findById(studentId).populate(
      "user",
      "name surname"
    );
    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    const allResults = await Results.find({ student: studentId })
      .sort({ overallScore: -1 })
      .populate({
        path: "exam",
        populate: {
          path: "subjects._id",
          select: "ru_subject kz_subject",
        },
      })
      .exec();

    // Log all results
    console.log("All Results for student:", allResults);

    if (!allResults || allResults.length === 0) {
      return res
        .status(404)
        .json({ message: "No results found for this student." });
    }

    res.status(200).json({
      student: {
        name: student.user.name,
        surname: student.user.surname,
      },
      results: allResults.map((result) => ({
        ...result.toObject(),
        exam: {
          subjects: result.exam.subjects.map((subject) => ({
            ru_subject: subject._id.ru_subject,
            kz_subject: subject._id.kz_subject,
          })),
          startedAt: result.exam.startedAt,
          finishedAt: result.exam.finishedAt,
        },
      })),
    });
  } catch (error) {
    console.error("Error retrieving results:", error);
    res
      .status(400)
      .json({ message: "Error retrieving results", error: error.message });
  }
};

module.exports = { getAllResultsForStudent };
