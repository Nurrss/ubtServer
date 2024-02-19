const mongoose = require("mongoose");
const { Schema } = mongoose;

const StudentsSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  surname: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  inn: {},
  results: {},
  classes: {},
});

module.exports = mongoose.model("Students", StudentsSchema);
