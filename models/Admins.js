const mongoose = require("mongoose");
const { Schema } = mongoose;

const ClassesSchema = new Schema({
  inn: {
    type: String,
    required: true,
  },

  password: {
    type: String,
    required: true,
  },
  exam: {},
});

module.exports = mongoose.model("Classes", ClassesSchema);
