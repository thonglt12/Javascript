const UserModel = require("../models/user.model");
const bcrypt = require("bcrypt");

module.exports.register = (req, res) => {
  res.render("users/register", { success: false });
};

module.exports.login = (req, res) => {
  res.render("users/login", { register: true });
};

module.exports.postRegister = async (req, res) => {
  const pwdHash = await bcrypt.hash(
    req.body.password,
    parseInt(process.env.SALT_ROUNT)
  );

  const user = {
    name: req.body.name,
    email: req.body.email,
    password: pwdHash /* hash password */,
    role: "0",
  };

  /* insert new user */
  const newUser = await UserModel.User.create(user);

  /* alert success register */
  res.render("users/register", { success: true });
};

module.exports.postLogin = async (req, res) => {
  if (res.locals.admin) {
    res.redirect("/admin");
  } else {
    res.redirect("/quiz");
  }
};
