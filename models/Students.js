const mongoose = require("mongoose");
const { Schema } = mongoose;
const Results = require("./Results");
const Users = require("./Users");

const StudentsSchema = new Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "Users" },
  class: { type: mongoose.Schema.Types.ObjectId, ref: "Classes" },
  results: [{ type: mongoose.Schema.Types.ObjectId, ref: "Results" }],
  inn: { type: String },
});

StudentsSchema.pre(
  "deleteOne",
  { document: true, query: false },
  async function (next) {
    try {
      console.log("Deleting user:", this.user);
      await Users.findByIdAndDelete(this.user);

      console.log("Deleting results for student:", this._id);
      await Results.deleteMany({ student: this._id });

      const Classes = require("./Classes");
      await Classes.updateMany(
        { students: this._id },
        { $pull: { students: this._id } }
      );

      next();
    } catch (err) {
      console.error("Error in pre deleteOne hook for Students:", err);
      next(err);
    }
  }
);

module.exports = mongoose.model("Students", StudentsSchema);
