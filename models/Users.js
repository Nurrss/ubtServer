const mongoose = require("mongoose");

const { Schema } = mongoose;
const validator = require("validator");

const UsersSchema = new Schema(
  {
    email: {
      type: String,
      trim: true,
      unique: true,
      required: true,
      lowercase: true,
      validate: [
        {
          validator: (value) => validator.isEmail(value),
          msg: "Invalid email",
        },
      ],
    },
    password: {
      type: String,
      trim: true,
      required: true,
      validate: [
        {
          validator: function (value) {
            return value.length >= 6;
          },
          msg: "Password length must be at least 6 characters",
        },
      ],
    },
    name: {
      type: String,
    },
    surname: {
      type: String,
    },
    refreshToken: { type: String },
    accessToken: { type: String },
    role: {
      type: String,
      enum: ["admin", "student", "teacher"],
      default: "teacher",
    },
  },
  { timestamps: true, get: (time) => time.toDateString() }
);

module.exports = mongoose.model("Users", UsersSchema);
