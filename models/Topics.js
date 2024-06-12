const mongoose = require("mongoose");
const { Schema } = mongoose;

const TopicsSchema = new Schema({
  kz_title: { type: String, required: true },
  ru_title: { type: String, required: true },
  kz_questions: [{ type: mongoose.Schema.Types.ObjectId, ref: "Questions" }],
  ru_questions: [{ type: mongoose.Schema.Types.ObjectId, ref: "Questions" }],
});

TopicsSchema.pre(
  "deleteOne",
  { document: true, query: false },
  async function (next) {
    try {
      const Questions = require("./Questions");
      const Options = require("./Options");

      // Retrieve all questions related to this topic
      const allQuestions = await Questions.find({
        _id: { $in: [...this.kz_questions, ...this.ru_questions] },
      });

      // Delete related questions and their options
      for (const question of allQuestions) {
        await Options.deleteMany({ _id: { $in: question.options } });
      }

      await Questions.deleteMany({
        _id: { $in: [...this.kz_questions, ...this.ru_questions] },
      });

      next();
    } catch (err) {
      next(err);
    }
  }
);

module.exports = mongoose.model("Topics", TopicsSchema);
