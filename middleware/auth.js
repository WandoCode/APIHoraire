const passport = require("passport");
const LocalStrategy = require("passport-local");
const passportJWT = require("passport-jwt");
const ExtractJwt = passportJWT.ExtractJwt;
const JWTStrategy = passportJWT.Strategy;
const JWT = require("jwt-simple");

const cfg = require("../config/auth.config");
const User = require("../models/user.model");

// Define local authentication strategy (auth from a login page)
passport.use(
  new LocalStrategy(async function (username, password, done) {
    try{
    let user = await User.findOne({ username: username });
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
    // Create a token for the session
    let payload = {
      id: user.id,
      expire: Date.now() + 1000 * 60 * 60 * 24 * 7, // 7days
    };
    let token = JWT.encode(payload, cfg.jwtSecret);
    user.password = undefined
    return done(null, {token, user});
      }

        catch (err){
  return done(err);
    }
  }
))

// Define jwt authentication strategy (keep login alive)
const params = {
  secretOrKey: cfg.jwtSecret,
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken("jwt"),
};

passport.use(
  new JWTStrategy(params, function (payload, done) {
    User.findById(payload.id, function (err, user) {
      if (err) {
        return done(new Error("UserNotFound"), null);
      } else if (payload.expire <= Date.now()) {
        return done(new Error("TokenExpired"), null);
      } else {
        return done(null, user);
      }
    });
  })
);