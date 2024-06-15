const mongoose = require("mongoose");
const { Schema } = mongoose;
const Topics = require("./Topics");

const ExamsSchema = new Schema({
  subjects: [
    {
      _id: { type: mongoose.Schema.Types.ObjectId, ref: "Subjects" },
      ru_subject: { type: String },
      kz_subject: { type: String },
      topics: [{ type: mongoose.Schema.Types.ObjectId, ref: "Topics" }],
      questions: [{ type: mongoose.Schema.Types.ObjectId, ref: "Questions" }],
    },
  ],
  status: { type: String, enum: ["active", "inactive"], default: "active" },
  startedAt: { type: Date, required: true },
  results: [{ type: mongoose.Schema.Types.ObjectId, ref: "Results" }],
  finishedAt: { type: Date, required: true },
  examType: { type: String, enum: ["last", "random"], default: "random" },
  amountOfPassed: { type: Number, default: 0 },
});

ExamsSchema.pre(
  "deleteOne",
  { document: true, query: false },
  async function (next) {
    try {
      const Results = require("./Results");
      await Results.deleteMany({ exam: this._id });

      next();
    } catch (err) {
      next(err);
    }
  }
);

module.exports = mongoose.model("Exams", ExamsSchema);
