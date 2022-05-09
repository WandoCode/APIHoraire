const User = require("../models/user.model");
const Schedule = require("../models/schedule.model");

// Find user with params's ID
exports.findUser = async (req, res, next) => {
  try {
    let user = await User.findById(req.params.id, '-password');

    if (!user) {
      return res.status(400).send({
        message: `User not found with the given id`,
        success: false,
      });
    }

    req.userByID = user;
    next();
  } catch (err) {
    res.status(400).send({ message: "unknown error", success:false });
  }
};

// Find schedule with params's ID
exports.findSchedule = async (req, res, next) => {
  try {
    let schedule = await Schedule.findById(req.params.id);

    if (!schedule) {
      return res.status(400).send({
        message: `Schedule not found with the given id`,
        success: false,
      });
    }

    req.schedule = schedule;
    next();
  } catch (err) {
    res.status(400).send({ message: "unknown error", success:false });
  }
};