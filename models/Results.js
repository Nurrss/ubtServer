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
  subjects: [
    {
      name: { type: String },
      results: [
        {
          questionNumber: { type: Number },
          isCorrect: { type: Boolean },
        },
      ],
      totalPoints: { type: Number },
      totalCorrect: { type: Number },
      totalIncorrect: { type: Number },
      percent: { type: String },
    },
  ],
  overallScore: { type: Number },
  totalCorrect: { type: Number },
  totalIncorrect: { type: Number },
  overallPercent: { type: String },
});

module.exports = mongoose.model("Results", ResultsSchema);
