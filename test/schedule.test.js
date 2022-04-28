const supertest = require("supertest");
const WorkTime = require("../models/workTime.model");
const Schedule = require("../models/schedule.model");
const scheduleSeed = require("./seed/schedule.seed");

const app = require("../server");

const { setupDB } = require("./test-setup");

// Open a db with the given name, manage db's datas during and after testing. Add seed if needed.
setupDB(scheduleSeed, false);

test("GET All schedules", async () => {
  try {
    let rep = await supertest(app).get(`/schedule/all`).expect(200);

    // Every schedule has been found
    expect(rep.body.datas).toBeDefined();
    expect(rep.body.datas.length).toBe(scheduleSeed.Schedule.length);

    // If no schedule in DB
    await Schedule.deleteMany();
    rep = await supertest(app).get(`/schedule/all`).expect(400);
    expect(rep.body.succes).toBeFalsy();
    expect(rep.body.datas).toBeUndefined();
  } catch (err) {
    throw err;
  }
});

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

test("POST new schedule with wrong datas", async () => {
  try {
    // Wrong name length
    let newSchedule = {
      name: "a",
      startDate: "2022-06-22T10:00",
      endDate: "2022-06-22T17:00",
      breakTime: 60,
    };

    let rep = await supertest(app)
      .post(`/schedule/add`)
      .send(newSchedule)
      .expect(400);

    // Not saved in DB
    expect(rep.body.success).toBeFalsy();
    // Not schedule saved
    let SC = await Schedule.find({ name: newSchedule.name });
    expect(SC.length).toBe(0);
    // No worktime instance saved in DB for the schedule
    let WT = await WorkTime.find({ startDate: Date("2022-06-22T10:00") });
    expect(WT.length).toBe(0);

    /* Wrong breaktime */
    newSchedule = {
      name: "a name",
      startDate: "2022-06-22T10:00",
      endDate: "2022-06-22T17:00",
      breakTime: -2,
    };

    rep = await supertest(app)
      .post(`/schedule/add`)
      .send(newSchedule)
      .expect(400);

    // Not saved in DB
    expect(rep.body.success).toBeFalsy();
    // Not schedule saved
    SC = await Schedule.find({ name: newSchedule.name });
    expect(SC.length).toBe(0);
    // No worktime instance saved in DB for the schedule
    WT = await WorkTime.find({ startDate: Date("2022-06-22T10:00") });
    expect(WT.length).toBe(0);

    /* Wrong date format*/
    newSchedule = {
      name: "a name",
      startDate: "2022-06-22",
      endDate: "2022-06-22T17:00",
      breakTime: 30,
    };

    rep = await supertest(app)
      .post(`/schedule/add`)
      .send(newSchedule)
      .expect(400);

    // Not saved in DB
    expect(rep.body.success).toBeFalsy();
    // Not schedule saved
    SC = await Schedule.find({ name: newSchedule.name });
    expect(SC.length).toBe(0);
    // No worktime instance saved in DB for the schedule
    WT = await WorkTime.find({ startDate: Date("2022-06-22T10:00") });
    expect(WT.length).toBe(0);

    /* EndDate  < startDate */
    newSchedule = {
      name: "a name",
      startDate: "2022-06-22T17:00",
      endDate: "2022-06-22T10:00",
      breakTime: 30,
    };

    rep = await supertest(app)
      .post(`/schedule/add`)
      .send(newSchedule)
      .expect(400);

    // Not saved in DB
    expect(rep.body.success).toBeFalsy();
    // Not schedule saved
    SC = await Schedule.find({ name: newSchedule.name });
    expect(SC.length).toBe(0);
    // No worktime instance saved in DB for the schedule
    WT = await WorkTime.find({ startDate: Date("2022-06-22T10:00") });
    expect(WT.length).toBe(0);

    /* Same name */
    newSchedule = {
      name: "a name",
      startDate: "2022-06-22T10:00",
      endDate: "2022-06-22T17:00",
      breakTime: 30,
    };

    await supertest(app).post(`/schedule/add`).send(newSchedule).expect(200);

    rep = await supertest(app)
      .post(`/schedule/add`)
      .send(newSchedule)
      .expect(400);
    // Not saved in DB
    expect(rep.body.success).toBeFalsy();
    // No schedule saved again
    SC = await Schedule.find({ name: newSchedule.name });
    expect(SC.length).toBe(1);
    // No worktime instance saved in DB for the schedule
    WT = await WorkTime.find({ startDate: "2022-06-22T10:00" });
    expect(WT.length).toBe(1);
  } catch (err) {
    throw err;
  }
});

test("GET schedule by id", async () => {
  try {
    const newSchedule = {
      name: "a schedule",
      startDate: "2022-06-22T10:00",
      endDate: "2022-06-22T17:00",
      breakTime: 60,
    };

    let rep = await supertest(app)
      .post(`/schedule/add`)
      .send(newSchedule)
      .expect(200);

    repB = await supertest(app)
      .get(`/schedule/get/${rep.body.data.id}`)
      .expect(200);

    let SC = await Schedule.findById(rep.body.data.id);

    expect(repB.body.datas.name).toBe(SC.name);
    expect(repB.body.datas._id).toBe(SC.id);
    // ObjectID have a .str attribute
    expect(repB.body.datas.workTime.str).toBe(SC.workTime.str);

    // Wrong ID
    repB = await supertest(app).get(`/schedule/get/${SC.workTime}`).expect(400);
    expect(repB.body.success).toBeFalsy();
  } catch (err) {
    throw err;
  }
});

test.only("PUT schedule by id", async () => {
  try {
    // Test setup
    const newSchedule = {
      name: "a schedule",
      startDate: "2022-06-22T10:00",
      endDate: "2022-06-22T17:00",
      breakTime: 60,
    };

    let rep = await supertest(app)
      .post(`/schedule/add`)
      .send(newSchedule)
      .expect(200);

    // Test begin
    // Change name
    let majSchedule = {
      name: "a schedule 2",
      startDate: "2022-06-22T10:00",
      endDate: "2022-06-22T17:00",
      breakTime: 60,
    };
    repB = await supertest(app)
      .put(`/schedule/put/${rep.body.data.id}`)
      .send(majSchedule)
      .expect(200);

    expect(repB.body.success).toBeTruthy();

    // Check db has been updated
    let SC = await Schedule.findById(rep.body.data.id);
    let WT = await WorkTime.findById(SC.workTime);

    expect(SC.name).toBe(majSchedule.name);
    expect(SC.workTime).toBeDefined();
    expect(WT).toBeDefined();
    expect(Date(WT.startDate)).toBe(Date(newSchedule.startDate));
    expect(Date(WT.endDate)).toBe(Date(newSchedule.endDate));
    expect(WT.breakTime).toBe(newSchedule.breakTime);

    // Change startDate
    majSchedule = {
      name: majSchedule.name,
      startDate: "2022-06-22T12:00",
      endDate: majSchedule.endDate,
      breakTime: majSchedule.breakTime,
    };
    repB = await supertest(app)
      .put(`/schedule/put/${rep.body.data.id}`)
      .send(majSchedule)
      .expect(200);

    expect(repB.body.success).toBeTruthy();

    // Check db has been updated
    SC = await Schedule.findById(rep.body.data.id);
    WT = await WorkTime.findById(SC.workTime);

    expect(SC.name).toBe(majSchedule.name);
    expect(SC.workTime).toBeDefined();
    expect(WT).toBeDefined();
    expect(Date(WT.startDate)).toBe(Date(majSchedule.startDate));
    expect(Date(WT.endDate)).toBe(Date(majSchedule.endDate));
    expect(WT.breakTime).toBe(majSchedule.breakTime);

    // Change endDate
    majSchedule = {
      name: "a schedule 2",
      startDate: "2022-06-22T12:00",
      endDate: "2022-06-22T20:00",
      breakTime: 60,
    };
    repB = await supertest(app)
      .put(`/schedule/put/${rep.body.data.id}`)
      .send(majSchedule)
      .expect(200);

    expect(repB.body.success).toBeTruthy();

    // Check db has been updated
    SC = await Schedule.findById(rep.body.data.id);
    WT = await WorkTime.findById(SC.workTime);

    expect(SC.name).toBe(majSchedule.name);
    expect(SC.workTime).toBeDefined();
    expect(WT).toBeDefined();
    expect(Date(WT.startDate)).toBe(Date(majSchedule.startDate));
    expect(Date(WT.endDate)).toBe(Date(majSchedule.endDate));
    expect(WT.breakTime).toBe(majSchedule.breakTime);

    // Change breakTime
    majSchedule = {
      name: majSchedule.name,
      startDate: majSchedule.startDate,
      endDate: majSchedule.endDate,
      breakTime: 15,
    };
    repB = await supertest(app)
      .put(`/schedule/put/${rep.body.data.id}`)
      .send(majSchedule)
      .expect(200);

    expect(repB.body.success).toBeTruthy();

    // Check db has been updated
    SC = await Schedule.findById(rep.body.data.id);
    WT = await WorkTime.findById(SC.workTime);

    expect(SC.name).toBe(majSchedule.name);
    expect(SC.workTime).toBeDefined();
    expect(WT).toBeDefined();
    expect(Date(WT.startDate)).toBe(Date(majSchedule.startDate));
    expect(Date(WT.endDate)).toBe(Date(majSchedule.endDate));
    expect(WT.breakTime).toBe(majSchedule.breakTime);

    // Wrong name (same than one from the seed)
    majScheduleB = {
      name: "shedule A",
      startDate: majSchedule.startDate,
      endDate: majSchedule.endDate,
      breakTime: majSchedule.breakTime,
    };
    repB = await supertest(app)
      .put(`/schedule/put/${rep.body.data.id}`)
      .send(majScheduleB)
      .expect(400);

    expect(repB.body.success).toBeFalsy();

    // Check db has not been updated
    SC = await Schedule.findById(rep.body.data.id);
    WT = await WorkTime.findById(SC.workTime);

    expect(SC.name).toBe(majSchedule.name);
    expect(SC.workTime).toBeDefined();
    expect(WT).toBeDefined();
    expect(Date(WT.startDate)).toBe(Date(majSchedule.startDate));
    expect(Date(WT.endDate)).toBe(Date(majSchedule.endDate));
    expect(WT.breakTime).toBe(majSchedule.breakTime);

    // Wrong date format
    majScheduleB = {
      name: majSchedule.name,
      startDate: "2022-06-22",
      endDate: majSchedule.endDate,
      breakTime: majSchedule.breakTime,
    };
    repB = await supertest(app)
      .put(`/schedule/put/${rep.body.data.id}`)
      .send(majScheduleB)
      .expect(400);

    expect(repB.body.success).toBeFalsy();

    // Check db has not been updated
    SC = await Schedule.findById(rep.body.data.id);
    WT = await WorkTime.findById(SC.workTime);

    expect(SC.name).toBe(majSchedule.name);
    expect(SC.workTime).toBeDefined();
    expect(WT).toBeDefined();
    expect(Date(WT.startDate)).toBe(Date(majSchedule.startDate));
    expect(Date(WT.endDate)).toBe(Date(majSchedule.endDate));
    expect(WT.breakTime).toBe(majSchedule.breakTime);

    // Wrong breakTime
    majScheduleB = {
      name: majSchedule.name,
      startDate: majSchedule.startDate,
      endDate: majSchedule.endDate,
      breakTime: -5,
    };
    repB = await supertest(app)
      .put(`/schedule/put/${rep.body.data.id}`)
      .send(majScheduleB)
      .expect(400);

    expect(repB.body.success).toBeFalsy();

    // Check db has not been updated
    SC = await Schedule.findById(rep.body.data.id);
    WT = await WorkTime.findById(SC.workTime);

    expect(SC.name).toBe(majSchedule.name);
    expect(SC.workTime).toBeDefined();
    expect(WT).toBeDefined();
    expect(Date(WT.startDate)).toBe(Date(majSchedule.startDate));
    expect(Date(WT.endDate)).toBe(Date(majSchedule.endDate));
    expect(WT.breakTime).toBe(majSchedule.breakTime);

    // Wrong/ ENDdATE<startdate
    majScheduleB = {
      name: majSchedule.name,
      startDate: "2022-07-10T22:00",
      endDate: "2022-07-10T10:00",
      breakTime: majSchedule.breakTime,
    };
    repB = await supertest(app)
      .put(`/schedule/put/${rep.body.data.id}`)
      .send(majScheduleB)
      .expect(400);

    expect(repB.body.success).toBeFalsy();

    // Check db has not been updated
    SC = await Schedule.findById(rep.body.data.id);
    WT = await WorkTime.findById(SC.workTime);

    expect(SC.name).toBe(majSchedule.name);
    expect(SC.workTime).toBeDefined();
    expect(WT).toBeDefined();
    expect(Date(WT.startDate)).toBe(Date(majSchedule.startDate));
    expect(Date(WT.endDate)).toBe(Date(majSchedule.endDate));
    expect(WT.breakTime).toBe(majSchedule.breakTime);
  } catch (err) {
    throw err;
  }
});
