const passport = require("passport");

exports.authenticate = async (req, res, next) => {
  // Validation in route
  try {
    passport.authenticate("local", { session: false }, (err, {token, user}, info) => {
      if (err || !token) {
        return res.status(401).json(info);
      }
      // Authentication success
      res.send({ token: token, user: user, success: true });
    })(req, res, next);
  } catch (err) {
    next(err);
  }
};