const mongoose = require("mongoose");
const { Schema } = mongoose;
const Exams = require("./Exams"); // Путь к вашей модели экзаменов
const Students = require("./Students");

const ResultsSchema = new Schema(
  {
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
  },
  { timestamps: true }
);

ResultsSchema.pre("remove", async function (next) {
  try {
    // Удаление результата из экзамена
    await Exams.updateMany(
      { results: this._id },
      { $pull: { results: this._id } }
    );

    // Удаление результата из студента
    await Students.updateMany(
      { results: this._id },
      { $pull: { results: this._id } }
    );

    next();
  } catch (err) {
    next(err);
  }
});

module.exports = mongoose.model("Results", ResultsSchema);
