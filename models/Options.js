const mongoose = require("mongoose");
const { Schema } = mongoose;

const ClassesSchema = new Schema({
  question: {
    type: String,
    required: true,
  },
  text: {},
});

module.exports = mongoose.model("Classes", ClassesSchema);
