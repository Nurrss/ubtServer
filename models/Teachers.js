const mongoose = require("mongoose");
const { Schema } = mongoose;

const TeachersSchema = new Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "Users" },
  classes: [{ type: mongoose.Schema.Types.ObjectId, ref: "Classes" }],
  topics: [{ type: mongoose.Schema.Types.ObjectId, ref: "Topics" }],
});

module.exports = mongoose.model("Teachers", TeachersSchema);
