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
  type: {
    type: String,
    enum: ["twoPoints", "onePoint"],
    default: "onePoint",
  },
  correctOptions: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Options",
      required: true,
    },
  ],
  language: {
    type: String,
    required: true,
    enum: ["kz", "ru"],
  },
});

module.exports = mongoose.model("Questions", QuestionsSchema);
