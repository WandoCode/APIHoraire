const { body, validationResult } = require("express-validator");
const datasUser = require("../config/datas.json").models.users;
const datasSchedule = require("../config/datas.json").models.schedule;
const datasWT = require("../config/datas.json").models.workTime;

/* Middleware to display errors */
exports.display_error = (req, res, next) => {
  const errors = validationResult(req) || [];

  if (!errors.isEmpty()) {
    return res.status(400).send({ validationErrors: errors });
  }

  return next();
};

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

exports.login = [
  body("username")
    .trim()
    .isAlphanumeric()
    .isLength({
      min: datasUser.username.minlength,
      max: datasUser.username.maxlength,
    })
    .withMessage(
      `Username have to be ${datasUser.username.minlength} - ${datasUser.username.maxlength} length`
    )
    .not()
    .isEmpty(),
  body("password")
    .trim()
    .isLength({
      min: datasUser.password.minlength,
      max: datasUser.password.maxlength,
    })
    .not()
    .isEmpty()
    .withMessage("password field is empty"),
];

exports.schedule = [
  body("name")
    .trim()
    .isAlphanumeric("en-US", { ignore: " -_" })
    .isLength({ min: datasSchedule.name.minlength })
    .not()
    .isEmpty(),
  body("startDate").isISO8601().not().isEmpty().not().isDate().toDate(),
  body("endDate").isISO8601().not().isEmpty().not().isDate().toDate(),
  body("breakTime").isInt({ min: datasWT.breakTime.min }),
  // Check startDate is < than endDate
  body("startDate").custom((val, { req }) => {
    if (val >= req.body.endDate)
      throw new Error("StartDate must be before endDate");
    return true;
  }),
];

exports.new_schedule = [
  body("scheduleId").isMongoId().not().isEmpty(),
  body("date").isDate().not().isEmpty().toDate(),
];

// isISO8601() allows "yyyy-mm-ddThh:mm", isDate() allow only "yyyy-mm-dd"
exports.workTime = [
  // I want time here
  body("startDate").isISO8601().not().isEmpty().not().isDate().toDate(),
  // And here
  body("endDate").isISO8601().not().isEmpty().toDate().not().isDate(),
  body("breakTime").isInt({ min: datasWT.breakTime.min }),
  // No time needed here
  body("date").isDate().not().isEmpty().toDate(),
  // Check startDate is < than endDate
  body("startDate").custom((val, { req }) => {
    if (val >= req.body.endDate) {
      throw new Error("StartDate must be before endDate");
    }
    return true;
  }),
];

exports.date = body("date").isDate().not().isEmpty().toDate();