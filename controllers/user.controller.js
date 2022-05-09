const User = require("../models/user.model");
const WorkTime = require("../models/workTime.model");
const {objectIsInDB, createPathCal, parseDate} = require("../heplers/function");

/* GET all users from db */
exports.get_all_users = async (req, res, next) => {
  try {
    let usersFound = await User.find();

    if (usersFound.length === 0) {
      // TODO change HTML status code
      res.status(400).send({ message: "No users found in db", success: false });
    }

    res
      .status(200)
      .send({ message: "Users found", success: true, data: usersFound });
  } catch (err) {
    next(err);
  }
};

/* GET a user from db with id */
exports.get_user = async (req, res, next) => {
  try {
    let usersFound = req.userByID;
    res
      .status(200)
      .send({ message: "User found", success: true, data: usersFound });
  } catch (err) {
    next(err);
  }
};

/* POST a new user */
exports.post_user = async (req, res, next) => {
  try {
    let { username, password, role = "user" } = req.body;

    // Check if username already exists in db
    let userIsInDB = await objectIsInDB({ username }, User);
    if (userIsInDB) {
      return res
        .status(400)
        .send({message: "Username already exists", success: false });
    }

    // Make a new Calendar for the user
    let newUser = {
      username,
      password,
      calendar: {},
      role,
    };

    let user = await User.create(newUser);

    return res
      .status(201)
      .send({ message: "User created", success: true, userId: user.id});
  } catch (err) {
    next(err);
  }
};

/**
 * PUT update user data
 */
exports.update_user = async (req, res, next) => {
  try {
    let { username, password } = req.body;

    let userFound = req.userByID;

    // If Username change, check if new username is already in db
    if (userFound.username !== username) {
      let usernameIsInDB = await objectIsInDB({ username }, User);
      if (usernameIsInDB) {
        return res
          .status(400)
          .send({ message: "Username already exists", success: false });
      }
    }

    // Process update
    userFound.username = username;
    userFound.password = password;

    await userFound.save();

    return res.status(201).send({ message: "User updated", success: true });
  } catch (err) {
    next(err);
  }
};

/**
 * DELETE user
 */
exports.delete_user = async (req, res, next) => {
  try {
    let user = req.userByID;

    // Process request
    await User.findByIdAndRemove(user.id);

    res
      .status(200)
      .send({ message: "User successfully deleted", success: true });
  } catch (err) {
    next(err);
  }
};

/**
 * Post or update a schedule (by id) in user calendar
 */
exports.post_day = async (req, res, next) => {
  try {
    let { scheduleId, date } = req.body;
    let user = req.userByID;
    let { day, monthIndex, year } = parseDate(date);

    // Create path in user calendar if necessary
    createPathCal(user, { day, monthIndex, year });

    user.calendrier[year][monthIndex][day]["schedule"] = scheduleId;
    user.markModified("calendrier");
    await user.save();

    res.status(200).send({
      success: true,
      message: "Schedule successfully added to the user calendar",
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Delete a schedule in user calendar
 */
exports.delete_schedule = async (req, res, next) => {
  try {
    let { date } = req.body;
    let user = req.userByID;
    let { day, monthIndex, year } = parseDate(date);

    // Try to recover the schedule id instance in user.calendrier.year.month.day.schedule
    let scheduleToDel =
      ((((user.calendrier || {})[year] || {})[monthIndex] || {})[day] || {})[
        "schedule"
      ] || null;

    // No schedule
    if (!scheduleToDel) {
      res.status(400).send({
        message: "No schedule found for the given date",
        success: false,
      });
    }

    // Remove from user calendar instance
    user.calendrier[year][monthIndex][day]["schedule"] = null;
    user.markModified("calendrier");
    await user.save();

    res.status(200).send({
      success: true,
      message: "Schedule successfully deleted from the user calendar",
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Post or update a workTime (by id) in user calendar
 */
exports.post_workTime = async (req, res, next) => {
  let { startDate, endDate, breakTime, date } = req.body;

  try {
    let user = req.userByID;
    let { day, monthIndex, year } = parseDate(date);

    // Create path in user calendar if necessary
    createPathCal(user, { day, monthIndex, year });

    // If worktime already exist at that date, delete it from db
    if (user.calendrier[year][monthIndex][day]["workTime"]) {
      WorkTime.findByIdAndRemove(
        user.calendrier[year][monthIndex][day]["workTime"]
      );
    }

    // Create the new workTime instance in db
    let WT = await WorkTime.create({
      startDate,
      endDate,
      breakTime,
    });

    user.calendrier[year][monthIndex][day]["workTime"] = WT.id;
    user.markModified("calendrier");
    await user.save();

    res.status(200).send({
      success: true,
      message: "Worktime successfully added to the user calendar",
      data: { id: WT.id },
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Delete a workTime in user calendar
 */
exports.delete_workTime = async (req, res, next) => {
  try {
    let { date } = req.body;
    let user = req.userByID;
    let { day, monthIndex, year } = parseDate(date);

    // Try to recover the workTime id instance in user.calendrier.year.month.day.workTime
    let workTimeToDel =
      ((((user.calendrier || {})[year] || {})[monthIndex] || {})[day] || {})[
        "workTime"
      ] || null;

    // No workTime
    if (!workTimeToDel) {
      res.status(400).send({
        message: "No workTime found for the given date",
        success: false,
      });
    }

    // Remove workTime from db and user's calendar instance
    await WorkTime.findByIdAndRemove(workTimeToDel);
    user.calendrier[year][monthIndex][day]["workTime"] = null;
    user.markModified("calendrier");
    await user.save();

    res.status(200).send({
      success: true,
      message: "Worktime successfully deleted from the user calendar and DB",
    });
  } catch (err) {
    next(err);
  }
};

exports.get_worktime = async (req, res, next) => {
  try {
    let {worktimeId} = req.params;
    let workTimeFound = await WorkTime.findById(worktimeId);

    if (!workTimeFound){
      return res.status(400).send({
        message: `WorkTime not found with the given id`,
        success: false,
      });
    }
    res
        .status(200)
        .send({ message: "workTime found", success: true, data: workTimeFound });
  } catch (err) {
    next(err);
  }
};