const mongoose = require("mongoose");
const { Schema } = mongoose;

const TeachersSchema = new Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "Users" },
  class: { type: mongoose.Schema.Types.ObjectId, ref: "Classes" },
  subject: { type: mongoose.Schema.Types.ObjectId, ref: "Subjects" },
});

TeachersSchema.pre(
  "deleteOne",
  { document: true, query: false },
  async function (next) {
    try {
      const Users = require("./Users");
      const Classes = require("./Classes");
      await Users.findByIdAndDelete(this.user);

      await Classes.updateMany(
        { teacher: this._id },
        { $pull: { teacher: this._id } }
      );

      next();
    } catch (err) {
      next(err);
    }
  }
);

module.exports = mongoose.model("Teachers", TeachersSchema);
