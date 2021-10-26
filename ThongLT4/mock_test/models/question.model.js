const mongoose = require("mongoose");

const questionSchema = new mongoose.Schema(
  {
    quiz_id: String,
    question: String,
    answers: String,
    multi_correct: String,
  },
  {
    timestamps: true,
  }
);

const Questions = mongoose.model("questions", questionSchema, "questions");

module.exports.Questions = Questions;