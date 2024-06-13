const mongoose = require("mongoose");
const Results = require("../models/Results");
const Students = require("../models/Students");
const Subjects = require("../models/Subjects"); // Ensure this model is correctly required

const getResultsForExam = async (req, res) => {
  const { examId } = req.body;
  const { subjectId, classId } = req.query;

  try {
    console.log("Request details:", { examId, subjectId, classId });

    const query = { exam: examId };

    if (subjectId) {
      if (!mongoose.Types.ObjectId.isValid(subjectId)) {
        return res.status(400).json({ message: "Invalid subjectId" });
      }
      const subject = await Subjects.findById(subjectId).select(
        "kz_subject ru_subject"
      );
      if (!subject) {
        return res.status(404).json({ message: "Subject not found" });
      }
      query["subjects.name"] = {
        $in: [subject.kz_subject, subject.ru_subject],
      };
    }

    if (classId) {
      if (!mongoose.Types.ObjectId.isValid(classId)) {
        return res.status(400).json({ message: "Invalid classId" });
      }
      const studentsInClass = await Students.find({ class: classId }).select(
        "_id"
      );
      const studentIds = studentsInClass.map((student) => student._id);
      query.student = { $in: studentIds };
    }

    const allResults = await Results.find(query)
      .sort({ overallScore: -1 })
      .populate({
        path: "student",
        populate: {
          path: "user",
          select: "name surname",
        },
      })
      .exec();

    console.log("All Results for exam:", allResults);

    if (!allResults || allResults.length === 0) {
      return res
        .status(404)
        .json({ message: "No results found for this exam." });
    }

    const top10Results = allResults.slice(0, 10).map((result) => ({
      ...result.toObject(),
      student: {
        name: result.student.user.name,
        surname: result.student.user.surname,
      },
    }));

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
