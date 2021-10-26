const mongoose = require("mongoose");

//khai bao cac truong co trong object database
const userSchema = new mongoose.Schema(
  {
    name: String,
    email: String,
    password: String,
    role: String,
  },
  {
    timestamps: true,
  }
);

const User = mongoose.model("users", userSchema, "users");

module.exports.User = User;
