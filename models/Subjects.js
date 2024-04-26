const mongoose = require("mongoose");
const { Schema } = mongoose;

const SubjectsSchema = new Schema({
  topics: [{ type: mongoose.Schema.Types.ObjectId, ref: "Topics" }],
  subject: { type: String },
});

module.exports = mongoose.model("Subjects", SubjectsSchema);
