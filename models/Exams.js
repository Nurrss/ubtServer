const mongoose = require("mongoose");
const { Schema } = mongoose;

const ExamsSchema = new Schema({
  topics: [{ type: mongoose.Schema.Types.ObjectId, ref: "Topics" }],
  status: { type: String, enum: ["active", "inactive"], default: "active" },
  startedAt: { type: Date },
  finishedAt: { type: Date },
  examType: { type: String, enum: ["last", "random"], default: "random" },
  amountOfPassed: { type: Number, default: 0 },
});

module.exports = mongoose.model("Exams", ExamsSchema);
