const QuizesModel = require("../models/quiz.model");
const QuestionsModel = require("../models/question.model");
const mongoose = require("mongoose");

/* local storage */
const LocalStorage = require("node-localstorage").LocalStorage;
localStorage = new LocalStorage("./lStorage");

/* validate quiz form */
module.exports.quiz = async(req, res, next) => {
    if (
        req.body.answer1 ||
        req.body.answer2 ||
        req.body.answer3 ||
        req.body.answer4
    ) {
        next();
    } else {
        const quizId = req.params.quizId;
        const questionNum = parseInt(req.query.q) || 1;

        let quizIdObj;
        let quiz;
        let questions;

        try {
            quizIdObj = mongoose.Types.ObjectId(quizId.toString());
        } catch (error) {
            res.json(error);
        }

        try {
            quiz = await QuizesModel.Quizes.findOne({ _id: quizIdObj });
        } catch (error) {
            res.json(error);
        }

        try {
            questions = await QuestionsModel.Questions.find({ quiz_id: quizIdObj });
        } catch (error) {
            res.json(error);
        }

        questions = questions.map((question) => {
            question.answersMap = JSON.parse(question.answers);
            return question;
        });

        let multiAnswer = false;

        if (parseInt(questions[questionNum - 1].multi_correct)) {
            multiAnswer = true;
        }

        const userAnswer = JSON.parse(localStorage.getItem((questionNum - 1).toString()));

        return res.render("quiz/quiz", {
            isLogin: true,
            user: res.locals.data,
            quiz: quiz,
            question: questions[questionNum - 1],
            multiAnswer: multiAnswer,
            questionNum: questionNum,
            userAnswer: userAnswer.indexAnswer || [5],
            errors: ["you have to choose the answer"],
        });
    }
};