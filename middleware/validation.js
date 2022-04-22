const { body, validationResult } = require("express-validator");
const datasUser = require("../config/datas.json").models.users;
const datasSchedule = require("../config/datas.json").models.schedule;
const datasWT = require("../config/datas.json").models.workTime;

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
    .isAlphanumeric()
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

exports.login = [
  body("username")
    .trim()
    .isAlphanumeric()
    .isLength({
      min: datasUser.username.minlength,
      max: datasUser.username.maxlength,
    })
    .not()
    .isEmpty(),
  body("password").trim().not().isEmpty(),
];

exports.schedule = [
  body("name")
    .trim()
    .isAlphanumeric("en-US", { ignore: " -_" })
    .isLength({ min: datasSchedule.name.minlength })
    .not()
    .isEmpty(),
  body("startDate").isISO8601().not().isEmpty().toDate(),
  body("endDate").isISO8601().not().isEmpty().toDate(),
  body("breakTime").isInt({ min: datasWT.breakTime.min }),
];

exports.new_schedule = [
  body("scheduleId").isMongoId().not().isEmpty(),
  body("date").isDate().not().isEmpty().toDate(),
];
exports.workTime = [
  body("startDate").isISO8601().not().isEmpty().toDate(),
  body("endDate").isISO8601().not().isEmpty().toDate(),
  body("breakTime").isInt({ min: datasWT.breakTime.min }),
];
