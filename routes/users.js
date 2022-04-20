const express = require("express");
const router = express.Router();
const passport = require("passport");

const userController = require("../controllers/user.controller");
const {
  new_user_validation,
  display_error,
} = require("../middleware/validation");

/* GET users listing. */
router.get("/all", userController.get_all_users);

/* GET a user from db with id */
router.get("/get/:id", userController.get_user);

/* POST a new user. */
router.post(
  "/add",
  new_user_validation,
  display_error,
  userController.post_user
);

/**
 * PUT update user data
 */
router.post(
  "/update/:id",
  new_user_validation,
  display_error,
  userController.update_user
);

/**
 * DELETE user
 */
router.delete(
  "/delete/:id",
  passport.authenticate("local", { session: false }),
  userController.delete_user
);

module.exports = router;
