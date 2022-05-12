const supertest = require("supertest");
const app = require("../server");

const User = require("../models/user.model");
const WorkTime = require("../models/workTime.model");
const Schedule = require("../models/schedule.model");

const { setupDB } = require("./test-setup");
const userSeed = require("./seed/user.seed");
const { genStringWithLength } = require("../heplers/function");
const datasUser = require("../config/datas.json").models.users;

// Open a db with the given name, manage db's datas during and after testing. Add seed if needed.
setupDB(userSeed, "users", true);

const logUser = async (role) => {
  try {
    const userDatas = {
      username: "UserToLog",
      password: "Lorem Ipsum bla",
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

/*     USER GET     */
/*==================*/
test("GET users/all", async () => {
  try {
    // DB have users
    let rep = await supertest(app).get("/users/all").expect(200);
    expect(rep.body.message).toBeDefined();
    expect(rep.body.data).toBeDefined();
    expect(rep.body.success).toBeDefined();
    expect(rep.body.success).toBeTruthy();
    expect(Array.isArray(rep.body.data)).toBeTruthy();
    expect(rep.body.data.length).toBe(userSeed.User.length);

    /* No users in DB */
    // Empties user collection in db before test
    await User.deleteMany();

    let repB = await supertest(app).get("/users/all").expect(200);
    expect(repB.body.message).toBeDefined();
    expect(repB.body.data).toBeUndefined();
    expect(repB.body.success).toBeDefined();
    expect(repB.body.success).toBeFalsy();
  } catch (err) {
    throw err;
  }
});

test("GET /users/get/:id", async () => {
  try {
    /* CASE 1 */
    let user = await User.findOne();

    let rep = await supertest(app).get(`/users/get/${user._id}`).expect(200);

    expect(rep.body.message).toBeDefined();
    expect(rep.body.data).toBeDefined();
    expect(rep.body.success).toBeDefined();
    expect(rep.body.success).toBeTruthy();

    // Check datas coming from API
    expect(rep.body.data.username).toBe(user.username);
    expect(rep.body.data._id).toBe(user.id);
    expect(rep.body.data.role).toBe(user.role);

    // Password should not be sent to client
    expect(rep.body.data.password).toBeUndefined();

    /* Case 2: no result found  */
    let repB = await supertest(app)
      // The id have the correct format
      .get(`/users/get/625b1bf85ce58741b994c683`)
      .expect(400);

    expect(repB.body.message).toBeDefined();
    expect(repB.body.data).toBeUndefined();
    expect(repB.body.success).toBeDefined();
    expect(repB.body.success).toBeFalsy();
  } catch (err) {
    throw err;
  }
});

test("POST users/add", async () => {
  try {
    let userDatas = {
      username: "User test",
      password: "Pass user test",
    };
    /* Case 1 */
    let rep = await supertest(app)
      .post("/users/add")
      .send(userDatas)
      .expect(201);

    expect(rep.body.message).toBeDefined();
    expect(rep.body.data).toBeDefined();
    expect(rep.body.success).toBeDefined();
    expect(rep.body.success).toBeTruthy();

    // Check datas in DB are linked to datas returned by API
    let checkRep = await User.findById(rep.body.data.id);
    expect(checkRep).toBeDefined();
    expect(checkRep.id).toBe(rep.body.data.id);
    expect(checkRep.username).toBe(userDatas.username);
    expect(checkRep.role).toBe("user");

    /* Case 2:  try to use same username more than once */
    let repB = await supertest(app)
      .post("/users/add")
      .send(userDatas)
      .expect(400);
    expect(repB.body.message).toBeDefined();
    expect(repB.body.data).toBeUndefined();
    expect(repB.body.success).toBeDefined();
    expect(repB.body.success).toBeFalsy();

    let checkRepB = await User.find({ username: userDatas.username }).count();
    expect(checkRepB).toBe(1);

    /* Case 3: Error during input validation (Same validation to update Users) */
    // No username
    let userTest1 = {
      username: genStringWithLength(0),
      password: genStringWithLength(datasUser.password.minlength),
    };
    // No password
    let userTest2 = {
      username: genStringWithLength(datasUser.username.minlength),
      password: genStringWithLength(0),
    };
    // Username too short
    let userTest3 = {
      username: genStringWithLength(datasUser.username.minlength - 1),
      password: genStringWithLength(datasUser.password.minlength),
    };
    // Password too short
    let userTest4 = {
      username: genStringWithLength(datasUser.username.minlength),
      password: genStringWithLength(datasUser.password.minlength - 1),
    };
    // Username too long
    let userTest5 = {
      username: genStringWithLength(datasUser.username.maxlength + 1),
      password: genStringWithLength(datasUser.password.minlength),
    };
    //Password too long
    let userTest6 = {
      username: genStringWithLength(datasUser.username.minlength),
      password: genStringWithLength(datasUser.password.maxlength + 1),
    };
    // Username at max length
    let userTest8 = {
      username: genStringWithLength(datasUser.username.maxlength),
      password: genStringWithLength(datasUser.password.minlength),
    };
    // Password with max length
    let userTest9 = {
      username: genStringWithLength(datasUser.username.minlength),
      password: genStringWithLength(datasUser.password.maxlength),
    };

    await supertest(app).post("/users/add").send(userTest1).expect(400);
    await supertest(app).post("/users/add").send(userTest2).expect(400);
    await supertest(app).post("/users/add").send(userTest3).expect(400);
    await supertest(app).post("/users/add").send(userTest4).expect(400);
    await supertest(app).post("/users/add").send(userTest5).expect(400);
    await supertest(app).post("/users/add").send(userTest6).expect(400);
    await supertest(app).post("/users/add").send(userTest8).expect(201);
    await supertest(app).post("/users/add").send(userTest9).expect(201);
  } catch (err) {
    throw err;
  }
});

test("PUT users/update/:id", async () => {
  try {
    /* Input validation : see POST add new user's case */

    /* Test setup */
    let token = await logUser("admin");

    /* Case 1 */
    let userToUpdate = await User.findOne({ role: "user" });
    const majUsername = "updated";

    let rep = await supertest(app)
      .post(`/users/update/${userToUpdate._id}`)
      .set("Authorization", `Bearer ${token}`)
      .send({
        username: majUsername,
        password: "12345678",
      })
      .expect(201);

    expect(rep.body.message).toBeDefined();
    expect(rep.body.data).toBeUndefined();
    expect(rep.body.success).toBeDefined();
    expect(rep.body.success).toBeTruthy();

    // Check if changes are in the DB
    let majUser = await User.findById(userToUpdate._id);
    expect(majUser.username).toBe(majUsername);

    //Password has been hashed. Check if current one is different than the initial one
    expect(majUser.password).not.toBe(userToUpdate.password);

    /* Case 2: wrong id */
    let repB = await supertest(app)
      .post(`/users/update/625b1bf85ce58741b994c626`)
      .set("Authorization", `Bearer ${token}`)
      .send({
        username: "Something else",
        password: "12345678b",
      })
      .expect(400);

    expect(repB.body.message).toBeDefined();
    expect(repB.body.data).toBeUndefined();
    expect(repB.body.success).toBeDefined();
    expect(repB.body.success).toBeFalsy();

    // Check db has not changed
    let majUserB = await User.findById(majUser._id);
    expect(majUserB.username).toBe(majUsername);

    //Password has been hashed. Check if current one is the same than the initial one
    expect(majUserB.password).toBe(majUser.password);

    /* Case 3 : username is already used */
    let repC = await supertest(app)
      .post(`/users/update/${userToUpdate._id}`)
      .set("Authorization", `Bearer ${token}`)
      .send({
        username: "Shion",
        password: "12345678x",
      })
      .expect(400);

    expect(repC.body.message).toBeDefined();
    expect(repC.body.data).toBeUndefined();
    expect(repC.body.success).toBeDefined();
    expect(repC.body.success).toBeFalsy();

    // Check db has not changed
    let majUserC = await User.findById(majUser._id);
    expect(majUserC.username).toBe(majUsername);

    //Password has been hashed. Check if current one is the same than the initial one
    expect(majUserC.password).toBe(majUser.password);
  } catch (err) {
    throw err;
  }
});

// TODO: continuer à re-écrire les test à partir d'ici
test.only("DELETE /users/delete/:id Delete a user", async () => {
  try {
    let token = await logUser({ role: "admin" });
    // Take a user from db
    let user = await User.findOne();
    // Try to delete a user
    let reponse = await supertest(app)
      .delete(`/users/delete/${user.id}`)
      .set("Authorization", `Bearer ${token}`)
      .send({ username: user.username, password: user.password })
      .expect(200);

    // API made the change expected
    expect(reponse.body.success).toBeTruthy();

    // Check if user has been deleted of the DB
    let delUser = await User.findById(user._id);
    expect(delUser).toBeNull();
  } catch (err) {
    throw err;
  }
});

test("DELETE /users/delete/:id Delete a user without being the user", async () => {
  try {
    let token = await logUser({ role: "user" });

    // Take a user from db
    let user = await User.findOne({ username: "Daddji" });
    // Try to delete a user
    await supertest(app)
      .delete(`/users/delete/${user.id}`)
      .set("Authorization", `Bearer ${token}`)
      .expect(401);

    // Check that user has not been deleted of the DB
    let delUser = await User.findById(user._id);
    expect(delUser.username).toBe(user.username);
    expect(delUser.password).toBe(user.password);
  } catch (err) {
    throw err;
  }
});

/*     USER POST CALENDAR     */
/*============================*/
test("POST and PUT a schedule in user calendar", async () => {
  try {
    let token = await logUser({ role: "admin" });

    let workTimeA = new WorkTime({
      startDate: new Date(2022, 3, 20, 7, 0),
      endDate: new Date(2022, 3, 20, 12, 45),
      breakTime: 0,
    });
    let scheduleA = new Schedule({
      name: "test schedule",
      workTime: workTimeA.id,
    });

    let user = await User.findOne();

    const rep = await supertest(app)
      .post(`/users/${user.id}/calendar/add/schedule`)
      .set("Authorization", `Bearer ${token}`)
      .send({ scheduleId: scheduleA.id, date: "2022-06-22" })
      .expect(200);

    expect(rep.body.success).toBeTruthy();

    // Check if the schedule has been saved correctely in db
    let userFound = await User.findById(user.id);
    expect(userFound.id).toBeDefined();
    expect(userFound.calendrier["2022"]["5"]["22"].schedule).toBeDefined();
    expect(userFound.calendrier["2022"]["5"]["22"].schedule).toBe(scheduleA.id);

    //Change the schedule at the same date
    let scheduleB = new Schedule({
      name: "test scheduleB",
      workTime: workTimeA.id,
    });
    const repB = await supertest(app)
      .post(`/users/${user.id}/calendar/add/schedule`)
      .set("Authorization", `Bearer ${token}`)
      .send({ scheduleId: scheduleB.id, date: "2022-06-22" })
      .expect(200);

    expect(repB.body.success).toBeTruthy();

    // Check if the schedule has been changed correctely in db
    let userFoundB = await User.findById(user.id);
    expect(userFoundB.id).toBeDefined();
    expect(userFoundB.calendrier["2022"]["5"]["22"].schedule).toBeDefined();
    expect(userFoundB.calendrier["2022"]["5"]["22"].schedule).toBe(
      scheduleB.id
    );
  } catch (err) {
    throw err;
  }
});

test("POST a schedule in user calendar with wrong datas", async () => {
  try {
    let token = await logUser({ role: "admin" });

    let workTimeA = new WorkTime({
      startDate: new Date(2022, 3, 20, 7, 0),
      endDate: new Date(2022, 3, 20, 12, 45),
      breakTime: 0,
    });
    let scheduleA = new Schedule({
      name: "test schedule",
      workTime: workTimeA.id,
    });

    let user = await User.findOne();

    // Wrong id
    const rep = await supertest(app)
      .post(`/users/6262ef89b6b72b18c716269d/calendar/add/schedule`)
      .set("Authorization", `Bearer ${token}`)
      .send({ scheduleId: scheduleA.id, date: "2022-06-22" })
      .expect(400);
    expect(rep.body.success).toBeFalsy();

    // wrong date format
    const repB = await supertest(app)
      .post(`/users/${user.id}/calendar/add/schedule`)
      .set("Authorization", `Bearer ${token}`)
      .send({ scheduleId: scheduleA.id, date: "2022-06-22T20:00" })
      .expect(400);
    expect(repB.body.success).toBeFalsy();
    expect(repB.body.errors[0].param).toBe("date");

    // wrong date schemaId
    const repC = await supertest(app)
      .post(`/users/${user.id}/calendar/add/schedule`)
      .set("Authorization", `Bearer ${token}`)
      .send({ scheduleId: "6262ef89b6b72b18c71626", date: "2022-06-22" })
      .expect(400);
    expect(repC.body.success).toBeFalsy();
    expect(repC.body.errors[0].param).toBe("scheduleId");
  } catch (err) {
    throw err;
  }
});

test("DELETE a schedule in user calendar", async () => {
  try {
    let token = await logUser({ role: "admin" });

    let workTimeA = new WorkTime({
      startDate: new Date(2022, 3, 20, 7, 0),
      endDate: new Date(2022, 3, 20, 12, 45),
      breakTime: 0,
    });
    let scheduleA = new Schedule({
      name: "test schedule",
      workTime: workTimeA.id,
    });

    let user = await User.findOne();

    // Create a schedule and put it in user calendar
    const rep = await supertest(app)
      .post(`/users/${user.id}/calendar/add/schedule`)
      .set("Authorization", `Bearer ${token}`)
      .send({ scheduleId: scheduleA.id, date: "2022-06-22" })
      .expect(200);

    expect(rep.body.success).toBeTruthy();

    // Delete schedule
    await supertest(app)
      .delete(`/users/${user.id}/calendar/delete/schedule`)
      .set("Authorization", `Bearer ${token}`)
      .send({
        date: "2022-06-22",
      })
      .expect(200);

    // Test that worktime is not anymore in the user calendar
    let userTest = await User.findById(user.id);
    expect(userTest).toBeDefined();
    expect(userTest.calendrier["2022"]["5"]["22"]["schedule"]).toBeNull();
  } catch (err) {
    throw err;
  }
});

test("DELETE a schedule in user calendar with wrong datas", async () => {
  try {
    let token = await logUser({ role: "admin" });

    let workTimeA = new WorkTime({
      startDate: new Date(2022, 3, 20, 7, 0),
      endDate: new Date(2022, 3, 20, 12, 45),
      breakTime: 0,
    });
    let scheduleA = new Schedule({
      name: "test schedule",
      workTime: workTimeA.id,
    });

    let user = await User.findOne();

    // Create a schedule and put it in user calendar
    let rep = await supertest(app)
      .post(`/users/${user.id}/calendar/add/schedule`)
      .set("Authorization", `Bearer ${token}`)
      .send({ scheduleId: scheduleA.id, date: "2022-06-22" })
      .expect(200);

    expect(rep.body.success).toBeTruthy();

    // Try to delete with wrong id
    rep = await supertest(app)
      .delete(`/users/6262ef89b6b72b18c716269d/calendar/delete/schedule`)
      .set("Authorization", `Bearer ${token}`)
      .send({
        date: "2022-06-22",
      })
      .expect(400);

    // Try to delete with wrong date format
    rep = await supertest(app)
      .delete(`/users/${user.id}/calendar/delete/schedule`)
      .set("Authorization", `Bearer ${token}`)
      .send({
        date: "2022-06-22T22:00",
      })
      .expect(400);

    // Test that schedule is still in the user calendar
    let userTest = await User.findById(user.id);
    expect(userTest).toBeDefined();
    expect(userTest.calendrier["2022"]["5"]["22"]["schedule"]).toBe(
      scheduleA.id
    );
    //Test that schedule instance still exists
    let SC = await Schedule.findById(scheduleA.id);
    expect(SC).toBeDefined();

    // Try to delete with wrong date format
    rep = await supertest(app)
      .delete(`/users/${user.id}/calendar/delete/schedule`)
      .set("Authorization", `Bearer ${token}`)
      .send({
        date: "2022-06-22T22:00",
      })
      .expect(400);

    // Test that schedule is still in the user calendar
    userTest = await User.findById(user.id);
    expect(userTest).toBeDefined();
    expect(userTest.calendrier["2022"]["5"]["22"]["schedule"]).toBe(
      scheduleA.id
    );
  } catch (err) {
    throw err;
  }
});

test("POST and PUT a worktime in user calendar", async () => {
  try {
    let token = await logUser({ role: "admin" });

    let user = await User.findOne();

    const rep = await supertest(app)
      .post(`/users/${user.id}/calendar/add/worktime`)
      .set("Authorization", `Bearer ${token}`)
      .send({
        startDate: "2022-06-22T10:00",
        endDate: "2022-06-22T17:00",
        breakTime: 50,
        date: "2022-06-22",
      })
      .expect(200);

    // Look into db that datas are correct
    let userFound = await User.findById(user.id);

    // Date is okay
    expect(userFound.calendrier["2022"]["5"]["22"].workTime).toBeDefined();

    let workTimeId = userFound.calendrier["2022"]["5"]["22"].workTime;

    expect(rep.body.data.id).toBe(workTimeId);

    // Worktime exist
    let WT = await WorkTime.findById(workTimeId);
    expect(WT).toBeDefined();
    expect(Date(WT.startDate)).toBe(Date("2022-06-22T10:00"));
    expect(Date(WT.endDate)).toBe(Date("2022-06-22T17:00"));
    expect(Date(WT.breakTime)).toBe(Date(50));

    // Try to update Datas
    const repB = await supertest(app)
      .post(`/users/${user.id}/calendar/add/worktime`)
      .set("Authorization", `Bearer ${token}`)
      .send({
        startDate: "2022-06-22T08:00",
        endDate: "2022-06-22T16:00",
        breakTime: 30,
        date: "2022-06-22",
      })
      .expect(200);

    // Look into db that datas are correct
    let userFoundB = await User.findById(user.id);
    let workTimeIdB = userFoundB.calendrier["2022"]["5"]["22"].workTime;

    expect(repB.body.data.id).toBe(workTimeIdB);

    // Worktime exist
    let WTb = await WorkTime.findById(workTimeIdB);
    expect(WTb).toBeDefined();
    expect(Date(WTb.startDate)).toBe(Date("2022-06-22T08:00"));
    expect(Date(WTb.endDate)).toBe(Date("2022-06-22T16:00"));
    expect(Date(WTb.breakTime)).toBe(Date(30));
  } catch (err) {
    throw err;
  }
});

test("POST and PUT a worktime in user calendar with wrong datas", async () => {
  try {
    let token = await logUser({ role: "admin" });

    let user = await User.findOne();

    // Wrong start and end dates
    let rep = await supertest(app)
      .post(`/users/${user.id}/calendar/add/worktime`)
      .set("Authorization", `Bearer ${token}`)
      .send({
        startDate: "2022-06-22",
        endDate: "2022-06-22",
        breakTime: 50,
        date: "2022-06-22",
      })
      .expect(400);

    // Look into db that datas are correct not saved
    let userFound = await User.findById(user.id);

    expect(userFound.calendrier["2022"]).toBeUndefined();

    // Wrong breakTime
    rep = await supertest(app)
      .post(`/users/${user.id}/calendar/add/worktime`)
      .set("Authorization", `Bearer ${token}`)
      .send({
        startDate: "2022-06-22T10:00",
        endDate: "2022-06-22T17:00",
        breakTime: -50,
        date: "2022-06-22",
      })
      .expect(400);

    // Look into db that datas are correct not saved
    userFound = await User.findById(user.id);

    expect(userFound.calendrier["2022"]).toBeUndefined();

    // Wrong date
    rep = await supertest(app)
      .post(`/users/${user.id}/calendar/add/worktime`)
      .set("Authorization", `Bearer ${token}`)
      .send({
        startDate: "2022-06-22T10:00",
        endDate: "2022-06-22T17:00",
        breakTime: 0,
        date: "2022-06-22T10:00",
      })
      .expect(400);

    // Look into db that datas are correct not saved
    userFound = await User.findById(user.id);

    expect(userFound.calendrier["2022"]).toBeUndefined();

    // startDate <= endDate
    rep = await supertest(app)
      .post(`/users/${user.id}/calendar/add/worktime`)
      .set("Authorization", `Bearer ${token}`)
      .send({
        startDate: "2022-06-22T18:00",
        endDate: "2022-06-22T17:00",
        breakTime: 50,
        date: "2022-06-22",
      })
      .expect(400);

    // Look into db that datas are correct not saved
    userFound = await User.findById(user.id);

    expect(userFound.calendrier["2022"]).toBeUndefined();
  } catch (err) {
    throw err;
  }
});

test("DELETE a worktime in user calendar", async () => {
  try {
    let token = await logUser({ role: "admin" });

    let user = await User.findOne();

    // Create a worktime and put it in user calendar
    let rep = await supertest(app)
      .post(`/users/${user.id}/calendar/add/worktime`)
      .set("Authorization", `Bearer ${token}`)
      .send({
        startDate: "2022-06-22T08:00",
        endDate: "2022-06-22T17:00",
        breakTime: 60,
        date: "2022-06-22",
      })
      .expect(200);

    // Delete worktime
    let repB = await supertest(app)
      .delete(`/users/${user.id}/calendar/delete/worktime`)
      .set("Authorization", `Bearer ${token}`)
      .send({
        date: "2022-06-22",
      })
      .expect(200);

    // Test worktime is no in db anymore
    let WT = await WorkTime.findById(rep.body.data.id);
    expect(WT).toBeNull();

    // Test that worktime is not anymore in the user calendar
    let userTest = await User.findById(user.id);
    expect(userTest).toBeDefined();
    expect(userTest.calendrier["2022"]["5"]["22"]["workTime"]).toBeNull();
  } catch (err) {
    throw err;
  }
});

test("DELETE a worktime in user calendar with wrong datas", async () => {
  try {
    let token = await logUser({ role: "admin" });

    let user = await User.findOne();

    // Create a worktime and put it in user calendar
    let rep = await supertest(app)
      .post(`/users/${user.id}/calendar/add/worktime`)
      .set("Authorization", `Bearer ${token}`)
      .send({
        startDate: "2022-06-22T08:00",
        endDate: "2022-06-22T17:00",
        breakTime: 60,
        date: "2022-06-22",
      })
      .expect(200);

    let WTId = rep.body.data.id;

    // Try to delete with wrong id
    rep = await supertest(app)
      .delete(`/users/6262ef89b6b72b18c716269d/calendar/delete/worktime`)
      .set("Authorization", `Bearer ${token}`)
      .send({
        date: "2022-06-22",
      })
      .expect(400);

    // Try to delete with wrong date format
    rep = await supertest(app)
      .delete(`/users/${user.id}/calendar/delete/worktime`)
      .set("Authorization", `Bearer ${token}`)
      .send({
        date: "2022-06-22T22:00",
      })
      .expect(400);

    // Test that worktime is still in the user calendar
    let userTest = await User.findById(user.id);
    expect(userTest).toBeDefined();
    expect(userTest.calendrier["2022"]["5"]["22"]["workTime"]).toBe(WTId);
    //Test that WT instance still exists
    let WT = await WorkTime.findById(WTId);
    expect(WT).toBeDefined();

    // Try to delete with wrong date format
    rep = await supertest(app)
      .delete(`/users/${user.id}/calendar/delete/worktime`)
      .set("Authorization", `Bearer ${token}`)
      .send({
        date: "2022-06-22T22:00",
      })
      .expect(400);

    // Test that worktime is still in the user calendar
    userTest = await User.findById(user.id);
    expect(userTest).toBeDefined();
    expect(userTest.calendrier["2022"]["5"]["22"]["workTime"]).toBe(WTId);
    //Test that WT instance still exists
    WT = await WorkTime.findById(WTId);
    expect(WT).toBeDefined();
  } catch (err) {
    throw err;
  }
});