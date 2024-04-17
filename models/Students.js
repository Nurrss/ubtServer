const mongoose = require("mongoose");
const { Schema } = mongoose;

const StudentsSchema = new Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "Users" },
  class: { type: mongoose.Schema.Types.ObjectId, ref: "Classes" },
  results: [{ type: mongoose.Schema.Types.ObjectId, ref: "ResultsSchema" }],
  inn: { type: String },
});

module.exports = mongoose.model("Students", StudentsSchema);
