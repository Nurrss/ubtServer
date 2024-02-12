const mongoose = require("mongoose");
const { Schema } = mongoose;

const ClassesSchema = new Schema({
  className: {
    type: String,
    required: true,
  },
  literal: {
    type: String,
    required: true,
  },
  studentsCount: {
    type: String,
    required: true,
  },
});

module.exports = mongoose.model("Classes", ClassesSchema);
