const mongoose = require("mongoose");

const quizSchema = new mongoose.Schema(
  {
    avatar: String,
    title: String,
    description: String,
    total: String,
  },
  {
    timestamps: true,
  }
);

const Quizes = mongoose.model("quizes", quizSchema, "quizes");

module.exports.Quizes = Quizes;
