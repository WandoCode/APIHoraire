const Schedule = require("../models/schedule.model");
const WorkTime = require("../models/workTime.model");
const { objectIsInDB } = require("../heplers/function");

/* GET schedule listing. */
exports.get_all_schedule = async (req, res, next) => {
  try {
    let scheduleFound = await Schedule.find();

    if (scheduleFound.length === 0) {
      res.status(400).send({
        message: "No schedule found in db",
        success: false,
        data: scheduleFound,
      });
    }

    res.status(200).send({
      message: "Schedules found",
      success: true,
      datas: scheduleFound,
    });
  } catch (err) {
    next(err);
  }
};

/* GET a schedule by id. */
exports.get_schedule = async (req, res, next) => {
  try {
    // Via middleware findSchedule
    let scheduleFound = req.schedule;

    res.status(200).send({
      message: "Schedules found",
      success: true,
      datas: scheduleFound,
    });
  } catch (err) {
    next(err);
  }
};

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

/**
 * PUT update schedule data
 */
exports.put_schedule = async (req, res, next) => {
  try {
    let { name, startDate, endDate, breakTime } = req.body;
    let oldSchedule = req.schedule;

    // If name change, new "name" must be unique
    if (oldSchedule.name !== name) {
      let nameExists = await objectIsInDB({ name }, Schedule);
      if (nameExists) {
        // name is already in db
        return res
          .status(400)
          .send({ message: "Name already exists", success: false });
      }

      // Process name update
      await Schedule.findByIdAndUpdate(oldSchedule.id, { name: name });
    }

    // if breaktime or end or start date change, worktime instance must update
    let workTimeID = oldSchedule.workTime;
    let oldWorkTime = await WorkTime.findById(workTimeID);
    if (
      Date(startDate) !== Date(oldWorkTime.startDate) ||
      Date(endDate) !== Date(oldWorkTime.endDate) ||
      breakTime !== oldWorkTime.breakTime
    ) {
      let worktime = {
        startDate,
        endDate,
        breakTime,
      };
      await WorkTime.findByIdAndUpdate(workTimeID, worktime);
    }

    res.status(200).send({
      message: "Schedule updated",
      success: true,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * DELETE a schedule
 */
exports.delete_schedule = async (req, res, next) => {
  try {
    // Via middleware findSchedule
    let scheduleFound = req.schedule;

    // Delete associated woktime
    await WorkTime.findByIdAndRemove(scheduleFound.workTime);

    // Delete schedule instance
    await Schedule.findByIdAndRemove(scheduleFound.id);

    res.status(200).send({
      message: "Schedules deleted",
      success: true,
    });
  } catch (err) {
    next(err);
  }
};
