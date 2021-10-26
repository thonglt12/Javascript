/* dotenv */
require("dotenv").config();
/* require library */

const express = require("express");
const mongoose = require("mongoose");
var cookieParser = require("cookie-parser");
var methodOverride = require('method-override')


/* require routes */
const userRoute = require("./routes/user.route");
const quizRoute = require("./routes/quiz.route");
const adminRoute = require("./routes/admin.route");

/* require midleware */

const authorMidleware = require("./midlewares/author.midleware");


/* require model */
const QuizesModel = require('./models/quiz.model')


/* start express */
const port = 3000;
const app = express();

/* connect database */
mongoose.connect(process.env.MONGO_URL);

/* sử dụng pug để render code HTML */
app.engine("pug", require("pug").__express);
app.set("view engine", "pug");
app.set("views", "./views");

/* req.body */
app.use(express.json()); // for parsing application/json
app.use(express.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded
app.use(cookieParser()); /* cookies parser */
// override with POST having ?_method=DELETE
app.use(methodOverride('_method'))
//static files
app.use(express.static("./public"));


app.get(
  "/",
  authorMidleware.indexUserAuthor,
  authorMidleware.indexAdminAuthor,
  async function (req, res) {

    const quizes = await QuizesModel.Quizes.find()

    res.render("index", {quizes: quizes});
  }
);

/* sử dụng route */
app.use("/user", userRoute);
app.use("/quiz", quizRoute);
app.use("/admin", adminRoute);

app.listen(port, () => {
  console.log(`App listening at http://localhost:${port}`);
});
