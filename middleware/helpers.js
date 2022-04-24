const User = require("../models/user.model");

exports.findUser = async (req, res, next) => {
  //Find user with id
  let user = await User.findById(req.params.id);

  // No instance found
  if (!user) {
    return res.status(400).send({
      message: `User not found with the given id`,
      success: false,
      user: user,
      id: req.params.id,
    });
  }

  // send instance to next middleware
  req.user = user;
  next();
};
