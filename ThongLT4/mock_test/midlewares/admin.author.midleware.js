const jwt = require("jsonwebtoken");

/* midleware: authorizition by cookie */
module.exports.author = (req, res, next) => {
    const token = req.cookies.admin;

    if (!token) {
        res.redirect("/user/login");
        return;
    } else {
        jwt.verify(
            token,
            process.env.ACCESS_TOKEN_SECRET_ADMIN,
            (err, data) => {
                if (err) {
                    res.redirect("/user/login");
                    return;
                } else {
                    next();
                }
            }
        );
    }
};