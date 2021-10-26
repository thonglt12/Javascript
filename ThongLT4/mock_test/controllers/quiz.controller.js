const jwt = require("jsonwebtoken");
const UsersModel = require("../models/user.model");
const QuizesModel = require("../models/quiz.model");
const QuestionsModel = require("../models/question.model");
const UserQuizModel = require("../models/user_quiz.model");

const mongoose = require("mongoose");

/* local storage */
const LocalStorage = require("node-localstorage").LocalStorage;
localStorage = new LocalStorage("./lStorage");

/* GET: index quiz */
module.exports.index = async(req, res, next) => {
    let userDb;
    let userQuizes;
    let quizes;

    try {
        userDb = await UsersModel.User.findOne({
            email: res.locals.data.email,
        });
    } catch (e) {
        res.json({ error: 'find user by email' })
    }

    try {
        userQuizes = await UserQuizModel.UserQuiz.find({ user_id: userDb.id });
    } catch (e) {
        res.json({ error: 'find all user_quiz by user_id' })
    }

    try {
        quizes = await QuizesModel.Quizes.find();
    } catch (e) {
        res.json({ error: 'find all quiz' })
    }

    const userQuizId = await userQuizes.map((userquiz) => userquiz.quiz_id);
    const userScore = await userQuizes.map((userquiz) => userquiz.score)

    localStorage.clear();
    res.render("quiz/index", {
        isLogin: true,
        user: res.locals.data,
        quizes: quizes,
        userQuizId: userQuizId,
        userScore: userScore
    });
};

/* GET: quiz form */
module.exports.quiz = async(req, res, next) => {
    const quizId = req.params.quizId;
    const questionNum = parseInt(req.query.q) || 1;

    let quizIdObj;
    let quiz;
    let questions;

    try {
        quizIdObj = mongoose.Types.ObjectId(quizId.toString());
    } catch (e) {
        res.json({ error: 'convert quizId to ObjectId' });
    }

    try {
        quiz = await QuizesModel.Quizes.findOne({ _id: quizIdObj });
    } catch (e) {
        res.json({ error: 'find quiz by _id' });
    }

    try {
        questions = await QuestionsModel.Questions.find({ quiz_id: quizId });
    } catch (e) {
        res.json({ error: 'find all questions by quiz_id' });
    }

    questions = questions.map((question) => {
        question.answersMap = JSON.parse(question.answers);
        return question;
    });

    let multiAnswer = false;

    if (parseInt(questions[questionNum - 1].multi_correct)) {
        multiAnswer = true;
    }

    /* store question_id to userAnswers */


    const questionUser = { id: questions[questionNum - 1].id };
    let questionTemp; // new question
    if (!localStorage.getItem((questionNum - 1).toString())) {
        localStorage.setItem(
            (questionNum - 1).toString(),
            JSON.stringify(questionUser)
        );
        questionTemp = { indexAnswer: [5] }; // next to new question , default choose
    } else {

        questionTemp = JSON.parse(localStorage.getItem((questionNum - 1).toString()));

        if (questionTemp.id !== questions[questionNum - 1].id) {
            localStorage.setItem(
                questionNum.toString(),
                JSON.stringify(questionUser)
            );
        }
    }

    res.render("quiz/quiz", {
        isLogin: true,
        user: res.locals.data,
        quiz: quiz,
        question: questions[questionNum - 1],
        multiAnswer: multiAnswer,
        questionNum: questionNum,
        userAnswer: questionTemp.indexAnswer || [5],
    });
};

/* POST: quiz */
module.exports.quizPost = async(req, res, next) => {
    /* get data form req.body */

    const answers = [
        req.body.answer1,
        req.body.answer2,
        req.body.answer3,
        req.body.answer4,
    ];

    /* filter user's answer  and get index*/

    let indexAnswer = [];

    for (let i = 0; i < answers.length; i++) {
        if (answers[i]) {
            indexAnswer.push(i);
        }
    }

    /* store indexAnswer to useranswer Global */
    const questionNum = parseInt(req.query.q) || 1;
    let questionTem = JSON.parse(localStorage.getItem((questionNum - 1).toString()));
    questionTem.indexAnswer = [...indexAnswer];

    localStorage.setItem((questionNum - 1).toString(), JSON.stringify(questionTem));

    /* check finish quiz */

    const quizId = req.params.quizId;

    let quizIdObj;
    let quiz;
    let questions;

    try {
        quizIdObj = mongoose.Types.ObjectId(quizId.toString());
    } catch (e) {
        res.json({ error: 'convert quizId to ObjectId' });
    }

    try {
        quiz = await QuizesModel.Quizes.findOne({ _id: quizIdObj });
    } catch (e) {
        res.json({ error: 'find quiz by _id' });
    }

    try {
        questions = await QuestionsModel.Questions.find({ quiz_id: quizId });
    } catch (e) {
        res.json({ error: 'find all question by quiz_id' });
    }

    /* is last question */
    if (localStorage.length === parseInt(quiz.total)) {
        let userScore = 0;
        let isAnswerCorrect = true;
        /* save answer */
        questions = questions.map((question) => {
            question.answersMap = JSON.parse(question.answers);
            return question;
        });

        for (let i = 0; i < localStorage.length; i++) {
            const answer = JSON.parse(localStorage.getItem(i.toString()));
            /* clear old choose */
            questions[i].answersMap = questions[i].answersMap.map((answer) => {
                answer.is_choose = "0";
                return answer;
            });
            /* check multi correct*/
            if (parseInt(questions[i].multi_correct)) {
                /* answer is not enough */
                if (answer.indexAnswer.length === 1) {
                    isAnswerCorrect = false;
                }
            } else {
                /* answer is over */
                if (answer.indexAnswer.length > 1) {
                    isAnswerCorrect = false;
                }
            }
            /*  */
            for (let j = 0; j < answer.indexAnswer.length; j++) {
                /* check answer is not correct */
                if (questions[i].answersMap[parseInt(answer.indexAnswer[j])].is_correct !== "1") {
                    isAnswerCorrect = false;
                }

                /* user choise this answer */
                questions[i].answersMap[parseInt(answer.indexAnswer[j])].is_choose = "1";
            }
            /* score increase*/
            if (isAnswerCorrect) {
                userScore++;
            }

            isAnswerCorrect = true;
            /* update user's choose */
            try {
                await QuestionsModel.Questions.updateOne({ _id: questions[i]._id }, { answers: JSON.stringify(questions[i].answersMap) });
            } catch (e) {
                res.json({ error: 'update user choose' })
            }

        }

        /* save user_quiz */
        const user = await UsersModel.User.findOne({
            email: res.locals.data.email,
        });

        const userQuiz = {
            user_id: user.id,
            quiz_id: quizId,
            score: userScore.toString(),
        };

        /* check restart quiz */
        let isNewUserQuiz;
        try {
            isNewUserQuiz = await UserQuizModel.UserQuiz.findOne({ quiz_id: quiz.id, user_id: user.id })
        } catch (e) {
            res.json({ error: 'find user quiz' })
        }
        if (isNewUserQuiz) {
            /* update user quiz */
            try {
                await UserQuizModel.UserQuiz.updateOne({ quiz_id: quiz.id, user_id: user.id }, { score: userScore.toString() })
            } catch (e) {
                res.json({ error: 'update user quiz' })
            }

        } else {
            try {
                await UserQuizModel.UserQuiz.create(userQuiz);
            } catch (e) {
                res.json({ error: 'create new user quiz' })
            }
        }

        localStorage.clear();
        res.redirect("/quiz/" + quizId + "/review");
    } else {
        if (req.query.q) {
            res.redirect("/quiz/" + quizId + "?q=" + (parseInt(req.query.q) + 1));
        } else {
            res.redirect("/quiz/" + quizId + "?q=" + (questionNum + 1));
        }
    }
};

/* GET: review quiz */
module.exports.reviewQuiz = async(req, res, next) => {
    const quizId = req.params.quizId;

    let quizIdObj;
    let quiz;
    let questions;

    try {
        quizIdObj = mongoose.Types.ObjectId(quizId.toString());
    } catch (e) {
        res.json({ error: 'convert quiz to ObjectId' });
    }

    try {
        quiz = await QuizesModel.Quizes.findOne({ _id: quizIdObj });
    } catch (e) {
        res.json({ error: 'find quiz by _id' });
    }

    try {
        questions = await QuestionsModel.Questions.find({ quiz_id: quizId });
    } catch (e) {
        res.json({ error: 'find all question by quiz_id' });
    }

    questions = questions.map((question) => {
        question.answersMap = JSON.parse(question.answers);
        return question;
    });

    /* get socore */
    let user;
    let userQuiz;
    try {
        user = await UsersModel.User.findOne({ email: res.locals.data.email });
    } catch (e) {
        res.json({ error: 'find user by email' })
    }

    try {
        userQuiz = await UserQuizModel.UserQuiz.findOne({ user_id: user._id, quiz_id: quizId });
    } catch (error) {
        res.json({ error: 'find user quiz by user_id and quiz_id' })
    }

    res.render("quiz/review_quiz", {
        isLogin: true,
        user: res.locals.data,
        quiz: quiz,
        questions: questions,
        score: userQuiz.score,
    });
};