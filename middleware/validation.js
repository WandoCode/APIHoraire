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
    .isAlphanumeric()
    .isLength({
      min: datasUser.password.minlength,
      max: datasUser.password.maxlength,
    })
    .not()
    .isEmpty(),
  body("calendrier").isMongoId().not().isEmpty(),
  body("role").isIn([...datasUser.role.roles, ""]),
];

exports.calendar = [
  body("date").isDate().not().isEmpty().toDate(),
  body("schedule").isMongoId(),
  body("workTime").isMongoId(),
];

exports.schedule = [
  body("name")
    .trim()
    .isAlphanumeric()
    .isLength({ min: datasSchedule.name.minlength })
    .not()
    .isEmpty(),
  body("workTime").isMongoId(),
];

exports.workTime = [
  body("startDate").isDate().not().isEmpty().toDate(),
  body("endDate").isDate().not().isEmpty().toDate(),
  body("breakTime").isInt({ min: datasWT.breakTime.min }),
];
