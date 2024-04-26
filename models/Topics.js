const mongoose = require("mongoose");
const { Schema } = mongoose;

const TopicsSchema = new Schema({
  title: String,
  questions: [{ type: mongoose.Schema.Types.ObjectId, ref: "Questions" }],
});

module.exports = mongoose.model("Topics", TopicsSchema);
