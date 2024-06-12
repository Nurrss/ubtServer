const mongoose = require("mongoose");
const { Schema } = mongoose;
const Questions = require("./Questions");
const Options = require("./Options");

const TopicsSchema = new Schema({
  kz_title: { type: String, require: true },
  ru_title: { type: String, require: true },
  kz_questions: [{ type: mongoose.Schema.Types.ObjectId, ref: "Questions" }],
  ru_questions: [{ type: mongoose.Schema.Types.ObjectId, ref: "Questions" }],
});
TopicsSchema.pre("remove", async function (next) {
  try {
    await Questions.deleteMany({ _id: { $in: this.kz_questions } });
    await Questions.deleteMany({ _id: { $in: this.ru_questions } });

    const questions = await Questions.find({
      _id: { $in: [...this.kz_questions, ...this.ru_questions] },
    });
    for (const question of questions) {
      await Options.deleteMany({ _id: { $in: question.options } });
    }

    next();
  } catch (err) {
    next(err);
  }
});
module.exports = mongoose.model("Topics", TopicsSchema);
