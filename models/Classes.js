const mongoose = require("mongoose");
const { Schema } = mongoose;
const Students = require("./Students");
const Teachers = require("./Teachers");

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

ClassesSchema.pre("deleteOne", async function (next) {
  try {
    await Students.deleteMany({ class: this._id });

    await Teachers.updateMany({ class: this._id }, { $unset: { class: "" } });

    next();
  } catch (err) {
    next(err);
  }
});

module.exports = mongoose.model("Classes", ClassesSchema);
