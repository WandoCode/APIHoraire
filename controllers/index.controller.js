const passport = require("passport");

exports.authenticate = async (req, res, next) => {
  // Validation in route
  try {
    passport.authenticate("local", { session: false }, (err, token, info) => {
      if (err || !token) {
        return res.status(401).json(info);
      }

      // Authentication success
      res.send({ token: token });
    })(req, res, next);
  } catch (err) {
    next(err);
  }
};
