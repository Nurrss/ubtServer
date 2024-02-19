const mongoose = require("mongoose");
const { Schema } = mongoose;

const OptionsSchema = new Schema({
  question: {
    type: String,
    required: true,
  },
  text: {},
});

module.exports = mongoose.model("Options", OptionsSchema);
