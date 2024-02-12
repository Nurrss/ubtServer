const mongoose = require("mongoose");
const { Schema } = mongoose;

const ClassesSchema = new Schema({
  questions: {
    type: String,
    required: true,
  },
});

module.exports = mongoose.model("Classes", ClassesSchema);
