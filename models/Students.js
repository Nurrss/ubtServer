const mongoose = require("mongoose");
const { Schema } = mongoose;

const StudentsSchema = new Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "Users" },
  class: { type: mongoose.Schema.Types.ObjectId, ref: "Class" },
  results: [{ type: mongoose.Schema.Types.ObjectId, ref: "Results" }],
});

module.exports = mongoose.model("Students", StudentsSchema);
