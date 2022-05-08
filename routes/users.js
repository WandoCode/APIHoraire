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

/* PUT update user data */
router.post(
  "/update/:id",
  passport.authenticate("jwt", { session: false }),
  val.new_user_validation,
  val.display_error,
  userIs("self", "admin"),
  findUser,
  userController.update_user
);

/* DELETE user */
router.delete(
  "/delete/:id",
  passport.authenticate("jwt", { session: false }),
  userIs("admin", "self"),
  findUser,
  userController.delete_user
);

/* Post or update a schedule (by id) in user calendar */
router.post(
  "/:id/calendar/add/schedule",
  passport.authenticate("jwt", { session: false }),
  val.new_schedule,
  val.display_error,
  userIs("admin", "self"),
  findUser,
  userController.post_day
);

/* Delete a schedule in user calendar */
router.delete(
  "/:id/calendar/delete/schedule",
  passport.authenticate("jwt", { session: false }),
  val.date,
  val.display_error,
  userIs("admin", "self"),
  findUser,
  userController.delete_schedule
);

/* Post or update a worktime (by id) in user calendar */
router.post(
  "/:id/calendar/add/worktime",
  passport.authenticate("jwt", { session: false }),
  val.workTime,
  val.display_error,
  userIs("admin", "self"),
  findUser,
  userController.post_workTime
);

/* Delete a workTime in user calendar */
router.delete(
  "/:id/calendar/delete/worktime",
  passport.authenticate("jwt", { session: false }),
  val.date,
  val.display_error,
  userIs("admin", "self"),
  findUser,
  userController.delete_workTime
);

//TODO: Créer une route juste pour les operation direct sur WorkTime (get uniquement a priori)
/* Get a workTime by id */
router.get(
    "/get/worktime/:worktimeId",
    userController.get_worktime
);
module.exports = router;