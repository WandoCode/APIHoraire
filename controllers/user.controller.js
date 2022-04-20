const User = require("../models/user.model");
const { objectIsInDB } = require("../heplers/function");
const passport = require("passport");

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
        .status(204)
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
    let { username, password } = req.body;

    // Check if username already exists in db
    let userIsInDB = await objectIsInDB({ username }, User);
    if (userIsInDB) {
      // Username is already in db
      return res
        .status(400)
        .send({ message: "Username already exists", success: false });
    }
    // Save new user in db
    await User.create({ username, password });

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
        .status(204)
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
        .status(204)
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
