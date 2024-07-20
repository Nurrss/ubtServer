const mongoose = require("mongoose");
const Exams = require("../models/Exams");

const getAllActiveExams = async (req, res) => {
  try {
    console.log("here");
    const currentDate = new Date();
    const activeExams = await Exams.find({
      finishedAt: { $gt: currentDate },
    }).populate("subjects._id");
    res.status(200).json({
      message: "Active exams retrieved successfully",
      exams: activeExams,
    });
  } catch (error) {
    console.error("Error retrieving active exams:", error);
    res.status(500).json({
      message: "Error retrieving active exams",
      error: error.message,
    });
  }
};

module.exports = { getAllActiveExams };
