var express = require("express");
var router = express.Router();

const { login, display_error } = require("../middleware/validation");

const indexController = require("../controllers/index.controller");

/* POST Authenticate session */
router.post("/login", login, display_error, indexController.authenticate);

module.exports = router;
