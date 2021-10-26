const express = require("express");
const router = express.Router();

const userController = require("../controllers/user.controller");
const userValidate = require("../validate/user.validate");
const userAuthentication = require("../authentication/user.authen");
const userAuthorization = require("../authorization/user.author");

const authorMidleware = require("../midlewares/author.midleware");

router.get("/register", authorMidleware.indexUserAuthor, userController.register);
router.post(
  "/register",
  userValidate.register,
  userAuthentication.register,
  userController.postRegister
);
router.get("/login", authorMidleware.indexUserAuthor, userController.login);
router.post(
  "/login",
  userValidate.login,
  userAuthentication.login,
  userAuthorization.login,
  userController.postLogin
);

module.exports = router;
