const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const scheduleSchema = new Schema(
  {
    name: { type: String, required: true, unique: true },
    workTime: { type: mongoose.Schema.Types.ObjectId, ref: "WorkTime" },
  },
  // Add automaticattly a field 'CreatedAt' and 'updatedAt' in mongoDB
  { timestamps: true }
);

const scheduleModel = mongoose.model("Schedule", scheduleSchema);

module.exports = scheduleModel;
