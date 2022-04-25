const express = require("express");
const router = express.Router();
const passport = require("passport");

const userController = require("../controllers/user.controller");
const val = require("../middleware/validation");
const { findUser } = require("../middleware/helpers");

/* GET users listing. */
router.get("/all", userController.get_all_users);

/* GET a user from db with id */
findUser, router.get("/get/:id", findUser, userController.get_user);

/* POST a new user. */
router.post(
  "/add",
  val.new_user_validation,
  val.display_error,
  userController.post_user
);

/**
 * PUT update user data
 */
router.post(
  "/update/:id",
  val.new_user_validation,
  val.display_error,
  findUser,
  userController.update_user
);

/**
 * DELETE user
 */
router.delete(
  "/delete/:id",
  passport.authenticate("local", { session: false }),
  findUser,
  userController.delete_user
);

/**
 * Post or update a schedule (by id) in user calendar
 */
router.post(
  "/:id/calendar/add/schedule",
  val.new_schedule,
  val.display_error,
  findUser,
  userController.post_day
);

/**
 * Delete a schedule in user calendar
 */
router.delete(
  "/:id/calendar/delete/schedule",
  val.date,
  val.display_error,
  findUser,
  userController.delete_schedule
);

/**
 * Post or update a worktime (by id) in user calendar
 */
router.post(
  "/:id/calendar/add/worktime",
  val.workTime,
  val.display_error,
  findUser,
  userController.post_workTime
);

/**
 * Delete a workTime in user calendar
 */
router.delete(
  "/:id/calendar/delete/worktime",
  val.date,
  val.display_error,
  findUser,
  userController.delete_workTime
);

module.exports = router;
