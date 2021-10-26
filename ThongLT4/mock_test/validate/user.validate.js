var validator = require("email-validator");

/* validate email and password */
module.exports.register = (req, res, next) => {
    const errors = [];

    /* name empty */
    if (!req.body.name) {
        errors.push("name is required");
    }

    /* email empty */
    if (!req.body.email) {
        errors.push("email is required");
    } else if (false === validator.validate(req.body.email)) {
        /* validate format email */
        errors.push("email format is not correct");
    }

    /* password empty */
    if (!req.body.password) {
        errors.push("password is required");
    } else if (req.body.password.length < 8) {
        errors.push("password is least 8 characters");
    }


    /* confirm password is empty */
    if (!req.body.confirm_password) {
        errors.push("confirm password is required");
    } else if (req.body.password != req.body.confirm_password) {
        /* compare password and confirf */
        errors.push("confirm password is not correct");
    }

    /* render errors */
    if (errors.length) {
        res.render("users/register", {
            errors: errors,
            values: req.body,
        });
        return;
    }
    next();
};


/* validate login */
module.exports.login = (req, res, next) => {
    const errors = [];
    /* email empty */
    if (!req.body.email) {
        errors.push("email is required");
    } else if (false === validator.validate(req.body.email)) {
        /* validate format email */
        errors.push("email format is not correct");
    }

    /* password empty */
    if (!req.body.password) {
        errors.push("password is required");
    }

    /* render errors */
    if (errors.length) {
        res.render("users/login", {
            errors: errors,
            values: req.body,
        });
        return;
    }
    next();
}