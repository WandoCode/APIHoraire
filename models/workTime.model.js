const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const datasWT = require("../config/datas.json").models.workTime;

const workTimeSchema = new Schema(
  {
    startDate: { type: Date, required: datasWT.startDate.required },
    endDate: { type: Date, required: datasWT.endDate.required },
    breakTime: {
      type: Number,
      min: datasWT.breakTime.min,
      default: datasWT.breakTime.default,
    },
  },
  { timestamps: true }
);

workTimeSchema.virtual("totalHourString").get(function () {
  /* Return a string of the total worked time formatted HH:MM */

  // Get difference in ms
  let deltaDateMs = this.endDate - this.startDate;

  // ms to hh:mm
  let sec = (deltaDateMs / 1000).toFixed(0); // Round to second
  let minute = (sec / 60).toFixed(0) - this.breakTime; // Get total min

  let minRemainder = minute % 60; // Get minute remainder
  let hour = (minute - minRemainder) / 60; // Get total hours

  let hourString = hour < 10 ? `0${Math.abs(hour)}` : `${hour}`;
  let minuteString = minRemainder < 10 ? `0${minRemainder}` : `${minRemainder}`;

  const timeString =
    hour > 0
      ? `${hourString}:${minuteString}`
      : `-${hourString}:${minuteString}`;

  return timeString;
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
