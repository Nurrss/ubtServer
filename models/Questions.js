const mongoose = require("mongoose");
const { Schema } = mongoose;
const Topics = require("./Topics");
const Options = require("./Options");

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

QuestionsSchema.pre("remove", async function (next) {
  try {
    await Topics.updateMany(
      { kz_questions: this._id },
      { $pull: { kz_questions: this._id } }
    );
    await Topics.updateMany(
      { ru_questions: this._id },
      { $pull: { ru_questions: this._id } }
    );

    await Options.deleteMany({ _id: { $in: this.options } });

    next();
  } catch (err) {
    next(err);
  }
});

module.exports = mongoose.model("Questions", QuestionsSchema);
