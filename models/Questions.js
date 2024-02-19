const mongoose = require("mongoose");
const { Schema } = mongoose;

const QuestionsSchema = new Schema({
  text: {
    type: String,
    required: true,
  },
  image: {
    type: String,
    required: true,
  },
  option: {
    type: String,
    required: true,
  },
  point: {},
  status: {},
  type: {},
  answer: {},
});

module.exports = mongoose.model("Questions", QuestionsSchema);
