const WorkTime = require("../../models/workTime.model");

let workTimeA = new WorkTime({
  startDate: new Date(2022, 3, 20, 7, 0),
  endDate: new Date(2022, 3, 20, 12, 45),
  breakTime: 0,
});

let workTimeB = new WorkTime({
  startDate: new Date(2022, 3, 20, 7, 0),
  endDate: new Date(2022, 3, 20, 13, 0),
  breakTime: 0,
});

let workTimeC = new WorkTime({
  startDate: new Date(2022, 3, 20, 7, 0),
  endDate: new Date(2022, 3, 20, 12, 15),
  breakTime: 0,
});

let workTimeD = new WorkTime({
  startDate: new Date(2022, 3, 20, 7, 45),
  endDate: new Date(2022, 3, 20, 12, 45),
  breakTime: 30,
});

module.exports = {
  User: [
    {
      username: "Zello",
      password: "12345678",
      role: "admin",
    },
  ],
  Schedule: [
    {
      name: "shedule A",
      workTime: workTimeA.id,
    },
    {
      name: "shedule B",
      workTime: workTimeB.id,
    },
    {
      name: "shedule C",
      workTime: workTimeC.id,
    },
    {
      name: "shedule D",
      workTime: workTimeD.id,
    },
  ],
};
