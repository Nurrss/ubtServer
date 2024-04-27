const Results = require("../models/Results");

const getResultForStudent = async (req, res) => {
  const { examId, studentId } = req.body;

  try {
    const result = await Results.findOne({
      exam: examId,
      student: studentId,
    }).exec();

    if (!result) {
      return res.status(404).json({ message: "Results not found" });
    }

    res.status(200).json({ result });
  } catch (error) {
    res.status(400).json({ message: "Error retrieving results", error });
  }
};

module.exports = { getResultForStudent };
