const express = require("express");
const router = express.Router();
const passport = require("passport");

const scheduleController = require("../controllers/schedule.controller");

const val = require("../middleware/validation");

/* GET schedule listing. */
/* GET a schedule by id. */

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
