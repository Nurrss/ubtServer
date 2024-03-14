const mongoose = require("mongoose");
const { Schema } = mongoose;

const ExamsSchema = new Schema({
  topics: [{ type: mongoose.Schema.Types.ObjectId, ref: "Topics" }],
  status: { type: String, enum: ["active", "inactive"] },
  startedAt: { type: Date },
  finishedAt: { type: Date },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "Users" },
  examType: { type: String, enum: ["last", "random"] },
});

module.exports = mongoose.model("Exams", ExamsSchema);
