const mongoose = require("mongoose");
const { Schema } = mongoose;
const Users = require("./Users");
const Classes = require("./Classes");

const TeachersSchema = new Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "Users" },
  class: { type: mongoose.Schema.Types.ObjectId, ref: "Classes" },
  subject: { type: mongoose.Schema.Types.ObjectId, ref: "Subjects" },
});

TeachersSchema.pre("remove", async function (next) {
  try {
    // Удаление пользователя
    await Users.findByIdAndDelete(this.user);

    // Удаление учителя из класса
    await Classes.updateMany(
      { teacher: this._id },
      { $unset: { teacher: "" } }
    );

    next();
  } catch (err) {
    next(err);
  }
});

module.exports = mongoose.model("Teachers", TeachersSchema);
