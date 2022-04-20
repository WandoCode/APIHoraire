const { body, validationResult } = require("express-validator");
const datasUser = require("../config/datas.json").models.users;

/* Middleware to display errors */
exports.display_error = (req, res, next) => {
  // Retreives errors from validation
  const errors = validationResult(req) || [];

  // Return errors found during validation
  if (!errors.isEmpty()) {
    return res.status(400).send(errors);
  }
  return next();
};

/* VALIDATION CHAIN */
// New user form validation
exports.new_user_validation = [
  body("username")
    .trim()
    .isLength({
      min: datasUser.username.minlength,
      max: datasUser.username.maxlength,
    })
    .not()
    .isEmpty(),
  body("password")
    .trim()
    .isLength({
      min: datasUser.password.minlength,
      max: datasUser.password.maxlength,
    })
    .not()
    .isEmpty(),
];
