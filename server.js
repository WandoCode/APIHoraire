require("dotenv").config({ path: "./config/.env" });

const createError = require("http-errors");
const express = require("express");
const cookieParser = require("cookie-parser");
const logger = require("morgan");
const passport = require("passport");
const cors = require("cors");
const app = express();

/* Set up a connexion with MongoDB */
if (process.env.NODE_ENV !== "test") require("./config/db.config");

// Start common middleware
app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

/*=================================================*/
/*                  Configure CORS                 */
/*-------------------------------------------------*/
require("./config/cors.config");
app.use(cors());

/***************************************************/

/*=================================================*/
/*                Configure Passport               */
/*-------------------------------------------------*/

app.use(passport.initialize());
require("./config/passport.config");

/***************************************************/

/*=================================================*/
/*                 Configure Routes                */
/*-------------------------------------------------*/
const indexRouter = require("./routes/index");
const usersRouter = require("./routes/users");

app.use("/", indexRouter);
app.use("/users", usersRouter);
/***************************************************/

/*=================================================*/
/*                   Error handler                 */
/*-------------------------------------------------*/

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// Send errors (utile? En prod c'est peut etre utile de juste d'envoyer 'internal error')
app.use(function (err, req, res, next) {
  // send error datas
  res.status(err.status || 500);
  res.send(err);
});
/***************************************************/

module.exports = app;
