const express = require("express");
const router = express.Router();
const passport = require("passport");

const userController = require("../controllers/user.controller");
const val = require("../middleware/validation");
const { findUser } = require("../middleware/helpers");
const { userIs } = require("../middleware/perm");

/* GET users listing. */
router.get("/all", userController.get_all_users);

/* GET a user from db with id */
router.get("/get/:id", findUser, userController.get_user);

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
  passport.authenticate("jwt", { session: false }),
  val.new_user_validation,
  val.display_error,
  findUser,
  userController.update_user
);
//626d3cf7ac9937ea7a353ace
//eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpZCI6IjYyNmQzY2Y3YWM5OTM3ZWE3YTM1M2FjZSIsImV4cGlyZSI6MTY1MTkzMTAyNzM4Nn0.mIJTtsYaGKX2tZGYLUqn7NunUMHQCd0Vg0rlLAmHDR4
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
