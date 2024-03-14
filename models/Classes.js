const mongoose = require("mongoose");
const { Schema } = mongoose;

const ClassesSchema = new Schema({
  class: {
    type: String,
  },
  literal: {
    type: String,
  },
  students: [{ type: mongoose.Schema.Types.ObjectId, ref: "Students" }],
  teacher: { type: mongoose.Schema.Types.ObjectId, ref: "Teachers" },
});

module.exports = mongoose.model("Classes", ClassesSchema);
