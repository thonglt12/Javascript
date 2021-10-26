const jwt = require("jsonwebtoken");

module.exports.indexUserAuthor = (req, res, next) => {
  const tokenUser = req.cookies.user;

  if(!tokenUser)
  {
    next();
  }
  else
  {
    jwt.verify(tokenUser, process.env.ACCESS_TOKEN_SECRET_USER, (err, data) => {
      if (err) {
        next();
      } else {
        res.redirect("/quiz");
        return;
      }
    });
  }

};

module.exports.indexAdminAuthor = (req, res, next) => {
  const tokenAdmin = req.cookies.admin;

  if(!tokenAdmin)
  {
    next();
  }
  else
  {
    jwt.verify(tokenAdmin, process.env.ACCESS_TOKEN_SECRET_ADMIN, (err, data) => {
      if (err) {
        next();
      } else {
        res.redirect("/admin");
        return;
      }
    });
  }
};


