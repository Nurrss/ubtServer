const mongoose = require("mongoose");
const { Schema } = mongoose;
const Users = require("./Users");
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
  teacher: [{ type: mongoose.Schema.Types.ObjectId, ref: "Teachers" }],
});

ClassesSchema.virtual("className").get(function () {
  return `${this.class}${this.literal}`;
});

ClassesSchema.set("toJSON", { virtuals: true });
ClassesSchema.set("toObject", { virtuals: true });

ClassesSchema.pre(
  "deleteOne",
  { document: true, query: false },
  async function (next) {
    try {
      const classId = this._id;

      // Удалить всех студентов, связанных с классом
      const students = await Students.find({ class: classId });
      students.forEach(async (student) => {
        {
          await Users.findByIdAndDelete(student.user);
          await student.deleteOne();
        }
      });

      await Teachers.updateMany({ class: classId }, { $unset: { class: "" } });

      next();
    } catch (err) {
      next(err);
    }
  }
);

module.exports = mongoose.model("Classes", ClassesSchema);
