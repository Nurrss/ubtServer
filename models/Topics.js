const mongoose = require("mongoose");
const { Schema } = mongoose;

const TopicsSchema = new Schema({
  title: String,
  questions: [{ type: mongoose.Schema.Types.ObjectId, ref: "Questions" }],
  subject: String,
  teacher: { type: mongoose.Schema.Types.ObjectId, ref: "Teachers" },
});

module.exports = mongoose.model("Topics", TopicsSchema);
