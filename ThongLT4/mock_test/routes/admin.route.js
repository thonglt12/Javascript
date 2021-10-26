const express = require("express");
const router = express.Router();

const multer = require("multer");
const upload = multer({ dest: "./public/uploads/" });

const adminController = require("../controllers/admin.controller");
const adminAuthorMidleware = require("../midlewares/admin.author.midleware");

const adminValidate = require("../validate/admin.validate");

router.get("/", adminAuthorMidleware.author, adminController.index);
router.get("/quiz/add", adminAuthorMidleware.author, adminController.addQuiz);
router.get(
  "/quiz/:quizId/question/add",
  adminAuthorMidleware.author,
  adminController.addQuestion
);
router.get(
  "/quiz/:quizId/read",
  adminAuthorMidleware.author,
  adminController.readQuiz
);
router.get(
  "/quiz/:quizId/update",
  adminAuthorMidleware.author,
  adminController.updateQuiz
);
router.get(
  "/quiz/:quizId/question/:questionId/update",
  adminAuthorMidleware.author,
  adminController.updateQuestion
);

router.post(
  "/quiz/add",
  upload.single("avatar"),
  adminValidate.AddQuiz,
  adminController.addQuizPost
);

router.post(
  "/quiz/:quizId/question/add",
  adminValidate.AddQuestion,
  adminController.addQuestionPost
);

router.post(
  "/quiz/:quizId/update",
  upload.single("avatar"),
  adminValidate.updateQuiz,
  adminController.quizUpdatePost
);

router.post(
  "/quiz/:quizId/question/:questionId/update",
  adminValidate.updateQuestion,
  adminController.updateQuestionPost
);

router.delete("/quiz/:quizId/delete", adminController.deleteQuiz)

module.exports = router;
