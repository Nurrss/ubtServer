const mongoose = require("mongoose");
const { Schema } = mongoose;

const TeachersSchema = new Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "Users" },
  class: { type: mongoose.Schema.Types.ObjectId, ref: "Classes" },
  topics: [{ type: mongoose.Schema.Types.ObjectId, ref: "Topics" }],
  subject: { type: String },
});

module.exports = mongoose.model("Teachers", TeachersSchema);
