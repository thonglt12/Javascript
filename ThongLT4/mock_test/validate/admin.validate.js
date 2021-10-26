const mongoose = require("mongoose");
const QuizesModel = require("../models/quiz.model");
const QuestionsModel = require("../models/question.model");

/* local storage */
const LocalStorage = require("node-localstorage").LocalStorage;
localStorage = new LocalStorage("./lStorage");

/* validate: add quiz form */
module.exports.AddQuiz = (req, res, next) => {
    const errors = [];

    if (!req.body.title) {
        errors.push("title is required");
    }
    if (!req.body.description) {
        errors.push("description is required");
    }
    if (!req.body.total) {
        errors.push("total questions is required");
    }
    if (!req.file) {
        errors.push("avatar is required");
    }

    if (errors.length) {
        res.render("admin/quiz_add", { errors: errors, values: req.body });
        return;
    }
    next();
};

/* validate: add question form */
module.exports.AddQuestion = async(req, res, next) => {
    const errors = [];

    const quiz = JSON.parse(localStorage.getItem('quiz'));

    const answerCorrect = [req.body.correct1, req.body.correct2, req.body.correct3, req.body.correct4]

    const multiCorect = answerCorrect.filter(isCorrect => isCorrect);

    if (!multiCorect.length) {
        errors.push('answer correct is required');
    }

    if (!req.body.question) {
        errors.push("question is required");
    }
    if (!req.body.answer1) {
        errors.push("answer 1 is required");
    }
    if (!req.body.answer2) {
        errors.push("answer 2 is required");
    }
    if (!req.body.answer3) {
        errors.push("answer 3 is required");
    }
    if (!req.body.answer4) {
        errors.push("answer 4 is required");
    }

    if (errors.length) {
        res.render("admin/question_add", {
            errors: errors,
            values: req.body,
            quiz: quiz,
            questions_number: localStorage.length,
        });
        return;
    }
    next();
};


/* validate: update quiz form */
module.exports.updateQuiz = (req, res, next) => {
    const errors = [];

    if (!req.body.title) {
        errors.push("title is required");
    }
    if (!req.body.description) {
        errors.push("description is required");
    }
    if (!req.file) {
        errors.push("avatar is required");
    }

    if (errors.length) {
        res.render("admin/quiz_update", { errors: errors, values: req.body });
        return;
    }
    next();
};

/* validate: update question form */
module.exports.updateQuestion = async(req, res, next) => {
    const errors = [];
    const quizId = req.params.quizId;
    const questionId = req.params.questionId;
    let questionIdObj;
    let question;


    try {
        questionIdObj = mongoose.Types.ObjectId(questionId.toString());
    } catch (error) {
        res.json({ error: 'convert questionId to ObjectId' })
    }

    try {
        question = await QuestionsModel.Questions.findOne({
            _id: questionIdObj,
            quiz_id: quizId,
        });
    } catch (error) {
        res.json({ error: 'find question by _id and quizId' })
    }

    question.answersMap = JSON.parse(question.answers);

    if (!req.body.question) {
        errors.push("question is required");
    }
    if (!req.body.answer1) {
        errors.push("answer 1 is required");
    }
    if (!req.body.answer2) {
        errors.push("answer 2 is required");
    }
    if (!req.body.answer3) {
        errors.push("answer 3 is required");
    }
    if (!req.body.answer4) {
        errors.push("answer 4 is required");
    }

    if (errors.length) {
        res.render("admin/question_update", {
            errors: errors,
            question: question,
        });
        return;
    }

    res.locals.quizId = quizId;
    res.locals.questionId = questionId;
    res.locals.questionIdObj = questionIdObj;

    next();
};