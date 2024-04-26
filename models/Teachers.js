const mongoose = require("mongoose");
const { Schema } = mongoose;

const TeachersSchema = new Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "Users" },
  class: { type: mongoose.Schema.Types.ObjectId, ref: "Classes" },
  subject: { type: mongoose.Schema.Types.ObjectId, ref: "Subjects" },
});

module.exports = mongoose.model("Teachers", TeachersSchema);
