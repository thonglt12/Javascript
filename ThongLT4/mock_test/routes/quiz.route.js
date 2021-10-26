const express = require("express");
const router = express.Router();

const quizController = require("../controllers/quiz.controller");
const quizMidleware = require("../midlewares/quiz.author.midleware")

const quizValidate = require("../validate/quiz.validate")

router.get('/', quizMidleware.quiz, quizController.index)
router.get('/:quizId', quizMidleware.quiz, quizController.quiz)
router.get('/:quizId/review', quizMidleware.quiz, quizController.reviewQuiz)

router.post('/:quizId', quizMidleware.quiz, quizValidate.quiz, quizController.quizPost)
module.exports = router;