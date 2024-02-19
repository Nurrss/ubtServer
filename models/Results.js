const mongoose = require("mongoose");
const { Schema } = mongoose;

const ResultsSchema = new Schema({
  exam: {},
  student: {},
});

module.exports = mongoose.model("Results", ResultsSchema);
