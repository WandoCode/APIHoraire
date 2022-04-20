const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const workTimeSchema = new Schema(
  {
    startDate: { type: Date, require: true },
    endDate: { type: Date, require: true },
    breakTime: { type: Number, min: 0, default: 0 },
  },
  // Add automaticattly a field 'CreatedAt' and 'updatedAt' in mongoDB
  { timestamps: true }
);

workTimeSchema.virtual("totalHourString", function () {
  /* Return a string of the total worked time formatted HH:MM */

  // Get difference in ms
  let deltaDateMs = this.endDate - this.startDate;

  // ms to hh:mm
  let sec = (deltaDateMs / 1000).toFixed(0); // Round to second
  let minute = (sec / 60).toFixed(0) - this.breakTime; // Get total min
  let hour = (minute / 60).toFixed(0); // Get total hours
  let minRemainder = minute % 60; // Get minute remainder

  let hourString = hour < 10 ? `0${hour}` : `${hour}`;
  let minuteString = minRemainder < 10 ? `0${minRemainder}` : `${minRemainder}`;

  return `${hourString}:${minuteString}`;
});

workTimeSchema.methods.totalTime = function () {
  /* Return the total number of minutes of time worked */

  // Get difference in ms
  let deltaDateMs = this.endDate - this.startDate;

  // ms to hh:mm
  let sec = (deltaDateMs / 1000).toFixed(0); // Round to second
  return (sec / 60).toFixed(0) - this.breakTime; // Get total min
};

const workTimeModel = mongoose.model("WorkTime", workTimeSchema);

module.exports = workTimeModel;
