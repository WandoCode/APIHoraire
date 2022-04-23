const supertest = require("supertest");
const WorkTime = require("../models/workTime.model");
const Schedule = require("../models/schedule.model");
const scheduleSeed = require("./seed/schedule.seed");

const app = require("../server");

const { setupDB } = require("./test-setup");

// Open a db with the given name, manage db's datas during and after testing. Add seed if needed.
setupDB(scheduleSeed, false);

test("POST new schedule are added correctly", async () => {
  try {
    const newSchedule = {
      name: "a schedule",
      startDate: "2022-06-22T10:00",
      endDate: "2022-06-22T17:00",
      breakTime: 60,
    };
    const rep = await supertest(app)
      .post(`/schedule/add`)
      .send(newSchedule)
      .expect(200);

    // Saved in DB
    expect(rep.body.success).toBeTruthy();
    // Correct datas
    const SC = await Schedule.findById(rep.body.data.id);
    expect(SC).not.toBeNull();

    expect(SC.name).toBe(newSchedule.name);

    // Correct worktime instance saved in DB
    const WT = await WorkTime.findById(SC.workTime);
    expect(WT).not.toBeNull();

    expect(Date(WT.startDate)).toBe(Date(newSchedule.startDate));
    expect(Date(WT.endDate)).toBe(Date(newSchedule.endDate));
    expect(WT.breakTime).toBe(newSchedule.breakTime);
  } catch (err) {
    throw err;
  }
});

// Test unique for schedule name
//test startDate < endDate = error
