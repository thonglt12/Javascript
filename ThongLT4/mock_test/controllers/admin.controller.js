const mongoose = require("mongoose");
const QuizesModel = require("../models/quiz.model");
const QuestionsModel = require("../models/question.model");
const { json } = require("body-parser");
const UserQuizModel = require("../models/user_quiz.model");

/* local storage */
const LocalStorage = require("node-localstorage").LocalStorage;
localStorage = new LocalStorage("./lStorage");

/* shortid: using for quizId */
const shortid = require('shortid');


/* GET: index of admin */
module.exports.index = async(req, res, next) => {
    let quizes;

    /* clear local storage */
    localStorage.clear();

    /* select all quiz */
    try {
        quizes = await QuizesModel.Quizes.find();
    } catch (error) {
        res.json({ error: 'find all quiz' })
    }
    res.render("admin/index", { quizes: quizes });
};

/* GET: add quiz form */
module.exports.addQuiz = (req, res, next) => {
    res.render("admin/quiz_add");
};

/* GET: read quiz */
module.exports.readQuiz = async(req, res, next) => {

    const quizId = req.params.quizId;
    let quizIdObj;
    let quiz;
    let questions;

    try {
        quizIdObj = mongoose.Types.ObjectId(quizId.toString());
    } catch (e) {
        res.json({ error: 'quizId cannot convert to objectId' });
    }

    try {
        quiz = await QuizesModel.Quizes.findOne({ _id: quizIdObj });
    } catch (e) {
        res.json({ error: 'find quiz document by _id' })
    }

    try {
        questions = await QuestionsModel.Questions.find({ quiz_id: quizId });
    } catch (e) {
        res.json({ error: 'find questions by quiz_id' })
    }

    /* parse answer from string to object */
    questions = await questions.map((question) => {
        question.answersMap = JSON.parse(question.answers);
        return question;
    });

    res.render("admin/quiz_read", {
        quiz: quiz,
        questions: questions,
    });
};

/* GET: update quiz form */
module.exports.updateQuiz = async(req, res, next) => {
    const quizId = req.params.quizId;
    let quizIdObj;
    let quiz;

    try {
        quizIdObj = mongoose.Types.ObjectId(quizId.toString());
    } catch (e) {
        res.json({ erorr: "convert quizId to ObjectId" });
    }

    try {
        quiz = await QuizesModel.Quizes.findOne({ _id: quizIdObj });
    } catch (e) {
        res.json({ erorr: "find quiz by quizId" });
    }

    res.render("admin/quiz_update", { quiz: quiz });
};

/* GET: update question form */
module.exports.updateQuestion = async(req, res, next) => {
    const quizId = req.params.quizId;
    const questionId = req.params.questionId;

    let questionIdObj;
    let question;

    try {
        questionIdObj = mongoose.Types.ObjectId(questionId.toString());
    } catch (e) {
        res.json({ erorr: "convert questionId to ObjectId" });
    }

    try {
        question = await QuestionsModel.Questions.findOne({
            quiz_id: quizId,
            _id: questionIdObj,
        });
    } catch (e) {
        res.json({ erorr: "find quiz by quizId and questionIdObj" });
    }

    question.answersMap = JSON.parse(question.answers);

    res.render("admin/question_update", { question: question });
};

/* GET: add question form */
module.exports.addQuestion = async(req, res, next) => {
    const quizId = req.params.quizId;
    let quizIdObj;
    let quiz;

    try {
        quiz = JSON.parse(localStorage.getItem('quiz'))
    } catch (e) {
        res.json({ error: 'get quiz from localstorage' })
    }

    res.render("admin/question_add", {
        quiz: quiz,
        questions_number: localStorage.length,
        finish: (localStorage.length) === parseInt(quiz.total),
    });
};

/* POST:  add quiz */
module.exports.addQuizPost = async(req, res, next) => {
    req.body.avatar = req.file.path.split("/").slice(1).join("/");


    /* store quiz to localstorag */

    const quiz = {
        avatar: req.body.avatar,
        title: req.body.title,
        description: req.body.description,
        total: req.body.total
    }

    try {
        localStorage.setItem('quiz', JSON.stringify(quiz));
    } catch (e) {
        res.json({ error: 'store quiz to localstorage' })
    }

    /* next to add questions */
    res.redirect("/admin/quiz/" + shortid.generate() + "/question/add");

};

/* POST: add question */
module.exports.addQuestionPost = async(req, res, next) => {
    const quizId = req.params.quizId;
    let quiz;

    /* check question have multi correct answer */
    const correctAnswers = [
        req.body.correct1,
        req.body.correct2,
        req.body.correct3,
        req.body.correct4,
    ];

    const corrects = correctAnswers.filter((correct) => correct);
    let multi_correct = "0";
    if (corrects.length > 1) {
        multi_correct = "1";
    }
    /* get ansert-question from form */
    const answer1 = {
        answer: req.body.answer1,
        is_correct: req.body.correct1 ? "1" : "0",
        is_choose: "0",
    };
    const answer2 = {
        answer: req.body.answer2,
        is_correct: req.body.correct2 ? "1" : "0",
        is_choose: "0",
    };
    const answer3 = {
        answer: req.body.answer3,
        is_correct: req.body.correct3 ? "1" : "0",
        is_choose: "0",
    };
    const answer4 = {
        answer: req.body.answer4,
        is_correct: req.body.correct4 ? "1" : "0",
        is_choose: "0",
    };
    const answers = [answer1, answer2, answer3, answer4];
    const question = {
        question: req.body.question,
        answers: JSON.stringify(answers),
        multi_correct: multi_correct,
    };

    /* store question into session storage */

    localStorage.setItem((localStorage.length - 1).toString(), JSON.stringify(question))

    /* check the question was enought yet */

    try {
        quiz = JSON.parse(localStorage.getItem('quiz'));
    } catch (e) {
        res.json({ error: 'get quiz from localstorage' })
    }

    if (localStorage.length > parseInt(quiz.total)) {
        /* finish adding question */

        /* store quiz from local storage to database */

        const newQuiz = await QuizesModel.Quizes.create(JSON.parse(localStorage.getItem('quiz')))

        /* store questions from local storage to database */

        for (let i = 0; i < (localStorage.length - 1); i++) {
            const question = JSON.parse(localStorage.getItem(i.toString()));
            question.quiz_id = newQuiz.id;
            await QuestionsModel.Questions.create(question);
        }
        localStorage.clear();
        res.redirect("/admin");
    } else {
        res.redirect("/admin/quiz/" + quizId + "/question/add");
    }
};

/* POST: update quiz */
module.exports.quizUpdatePost = async(req, res, next) => {
    const quizId = req.params.quizId;
    let quizIdObj;

    try {
        quizIdObj = mongoose.Types.ObjectId(quizId.toString());
    } catch (e) {
        res.json({ error: 'conver quizId to ObjectId' })
    }

    req.body.avatar = req.file.path.split("/").slice(1).join("/");

    /* update to database */
    try {
        await QuizesModel.Quizes.updateOne({ _id: quizIdObj }, req.body);
    } catch (e) {
        res.json({ error: 'update quiz' })
    }

    res.redirect("/admin");
};

/* POST: update a question */
module.exports.updateQuestionPost = async(req, res, next) => {
    /* check question have multi correct answer */
    const correctAnswers = [
        req.body.correct1,
        req.body.correct2,
        req.body.correct3,
        req.body.correct4,
    ];

    const corrects = correctAnswers.filter((correct) => correct);
    let multi_correct = "0";
    if (corrects.length > 1) {
        multi_correct = "1";
    }
    /* get ansert-question from form */
    const answer1 = {
        answer: req.body.answer1,
        is_correct: req.body.correct1 ? "1" : "0",
        is_choose: "0",
    };
    const answer2 = {
        answer: req.body.answer2,
        is_correct: req.body.correct2 ? "1" : "0",
        is_choose: "0",
    };
    const answer3 = {
        answer: req.body.answer3,
        is_correct: req.body.correct3 ? "1" : "0",
        is_choose: "0",
    };
    const answer4 = {
        answer: req.body.answer4,
        is_correct: req.body.correct4 ? "1" : "0",
        is_choose: "0",
    };
    const answers = [answer1, answer2, answer3, answer4];
    const question = {
        question: req.body.question,
        answers: JSON.stringify(answers),
        multi_correct: multi_correct,
    };

    try {
        await QuestionsModel.Questions.updateOne({ _id: res.locals.questionIdObj, quiz_id: res.locals.quizId },
            question
        );
    } catch (e) {
        res.json({ error: "update question" });
    }

    res.redirect("/admin/quiz/" + res.locals.quizId + "/read");
};

/* DELETE: delete quiz and any concerned */
module.exports.deleteQuiz = async(req, res, next) => {
    const quizId = req.params.quizId;
    let quizIdObj;

    try {
        quizIdObj = mongoose.Types.ObjectId(quizId.toString());
    } catch (e) {
        res.json({ error: 'convert quizId to ObjectId' })
    }

    try {
        await QuizesModel.Quizes.deleteOne({ _id: quizIdObj });
    } catch (e) {
        res.json({ error: 'delete quiz' })
    }

    try {
        await QuestionsModel.Questions.deleteMany({ quiz_id: quizId })
    } catch (e) {
        res.json({ error: 'delete question by quiz id' })
    }

    try {
        await UserQuizModel.UserQuiz.deleteMany({ quiz_id: quizId })
    } catch (e) {
        res.json({ error: 'delete user quiz by quiz id' })
    }

    res.redirect('/admin')
}