const mongoose = require("mongoose");
const { Schema } = mongoose;
const Topics = require("./Topics"); // Путь к вашей модели тем
const Questions = require("./Questions"); // Путь к вашей модели вопросов
const Options = require("./Options"); // Путь к вашей модели вариантов вопросов
const Teachers = require("./Teachers");

const SubjectsSchema = new Schema({
  topics: [{ type: mongoose.Schema.Types.ObjectId, ref: "Topics" }],
  kz_subject: { type: String, required: true },
  ru_subject: { type: String, required: true },
});

SubjectsSchema.pre("deleteOne", async function (next) {
  try {
    // Найти все темы, связанные с этим предметом
    const topics = await Topics.find({ _id: { $in: this.topics } });

    // Удалить все вопросы и варианты вопросов, связанные с этими темами
    for (const topic of topics) {
      await Questions.deleteMany({ _id: { $in: topic.kz_questions } });
      await Questions.deleteMany({ _id: { $in: topic.ru_questions } });

      const questions = await Questions.find({
        _id: { $in: [...topic.kz_questions, ...topic.ru_questions] },
      });
      for (const question of questions) {
        await Options.deleteMany({ _id: { $in: question.options } });
      }

      // Удалить саму тему
      await topic.remove();
    }

    // Удалить ссылку на предмет у учителей
    await Teachers.updateMany(
      { subject: this._id },
      { $unset: { subject: "" } }
    );

    next();
  } catch (err) {
    next(err);
  }
});
module.exports = mongoose.model("Subjects", SubjectsSchema);
