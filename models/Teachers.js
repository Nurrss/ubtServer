const mongoose = require("mongoose");
const { Schema } = mongoose;

const TeachersSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  classes: {},
  literal: {},
});

module.exports = mongoose.model("Teachers", TeachersSchema);
