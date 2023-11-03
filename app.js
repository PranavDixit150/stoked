var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var fileupload = require("express-fileupload");
var logger = require("morgan");
var db = require("./connection/db");
const dotenv = require("dotenv").config({});
// var port = process.env.PORT;

const port = 8001;

var indexRouter = require("./routes/index");
var usersRouter = require("./routes/users");

var app = express();
// dotenv.config();
// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "jade");
app.use(fileupload());

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

app.use("/", indexRouter);
app.use("/users", usersRouter);

app.listen(port, () => {
  console.log(`Server is listening on ${port}`);
});

module.exports = app;
