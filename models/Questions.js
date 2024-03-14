const mongoose = require("mongoose");
const { Schema } = mongoose;

const QuestionsSchema = new Schema({
  question: {
    type: String,
    required: true,
  },
  image: {
    type: String,
  },
  options: [{ type: mongoose.Schema.Types.ObjectId, ref: "Options" }],
  point: { type: Number },
  status: {},
  type: {},
  answer: {},
});

module.exports = mongoose.model("Questions", QuestionsSchema);
