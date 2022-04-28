const User = require("../models/user.model");
const Schedule = require("../models/schedule.model");

exports.findUser = async (req, res, next) => {
  try {
    //Find user with id
    let user = await User.findById(req.params.id);

    // No instance found
    if (!user) {
      return res.status(400).send({
        message: `User not found with the given id`,
        success: false,
      });
    }

    // send instance to next middleware
    req.user = user;
    next();
  } catch (err) {
    res.status(400).send({ message: "unknown error" });
  }
};

exports.findSchedule = async (req, res, next) => {
  try {
    //Find schedule with id
    let schedule = await Schedule.findById(req.params.id);

    // No instance found
    if (!schedule) {
      return res.status(400).send({
        message: `Schedule not found with the given id`,
        success: false,
      });
    }

    // send instance to next middleware
    req.schedule = schedule;
    next();
  } catch (err) {
    res.status(400).send({ message: "unknown error" });
  }
};
