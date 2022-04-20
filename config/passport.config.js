const passport = require("passport");
const LocalStrategy = require("passport-local");

const User = require("../models/user.model");

// Define authentication strategy
passport.use(
  new LocalStrategy(function verify(username, password, done) {
    User.findOne({ username: username }, function (err, user) {
      if (err) {
        return done(err);
      }
      if (!user) {
        return done(null, false, {
          message: "Incorrect username or password",
          success: false,
        });
      }
      if (!user.verifyPassword(password)) {
        return done(null, false, {
          message: "Incorrect username or password",
          success: false,
        });
      }
      //Success
      return done(null, user);
    });
  })
);
