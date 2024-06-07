const mongoose = require("mongoose");
const { Schema } = mongoose;

const TopicsSchema = new Schema({
  kz_title: { type: String, require: true },
  ru_title: { type: String, require: true },
  kz_questions: [{ type: mongoose.Schema.Types.ObjectId, ref: "Questions" }],
  ru_questions: [{ type: mongoose.Schema.Types.ObjectId, ref: "Questions" }],
});

module.exports = mongoose.model("Topics", TopicsSchema);
