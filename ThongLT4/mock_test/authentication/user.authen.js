const UserModel = require("../models/user.model");
const bcrypt = require("bcrypt");


/* check email existed in database */
module.exports.register = async(req, res, next) => {
    const user = await UserModel.User.findOne({
        email: req.body.email,
    });
    /* email exist in database */
    if (user) {
        res.render("users/register", {
            errors: ["email does exist"],
            values: req.body,
        });
        return;
    }

    next();
};

/* check email and password is correct*/
module.exports.login = async(req, res, next) => {
    const errors = [];

    const user = await UserModel.User.findOne({ email: req.body.email });

    if (!user) {
        errors.push("email is not exist");
    } else if (
        true !== (await bcrypt.compare(req.body.password, user.password))
    ) {
        /* compare password */
        errors.push("password is not correct");
    }

    if (errors.length) {
        res.render("users/login", {
            errors: errors,
            values: req.body,
        });
        return;
    }

    if (parseInt(user.role) === 1) {
        /* admin login */
        res.locals.admin = true;
    }

    next();
};