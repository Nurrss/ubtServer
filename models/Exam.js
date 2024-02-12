const mongoose = require("mongoose");
const { Schema } = mongoose;

const ClassesSchema = new Schema({
  sudject: {
    type: String,
    required: true,
  },
  status: {},

  finished_at: {},
  started_at: {},
});

module.exports = mongoose.model("Classes", ClassesSchema);
