const mongoose = require("mongoose");
const { Schema } = mongoose;

const AdminsSchema = new Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "Users" },
});

module.exports = mongoose.model("Admins", AdminsSchema);
