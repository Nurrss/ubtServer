const mongoose = require("mongoose");
const { Schema } = mongoose;

const ClassesSchema = new Schema({
  exam: {},
  student: {},
});

module.exports = mongoose.model("Classes", ClassesSchema);
