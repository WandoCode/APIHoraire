const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const calendarSchema = new Schema(
  {
    date: { type: Date, require: true },
    schedule: { type: mongoose.Schema.Types.ObjectId, ref: "Schedule" },
    workTime: { type: mongoose.Schema.Types.ObjectId, ref: "WorkTime" },
  },
  { timestamps: true }
);

calendarSchema.query.byMonth = function (year, month) {
  // Get all the calendar's datas for a month. Janv = 0
  const dayInMonth = new Date(year, month + 1, 0).getDate();
  return this.where({
    date: {
      // the string passed to mongoose is janv = 1
      $gte: `${year}-${month + 1}-01`,
      $lte: `${year}-${month + 1}-${dayInMonth}`,
    },
  });
};

const calendarModel = mongoose.model("Calendar", calendarSchema);

module.exports = calendarModel;
