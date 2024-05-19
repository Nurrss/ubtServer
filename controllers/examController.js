const Results = require("../models/Results");
const Exams = require("../models/Exams");
const Questions = require("../models/Questions");

exports.submitAndCheckAnswers = async (req, res) => {
  try {
    const { resultsId, answers } = req.body; // answers should be an array of {questionId, optionId}

    const result = await Results.findById(resultsId);
    if (!result) {
      return res.status(404).json({ message: "Result not found" });
    }

    let score = 0;
    let questionResults = [];

    for (let answer of answers) {
      const question = await Questions.findById(answer.questionId).populate(
        "options"
      );
      const isCorrect = question.options.some(
        (option) =>
          option.isCorrect && String(option._id) === String(answer.optionId)
      );

      if (isCorrect) {
        score += question.point;
      }

      questionResults.push({
        questionId: answer.questionId,
        isCorrect: isCorrect,
      });
    }

    result.score = score;
    result.questionsAnswered = questionResults; // Assuming you have a field to store these in your schema
    await result.save();

    res
      .status(200)
      .json({ message: "Exam submitted and checked successfully", result });
  } catch (error) {
    res
      .status(400)
      .json({ message: "Error submitting and checking exam", error });
  }
};

exports.getResultByStudentId = async (req, res) => {
  const studentId = req.params.studentId;
  try {
    const results = await Results.find({ student: studentId }).populate("exam");
    if (results.length === 0) {
      return res
        .status(404)
        .json({ message: "No results found for this student." });
    }
    res.status(200).json(results);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Server error", error });
  }
};
