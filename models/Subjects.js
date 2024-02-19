const mongoose = require("mongoose");
const { Schema } = mongoose;

const SubjectsSchema = new Schema({
  questions: {
    type: String,
    required: true,
  },
});

module.exports = mongoose.model("Subjects", SubjectsSchema);
