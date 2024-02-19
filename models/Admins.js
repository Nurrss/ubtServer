const mongoose = require("mongoose");
const { Schema } = mongoose;

const AdminsSchema = new Schema({
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

module.exports = mongoose.model("Admins", AdminsSchema);
