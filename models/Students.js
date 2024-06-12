const mongoose = require("mongoose");
const { Schema } = mongoose;
const Results = require("./Results");
const Users = require("./Users");
const Classes = require("./Classes");

const StudentsSchema = new Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "Users" },
  class: { type: mongoose.Schema.Types.ObjectId, ref: "Classes" },
  results: [{ type: mongoose.Schema.Types.ObjectId, ref: "Results" }],
  inn: { type: String },
});

StudentsSchema.pre("remove", async function (next) {
  try {
    // Удаление всех результатов, связанных с этим учеником
    await Results.deleteMany({ student: this._id });

    // Удаление ученика из класса
    await Classes.updateMany(
      { students: this._id },
      { $pull: { students: this._id } }
    );

    // Удаление пользователя
    await Users.findByIdAndDelete(this.user);

    next();
  } catch (err) {
    next(err);
  }
});

module.exports = mongoose.model("Students", StudentsSchema);
