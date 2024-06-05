const mongoose = require("mongoose");
const { Schema } = mongoose;

const SubjectsSchema = new Schema({
  topics: [{ type: mongoose.Schema.Types.ObjectId, ref: "Topics" }],
  kz_subject: { type: String, required: true },
  ru_subject: { type: String, required: true },
});

module.exports = mongoose.model("Subjects", SubjectsSchema);
