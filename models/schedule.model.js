const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const dataSchedule = require("../config/datas.json").models.schedule;

const scheduleSchema = new Schema(
  {
    name: {
      type: String,
      required: dataSchedule.name.required,
      minlength: dataSchedule.name.minlength,
      unique: dataSchedule.name.unique,
    },
    workTime: { type: mongoose.Schema.Types.ObjectId, ref: "WorkTime" },
  },
  { timestamps: true }
);

const scheduleModel = mongoose.model("Schedule", scheduleSchema);

module.exports = scheduleModel;
