const express = require("express");
const router = express.Router();
const passport = require("passport");

const scheduleController = require("../controllers/schedule.controller");
const { findSchedule } = require("../middleware/helpers");
const { userIs } = require("../middleware/perm");
const val = require("../middleware/validation");

// TODO: test for 'userIs'

/* GET schedule listing. */
router.get("/all", scheduleController.get_all_schedule);

/* GET a schedule by id. */
router.get("/get/:id", findSchedule, scheduleController.get_schedule);

/* POST a new schedule. */
router.post(
  "/add",
  passport.authenticate("jwt", { session: false }),
  userIs("admin"),
  val.schedule,
  val.display_error,
  scheduleController.post_schedule
);

/**
 * PUT update schedule data
 */
router.put(
  "/put/:id",
  passport.authenticate("jwt", { session: false }),
  userIs("admin"),
  val.schedule,
  val.display_error,
  findSchedule,
  scheduleController.put_schedule
);

/**
 * DELETE a schedule
 */
router.delete(
  "/delete/:id",
  passport.authenticate("jwt", { session: false }),
  userIs("admin"),
  findSchedule,
  scheduleController.delete_schedule
);

module.exports = router;
