const User = require("../models/user.model");
const WorkTime = require("../models/workTime.model");

const { objectIsInDB } = require("../heplers/function");

/* GET all users from db */
exports.get_all_users = async (req, res, next) => {
  try {
    let usersFound = await User.find();
    res
      .status(200)
      .send({ message: "Users found", success: true, datas: usersFound });
  } catch (err) {
    next(err);
  }
};

/* GET a user from db with id */
exports.get_user = async (req, res, next) => {
  try {
    let usersFound = await User.findById(req.params.id);

    if (usersFound) {
      res
        .status(200)
        .send({ message: "User found", success: true, datas: usersFound });
    } else {
      res
        .status(400)
        .send({ message: "No user found with the given id", success: false });
    }
  } catch (err) {
    next(err);
  }
};
/* POST a new user */
exports.post_user = async (req, res, next) => {
  // Form validation is made with middleware in ./routes
  try {
    let { username, password, role = "user" } = req.body;

    // Check if username already exists in db
    let userIsInDB = await objectIsInDB({ username }, User);
    if (userIsInDB) {
      // Username is already in db
      return res
        .status(400)
        .send({ message: "Username already exists", success: false });
    }
    // Username is available
    // Make a new Calendar for the user
    let newUser = {
      username,
      password,
      calendar: {},
      role,
    };
    await User.create(newUser);

    return res.status(201).send({ message: "User created", success: true });
  } catch (err) {
    next(err);
  }
};

/**
 * PUT update user data
 */
exports.update_user = async (req, res, next) => {
  // Form validation is made with middleware in ./routes
  let { username, password } = req.body;
  try {
    // Test if the given id is in DB
    let userFound = await User.findById(req.params.id);

    // No user found
    if (!userFound) {
      res
        .status(400)
        .send({ message: "No user found with the given id", success: false });
    }

    // If Username change
    if (userFound.username !== username) {
      // Check if new username is already in db
      let usernameIsInDB = await objectIsInDB({ username }, User);

      // New username already exists
      if (usernameIsInDB) {
        return res
          .status(400)
          .send({ message: "Username already exists", success: false });
      }
    }
    // Process update
    userFound.username = username;
    userFound.password = password;

    // Update db
    await userFound.save();

    // Send success
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
    // Test if the given id is in DB
    let userFound = await User.findById(req.params.id);
    // No user found
    if (!userFound) {
      res
        .status(400)
        .send({ message: "No user found with the given id", success: false });
    }

    // Process request
    await User.findByIdAndRemove(req.params.id);

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
  let { scheduleId, date } = req.body;
  try {
    //Find user with id
    let user = await User.findById(req.params.id);

    // No user found
    if (!user) {
      return res
        .status(400)
        .send({ message: "No user found with the given id", success: false });
    }

    // Create the calendar field
    let day = date.getDate().toString();
    let monthIndex = date.getMonth().toString();
    let year = date.getFullYear().toString();

    // Check if the year, month and day are already in user db
    // Create path if necessary
    if (!user.calendrier[year]) {
      user.calendrier[year] = {};
    }

    if (!user.calendrier[year][monthIndex]) {
      user.calendrier[year][monthIndex] = {};
    }

    if (!user.calendrier[year][monthIndex][day]) {
      user.calendrier[year][monthIndex][day] = {};
    }

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
 * Post or update a workTime (by id) in user calendar
 */
exports.post_workTime = async (req, res, next) => {
  let { startDate, endDate, breakTime, date } = req.body;

  try {
    //Find user with id
    let user = await User.findById(req.params.id);

    // No user found
    if (!user) {
      return res.status(400).send({
        message: "No user found with the given id",
        success: false,
      });
    }

    // Create the calendar field
    // Check if the year, month and day are already in user db
    let day = date.getDate().toString();
    let monthIndex = date.getMonth().toString();
    let year = date.getFullYear().toString();

    // Create path if necessary
    if (!user.calendrier[year]) {
      user.calendrier[year] = {};
    }

    if (!user.calendrier[year][monthIndex]) {
      user.calendrier[year][monthIndex] = {};
    }

    if (!user.calendrier[year][monthIndex][day]) {
      user.calendrier[year][monthIndex][day] = {};
    }

    // Check if worktime already exist à that date
    if (user.calendrier[year][monthIndex][day]["workTime"]) {
      // Delete that instance of worktime from DB
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
