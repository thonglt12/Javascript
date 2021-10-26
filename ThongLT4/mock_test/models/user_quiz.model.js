const mongoose = require("mongoose");

const userQuizSchema = new mongoose.Schema(
  {
    user_id: String,
    quiz_id: String,
    score: String,
  },
  {
    timestamps: true,
  }
);

const UserQuiz = mongoose.model("users_quiz", userQuizSchema, "users_quiz");

module.exports.UserQuiz = UserQuiz;