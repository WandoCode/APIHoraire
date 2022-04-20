var express = require("express");
var router = express.Router();

const {
  new_user_validation,
  display_error,
} = require("../middleware/validation");

const indexController = require("../controllers/index.controller");

/* POST Authenticate session */
router.get(
  "/auth",
  new_user_validation,
  display_error
  //passport.authenticate("local")
);

module.exports = router;
