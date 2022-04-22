const Schedule = require("../models/schedule.model");
const WorkTime = require("../models/workTime.model");
const { objectIsInDB } = require("../heplers/function");

/* POST a new schedule. */
exports.post_schedule = async (req, res, next) => {
  try {
    let { name, startDate, endDate, breakTime } = req.body;

    // "name" must be unique
    let nameExists = await objectIsInDB({ name }, Schedule);
    if (nameExists) {
      // name is already in db
      return res
        .status(400)
        .send({ message: "Name already exists", success: false });
    }

    // startDate must be before endDate
    if (startDate >= endDate) {
      return res.status(400).send({
        message: "Starting date should be before end date",
        success: false,
      });
    }

    // Create a new workTime instance
    let worktime = await WorkTime.create({
      startDate,
      endDate,
      breakTime,
    });

    // Create a schedule instance
    let schedule = await Schedule.create({ name, workTime: worktime.id });
    res.status(200).send({
      message: "Schedule added",
      success: true,
      data: { id: schedule.id },
    });
  } catch (err) {
    next(err);
  }
};
