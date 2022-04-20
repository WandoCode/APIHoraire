const supertest = require("supertest");
const Calendar = require("../models/calendrier.model");
const Schedule = require("../models/schedule.model");
const WorkTime = require("../models/workTime.model");

const app = require("../server");

const { setupDB } = require("./test-setup");

// Open a db with the given name, manage db's datas during and after testing. Add seed if needed.
setupDB("Schedule", null, false);

/*     workTime model's method and virtual     */
/*=============================================*/
test("Test custom query of Calendar's model", async () => {
  try {
    let worktimeA = await WorkTime.create({
      startDate: new Date(2022, 3, 20, 7, 0),
      endDate: new Date(2022, 3, 20, 12, 15),
      breakTime: 25,
    });

    let sheduleA = await Schedule.create({
      name: "shedule test",
      workTime: worktimeA.id,
    });

    await Calendar.create({
      date: new Date(2022, 3, 10),
      workTime: worktimeA.id,
      shedule: sheduleA.id,
    });

    await Calendar.create({
      date: new Date(2022, 3, 1),
      workTime: worktimeA.id,
      shedule: sheduleA.id,
    });

    await Calendar.create({
      date: new Date(2022, 3, 30),
      workTime: worktimeA.id,
      shedule: sheduleA.id,
    });

    await Calendar.create({
      date: new Date(2022, 2, 31),
      workTime: worktimeA.id,
      shedule: sheduleA.id,
    });

    let responseA = await Calendar.find().byMonth(2022, 3);

    expect(Array.isArray(responseA)).toBeTruthy();
    expect(responseA.length).toBe(3);

    let responseB = await Calendar.find().byMonth(2022, 2);
    expect(Array.isArray(responseB)).toBeTruthy();
    expect(responseB.length).toBe(1);

    let responseC = await Calendar.find().byMonth(2022, 4);
    expect(Array.isArray(responseC)).toBeTruthy();
    expect(responseC.length).toBe(0);
  } catch (err) {
    throw err;
  }
});
