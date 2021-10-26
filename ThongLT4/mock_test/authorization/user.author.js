const jwt = require("jsonwebtoken");
const UserModel = require("../models/user.model");

module.exports.login = async(req, res, next) => {
    const user = await UserModel.User.findOne({ email: req.body.email });

    /* create access token */
    const data = {
        name: user.name,
        email: user.email,
    };

    if (res.locals.admin) {
        const accessTokenAdmin = jwt.sign(
            data,
            process.env.ACCESS_TOKEN_SECRET_ADMIN, {
                expiresIn: "3600s",
            }
        );
        /* create cookie store admin access token */
        res.cookie("admin", accessTokenAdmin);
        next();
    } else {
        const accessTokenUser = jwt.sign(
            data,
            process.env.ACCESS_TOKEN_SECRET_USER, {
                expiresIn: "3600s",
            }
        );
        /* create cookie store user access token */
        res.cookie("user", accessTokenUser);
        next();
    }
};