const express = require("express");
const router = express.Router();
const passport = require("passport");

const scheduleController = require("../controllers/schedule.controller");
const { findSchedule } = require("../middleware/helpers");

const val = require("../middleware/validation");

/* GET schedule listing. */
router.get("/all", scheduleController.get_all_schedule);

/* GET a schedule by id. */
router.get("/get/:id", findSchedule, scheduleController.get_schedule);

/* POST a new schedule. */
router.post(
  "/add",
  val.schedule,
  val.display_error,
  scheduleController.post_schedule
);

/**
 * PUT update schedule data
 */

/**
 * DELETE a schedule
 */

module.exports = router;
