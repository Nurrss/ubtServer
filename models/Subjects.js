const mongoose = require("mongoose");
const { Schema } = mongoose;
const Topics = require("./Topics"); // Путь к вашей модели тем

const SubjectsSchema = new Schema({
  topics: [{ type: mongoose.Schema.Types.ObjectId, ref: "Topics" }],
  kz_subject: { type: String, required: true },
  ru_subject: { type: String, required: true },
});

SubjectsSchema.pre(
  "deleteOne",
  { document: true, query: false },
  async function (next) {
    try {
      const Questions = require("./Questions");
      const Options = require("./Options");
      const Teachers = require("./Teachers");

      console.log("Deleting topics related to the subject:", this._id);

      // Найти все темы, связанные с этим предметом
      const topics = await Topics.find({ _id: { $in: this.topics } });

      // Удалить все вопросы и варианты вопросов, связанные с этими темами
      for (const topic of topics) {
        console.log("Deleting questions related to topic:", topic._id);

        const questions = await Questions.find({
          _id: { $in: [...topic.kz_questions, ...topic.ru_questions] },
        });

        questions.forEach(async (question) => {
          console.log("Deleting options related to question:", question._id);
          await Options.deleteMany({ _id: { $in: question.options } });
        });

        await Questions.deleteMany({ _id: { $in: topic.kz_questions } });
        await Questions.deleteMany({ _id: { $in: topic.ru_questions } });

        // Удалить саму тему
        console.log("Deleting topic:", topic._id);
        await topic.deleteOne();
      }

      // Удалить ссылку на предмет у учителей
      console.log("Removing subject reference from teachers");
      await Teachers.updateMany(
        { subject: this._id },
        { $unset: { subject: "" } }
      );

      next();
    } catch (err) {
      console.error("Error in pre deleteOne hook for Subjects:", err);
      next(err);
    }
  }
);

module.exports = mongoose.model("Subjects", SubjectsSchema);
