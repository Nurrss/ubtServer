const mongoose = require("mongoose");
const { Schema } = mongoose;

const ClassesSchema = new Schema({
  class: {
    type: String,
  },
  literal: {
    type: String,
  },
  students: [{ type: mongoose.Schema.Types.ObjectId, ref: "Students" }],
  teacher: { type: mongoose.Schema.Types.ObjectId, ref: "Teachers" },
});

ClassesSchema.pre("remove", async function (next) {
  try {
    // Удаление всех студентов, связанных с этим классом
    await Students.deleteMany({ class: this._id });

    // Очистка поля class у учителя
    await Teachers.updateMany({ class: this._id }, { $unset: { class: "" } });

    next();
  } catch (err) {
    next(err);
  }
});

module.exports = mongoose.model("Classes", ClassesSchema);
