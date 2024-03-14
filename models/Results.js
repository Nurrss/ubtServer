const mongoose = require("mongoose");
const { Schema } = mongoose;

const ResultsSchema = new Schema({
  exam: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Exams",
  },
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Students",
  },
  score: { type: Number, default: 0 },
  questionsAnswered: [
    {
      questionId: { type: mongoose.Schema.Types.ObjectId, ref: "Questions" },
      isCorrect: { type: Boolean },
    },
  ],
});

module.exports = mongoose.model("Results", ResultsSchema);
