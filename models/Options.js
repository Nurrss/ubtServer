const mongoose = require("mongoose");
const { Schema } = mongoose;

const OptionsSchema = new Schema({
  text: { type: String },
  isCorrect: { type: Boolean },
});

module.exports = mongoose.model("Options", OptionsSchema);
