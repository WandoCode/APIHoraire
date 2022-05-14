const supertest = require("supertest");
const WorkTime = require("../models/workTime.model");
const Schedule = require("../models/schedule.model");
const scheduleSeed = require("./seed/schedule.seed");
const User = require("../models/user.model");
const app = require("../server");
const datasSchedule = require("../config/datas.json").models.schedule;
const { setupDB } = require("./test-setup");
const { genStringWithLength } = require("../heplers/function");

// Open a db with the given name, manage db's datas during and after testing. Add seed if needed.
setupDB(scheduleSeed, "schedule", true);

const logUser = async (role) => {
  try {
    const userDatas = {
      username: "USerToLog",
      password: "Lorem ipsum1",
      role: role,
    };
    await User.create(userDatas);

    let userLog = await supertest(app)
      .post(`/login`)
      .send({ username: userDatas.username, password: userDatas.password })
      .expect(200);

    return userLog.body.token;
  } catch (err) {
    throw err;
  }
};

const createCompleteSchedule = async () => {
  try {
    let workTimeDatas = {
      startDate: new Date(2022, 3, 20, 7, 0),
      endDate: new Date(2022, 3, 20, 12, 45),
      breakTime: 0,
    };
    let aWorktime = await WorkTime.create(workTimeDatas);
    let scheduleDatas = {
      name: "shedule test",
      workTime: aWorktime.id,
    };

    let aSchedule = await Schedule.create(scheduleDatas);

    return aSchedule;
  } catch (err) {
    throw err;
  }
};
test("GET schedule/all", async () => {
  try {
    /* Case 1 */
    let rep = await supertest(app).get(`/schedule/all`).expect(200);

    expect(rep.body.success).toBeTruthy();
    expect(rep.body.data).toBeDefined();
    expect(Array.isArray(rep.body.data)).toBeTruthy();
    expect(rep.body.data.length).toBe(scheduleSeed.Schedule.length);

    /*  Case 2: no schedule in DB */
    await Schedule.deleteMany();

    rep = await supertest(app).get(`/schedule/all`).expect(400);
    expect(rep.body.success).toBeFalsy();
    expect(rep.body.data).toBeDefined();
    expect(Array.isArray(rep.body.data)).toBeTruthy();
    expect(rep.body.data.length).toBe(0);
  } catch (err) {
    throw err;
  }
});

test("GET schedule/get/:id", async () => {
  try {
    /* Setup */
    let aSchedule = await createCompleteSchedule();

    /* Case 1 */
    let rep = await supertest(app)
      .get(`/schedule/get/${aSchedule.id}`)
      .expect(200);

    expect(rep.body.success).toBeTruthy();
    expect(rep.body.message).toBeDefined();
    expect(rep.body.data).toBeDefined();
    expect(rep.body.data._id).toBe(aSchedule.id);
    expect(rep.body.data.workTime).toBeDefined();
    expect(rep.body.data.endDate).toBeDefined();
    expect(rep.body.data.startDate).toBeDefined();
    expect(rep.body.data.name).toBeDefined();
    expect(rep.body.data.breakTime).toBeDefined();
    expect(rep.body.data.workTime).toBeDefined();

    /*  Case 2: wrong ID */
    await Schedule.deleteMany();

    let repB = await supertest(app)
      .get(`/schedule/get/1231564879846514`)
      .expect(400);

    expect(repB.body.success).toBeFalsy();
    expect(repB.body.data).toBeUndefined();
  } catch (err) {
    throw err;
  }
});

test("POST schedule/add", async () => {
  try {
    /* Test setup */
    let token = await logUser("admin");

    const newSchedule = {
      name: "a schedule",
      startDate: "2022-06-22T10:00",
      endDate: "2022-06-22T17:00",
      breakTime: 60,
    };

    /* Case 1 */
    const rep = await supertest(app)
      .post(`/schedule/add`)
      .set("Authorization", `Bearer ${token}`)
      .send(newSchedule)
      .expect(200);

    expect(rep.body.success).toBeTruthy();
    expect(rep.body.message).toBeDefined();
    expect(rep.body.data).toBeDefined();

    // Check DB
    const SC = await Schedule.findById(rep.body.data.id);
    expect(SC).not.toBeNull();
    expect(SC.name).toBe(newSchedule.name);
    // Correct worktime instance saved in DB
    const WT = await WorkTime.findById(SC.workTime);
    expect(WT).not.toBeNull();

    expect(Date(WT.startDate)).toBe(Date(newSchedule.startDate));
    expect(Date(WT.endDate)).toBe(Date(newSchedule.endDate));
    expect(WT.breakTime).toBe(newSchedule.breakTime);

    /* Case 2: same name */
    const repB = await supertest(app)
      .post(`/schedule/add`)
      .set("Authorization", `Bearer ${token}`)
      .send(newSchedule)
      .expect(400);

    expect(repB.body.success).toBeFalsy();
    expect(repB.body.message).toBeDefined();
    expect(repB.body.data).toBeUndefined();

    // Check DB
    const nbrSc = await Schedule.find({ name: newSchedule.name }).count();
    expect(nbrSc).toBe(1);

    /* Case 3: wrong name length */
    let newScheduleB = {
      ...newSchedule,
      name: genStringWithLength(datasSchedule.name.minlength - 1),
    };

    const repC = await supertest(app)
      .post(`/schedule/add`)
      .set("Authorization", `Bearer ${token}`)
      .send(newScheduleB)
      .expect(400);

    expect(repC.body.validationErrors.errors).toBeDefined();
    expect(repC.body.validationErrors.errors[0].param).toBe("name");

    /* Case 3: wrong breaktime  */
    let newScheduleC = {
      ...newSchedule,
      name: genStringWithLength(datasSchedule.name.minlength), // Good name but different thant other one
      breakTime: -1,
    };

    const repD = await supertest(app)
      .post(`/schedule/add`)
      .set("Authorization", `Bearer ${token}`)
      .send(newScheduleC)
      .expect(400);

    expect(repD.body.validationErrors.errors).toBeDefined();
    expect(repD.body.validationErrors.errors[0].param).toBe("breakTime");

    /* Case 4: wrong startdate  */
    let newScheduleD = {
      ...newSchedule,
      name: genStringWithLength(datasSchedule.name.minlength + 1), // Good name but different thant other one
      startDate: "2022-06-22",
    };

    const repE = await supertest(app)
      .post(`/schedule/add`)
      .set("Authorization", `Bearer ${token}`)
      .send(newScheduleD)
      .expect(400);

    expect(repE.body.validationErrors.errors).toBeDefined();
    expect(repE.body.validationErrors.errors[0].param).toBe("startDate");

    /* Case 5: wrong enddate  */
    let newScheduleF = {
      ...newSchedule,
      name: genStringWithLength(datasSchedule.name.minlength + 2), // Good name but different thant other one
      endDate: "2022-06-22",
    };

    const repG = await supertest(app)
      .post(`/schedule/add`)
      .set("Authorization", `Bearer ${token}`)
      .send(newScheduleF)
      .expect(400);

    expect(repG.body.validationErrors.errors).toBeDefined();
    expect(repG.body.validationErrors.errors[0].param).toBe("endDate");

    /* Case 6: enddate is before startDate*/
    let newScheduleG = {
      ...newSchedule,
      name: genStringWithLength(datasSchedule.name.minlength + 3), // Good name but different thant other one
      endDate: "2022-06-22T10:00",
      startDate: "2022-06-22T17:00",
    };

    const repF = await supertest(app)
      .post(`/schedule/add`)
      .set("Authorization", `Bearer ${token}`)
      .send(newScheduleG)
      .expect(400);

    expect(repF.body.validationErrors.errors).toBeDefined();
    expect(repF.body.validationErrors.errors[0].param).toBe("startDate");
  } catch (err) {
    throw err;
  }
});

test("PUT schedule/put/:id", async () => {
  try {
    /* Test setup */
    const token = await logUser("admin");

    const newSchedule = await createCompleteSchedule();

    /* Case 1: change everything */
    let majSchedule = {
      name: "a schedule 2",
      startDate: "2022-06-22T11:00",
      endDate: "2022-06-22T18:00",
      breakTime: 50,
    };

    let repB = await supertest(app)
      .put(`/schedule/put/${newSchedule.id}`)
      .set("Authorization", `Bearer ${token}`)
      .send(majSchedule)
      .expect(200);

    expect(repB.body.success).toBeTruthy();

    // Check db has been updated
    let SC = await Schedule.findById(newSchedule.id);
    let WT = await WorkTime.findById(SC.workTime);

    expect(SC.name).toBe(majSchedule.name);
    expect(SC.workTime).toBeDefined();
    expect(WT).toBeDefined();
    expect(Date(WT.startDate)).toBe(Date(majSchedule.startDate));
    expect(Date(WT.endDate)).toBe(Date(majSchedule.endDate));
    expect(WT.breakTime).toBe(majSchedule.breakTime);

    /* Case 2: name is already used */
    let majScheduleB = {
      name: "schedule A", // already used in schedule seed
      startDate: "2022-06-22T08:00",
      endDate: "2022-06-22T10:00",
      breakTime: 30,
    };

    let repC = await supertest(app)
      .put(`/schedule/put/${newSchedule.id}`)
      .set("Authorization", `Bearer ${token}`)
      .send(majScheduleB)
      .expect(400);

    expect(repC.body.success).toBeFalsy();
    expect(repC.body.message).toBeDefined();

    // Check db has not been updated
    let SCb = await Schedule.findById(newSchedule.id);
    let WTb = await WorkTime.findById(SCb.workTime);

    expect(SCb.name).toBe(majSchedule.name);
    expect(SCb.workTime).toBeDefined();
    expect(WTb).toBeDefined();
    expect(Date(WTb.startDate)).toBe(Date(majSchedule.startDate));
    expect(Date(WTb.endDate)).toBe(Date(majSchedule.endDate));
    expect(WTb.breakTime).toBe(majSchedule.breakTime);

    /* Case 3: wrong id */

    let repD = await supertest(app)
      .put(`/schedule/put/1231564879846514`)
      .set("Authorization", `Bearer ${token}`)
      .send(majScheduleB)
      .expect(400);

    expect(repD.body.success).toBeFalsy();
    expect(repD.body.message).toBeDefined();

    // Check db has not been updated
    let SCc = await Schedule.findById(newSchedule.id);
    let WTc = await WorkTime.findById(SCc.workTime);

    expect(SCc.name).toBe(majSchedule.name);
    expect(SCc.workTime).toBeDefined();
    expect(WTc).toBeDefined();
    expect(Date(WTc.startDate)).toBe(Date(majSchedule.startDate));
    expect(Date(WTc.endDate)).toBe(Date(majSchedule.endDate));
    expect(WTc.breakTime).toBe(majSchedule.breakTime);
  } catch (err) {
    throw err;
  }
});

test.only("DELETE schedule/delete/:id", async () => {
  try {
    /* Test setup */

    let token = await logUser("admin");

    let newSchedule = await createCompleteSchedule();

    /* Case 1 */
    let repB = await supertest(app)
      .delete(`/schedule/delete/${newSchedule.id}`)
      .set("Authorization", `Bearer ${token}`)
      .expect(200);

    expect(repB.body.success).toBeTruthy();
    expect(repB.body.message).toBeDefined();
    expect(repB.body.data).toBeUndefined();

    let SC = await Schedule.findById(newSchedule.id);
    let WT = await WorkTime.findById(newSchedule.workTime);

    expect(SC).toBeNull();
    expect(WT).toBeNull();

    /* Case 2: wrong id */
    let newScheduleB = await createCompleteSchedule();

    let repC = await supertest(app)
      .delete(`/schedule/delete/${23123546854246}`)
      .set("Authorization", `Bearer ${token}`)
      .expect(400);

    expect(repC.body.success).toBeFalsy();
    expect(repC.body.message).toBeDefined();
    expect(repC.body.data).toBeUndefined();

    let SCb = await Schedule.findById(newScheduleB.id);
    let WTb = await WorkTime.findById(newScheduleB.workTime);

    expect(SCb).not.toBeNull();
    expect(WTb).not.toBeNull();
  } catch (err) {
    throw err;
  }
});