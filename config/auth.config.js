require("dotenv").config({ path: "../config/.env" });

module.exports = {
  "jwtSecret": process.env.JWTSECRET,
  "jwtSession": {
    "session": false,
  },
  "localSession": { "session": false },
};