const User = require("../models/user.model");

exports.objectIsInDB = async (object, model) => {
  // Return true if object (from the given model) is already in DB.
  try {
    let userFound = await model.findOne(object);
    return userFound ? true : false;
  } catch (err) {
    throw err;
  }
};

exports.genStringWithLength = (length) => {
  let result = "";
  for (let i = 0; i < length; i++) {
    result += "a";
  }
  return result;
};
