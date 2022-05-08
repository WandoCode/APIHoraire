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

exports.createPathCal = (user, { day, monthIndex, year }) => {
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
};
/**
 *
 * @param date
 * @returns the date parsed in an object of string { day, monthIndex, year }
 */
exports.parseDate = (date) => {
  let day = date.getDate().toString();
  let monthIndex = date.getMonth().toString();
  let year = date.getFullYear().toString();
  return { day, monthIndex, year };
};
