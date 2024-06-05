const mongoose = require("mongoose");
const { Schema } = mongoose;

const ExamsSchema = new Schema({
  subjects: [
    {
      _id: { type: mongoose.Schema.Types.ObjectId, ref: "Subjects" },
      ru_subject: { type: String },
      kz_subject: { type: String },
      topics: [{ type: mongoose.Schema.Types.ObjectId, ref: "Topics" }],
    },
  ],
  status: { type: String, enum: ["active", "inactive"], default: "active" },
  startedAt: { type: Date, required: true },
  results: [{ type: mongoose.Schema.Types.ObjectId, ref: "Results" }],
  finishedAt: { type: Date, required: true },
  examType: { type: String, enum: ["last", "random"], default: "random" },
  amountOfPassed: { type: Number, default: 0 },
});

module.exports = mongoose.model("Exams", ExamsSchema);
