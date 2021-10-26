const jwt = require("jsonwebtoken");

/* midleware: authorizition user by cookie*/
module.exports.quiz = async(req, res, next) => {
    const token = req.cookies.user;

    if (!token) {
        return res.redirect("/user/login");
    }

    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET_USER, async(err, data) => {
        if (err) return res.redirect("/user/login");
        else {
            res.locals.data = data;
            next();
        }
    });
};