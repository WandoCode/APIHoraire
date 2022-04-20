const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const calendarSchema = new Schema(
  {
    date: { type: Date, require: true },
    schedule: { type: mongoose.Schema.Types.ObjectId, ref: "Schedule" },
    workTime: { type: mongoose.Schema.Types.ObjectId, ref: "WorkTime" },
  },
  // Add automaticattly a field 'CreatedAt' and 'updatedAt' in mongoDB
  { timestamps: true }
);

const calendarModel = mongoose.model("Calendar", calendarSchema);

module.exports = calendarModel;
