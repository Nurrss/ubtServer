const mongoose = require("mongoose");
const { Schema } = mongoose;

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
        id: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Subjects",
        },
        results: [
          {
            questionId: {
              type: mongoose.Schema.Types.ObjectId,
              ref: "Questions",
            },
            optionIds: [
              {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Options",
              },
            ],
            questionNumber: { type: Number },
            isCorrect: { type: Boolean },
          },
        ],
        totalPoints: { type: Number },
        totalCorrect: { type: Number },
        totalIncorrect: { type: Number },
        percent: { type: String },
        missedPoints: { type: Number },
      },
    ],
    overallScore: { type: Number },
    totalCorrect: { type: Number },
    missedPoints: { type: Number },
    totalIncorrect: { type: Number },
    overallPercent: { type: String },
    startedAt: { type: Date },
    finishedAt: { type: Date },
    durationInHours: { type: Number },
    durationInMinutes: { type: Number },
    durationInSeconds: { type: Number },
    language: {
      type: String,
      required: true,
      enum: ["kz", "ru"],
    },
  },
  { timestamps: true }
);

ResultsSchema.pre(
  "deleteOne",
  { document: true, query: false },
  async function (next) {
    try {
      const Exams = require("./Exams"); // Путь к вашей модели экзаменов
      const Students = require("./Students");
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
  }
);

module.exports = mongoose.model("Results", ResultsSchema);
