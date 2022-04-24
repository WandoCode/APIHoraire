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
setupDB(userSeed, true);

/*     USER GET     */
/*==================*/
test("GET /users/all get all users", async () => {
  try {
    let reponse = await supertest(app).get("/users/all").expect(200);
    expect(Array.isArray(reponse.body.datas)).toBeTruthy();
    expect(reponse.body.datas.length).toBe(userSeed.User.length);
  } catch (err) {
    throw err;
  }
});

test("GET /users/all get all users when db is empty", async () => {
  try {
    // Empties user collection in db before test
    await User.deleteMany();

    let reponse = await supertest(app).get("/users/all").expect(200);
    expect(Array.isArray(reponse.body.datas)).toBeTruthy();
    expect(reponse.body.datas.length).toBe(0);
  } catch (err) {
    throw err;
  }
});

test("GET /users/get/:id get a user with the given id", async () => {
  try {
    // Test a user creation
    let newUser = await User.create({
      username: "user test",
      password: "un mdp",
    });

    let reponse = await supertest(app)
      .get(`/users/get/${newUser._id}`)
      .expect(200);

    // Request success from API
    expect(reponse.body.success).toBeTruthy();

    // Datas sent by API are correct
    expect(reponse.body.datas).toBeDefined();
    expect(reponse.body.datas.username).toBe(newUser.username);
    expect(reponse.body.datas._id).toBe(newUser.id);
    expect(reponse.body.datas.password).toBe(newUser.password);
    expect(reponse.body.datas.role).toBe("user");
  } catch (err) {
    throw err;
  }
});

test("GET /users/get/:id where no result is found", async () => {
  try {
    let reponse = await supertest(app)
      // The id have the correct format
      .get(`/users/get/625b1bf85ce58741b994c683`)
      .expect(400);

    // The results is not the one expected
    expect(reponse.body.success).toBeFalsy();

    // No datas has been sent
    expect(reponse.body.datas).toBeUndefined();
  } catch (err) {
    throw err;
  }
});

test("POST/DELETE/PUT test new_user validation of datas", async () => {
  try {
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

/*     USER POST    */
/*==================*/
test("POST /users/add post new user in db", async () => {
  try {
    let userTest = {
      username: "Test1",
      password: "1234 56789",
    };

    let reponse = await supertest(app)
      .post("/users/add")
      .send(userTest)
      .expect(201);

    /// User has been created by API
    expect(reponse.body.success).toBeTruthy();
    expect(reponse.body.message).toBe("User created");

    let userFound = await User.findOne({ username: userTest.username });

    // User is in DB
    expect(userFound).not.toBeNull();
    expect(userFound.username).toBe(userTest.username);
  } catch (err) {
    throw err;
  }
});

test("POST /users/add add doublon", async () => {
  try {
    let reponse = await supertest(app)
      .post("/users/add")
      .send({
        username: "Shion",
        password: "Lorem ipsum",
      })
      .expect(400);

    // The results is not the one expected (user not created)
    expect(reponse.body.success).toBeFalsy();
  } catch (err) {
    throw err;
  }
});

/*     USER PUT     */
/*==================*/
test("PUT /users/update/:id Update a user's datas", async () => {
  try {
    // Create a new user
    let newUser = await User.create({
      username: "Test maj",
      password: "azeazeaz",
    });

    // Try to update this user
    const majUsername = "updated";
    let reponse = await supertest(app)
      .post(`/users/update/${newUser._id}`)
      .send({
        username: majUsername,
        password: "12345678",
      })
      .expect(201);

    // API made the change expected
    expect(reponse.body.success).toBeTruthy();

    // Check if changes are in the DB
    let majUser = await User.findById(newUser._id);
    expect(majUser.username).toBe(majUsername);

    //Password has been hashed. Check if current one is different than the initial one
    expect(majUser.password).not.toBe(newUser.password);
  } catch (err) {
    throw err;
  }
});

test("PUT /users/update/:id Update a user with wrong id", async () => {
  try {
    // Create a new user
    let newUser = await User.create({
      username: "Test maj",
      password: "azeazeze",
    });

    // Try to update this user
    const majUsername = "updated";
    let reponse = await supertest(app)
      .post(`/users/update/625b1bf85ce58741b994c626`)
      .send({
        username: majUsername,
        password: "12345678",
      })
      .expect(400);

    // API has not made the change expected
    expect(reponse.body.success).toBeFalsy();

    // Check that changes are not in the DB
    let majUser = await User.findById(newUser._id);
    expect(majUser.username).not.toBe(majUsername);

    //Password has been hashed. Check if current one is the same than the initial one
    expect(majUser.password).toBe(newUser.password);
  } catch (err) {
    throw err;
  }
});

test("PUT /users/update/:id Update a user with a username already in use", async () => {
  try {
    // Create a new user
    let newUser = await User.create({
      username: "Test maj",
      password: "azeazeze",
    });

    // Try to update this user
    const majUsername = "updated";
    let reponse = await supertest(app)
      .post(`/users/update/${newUser._id}`)
      .send({
        username: "Shion",
        password: "12345678",
      })
      .expect(400);

    // API has not made the change expected
    expect(reponse.body.success).toBeFalsy();

    // Check that changes are not in the DB
    let majUser = await User.findById(newUser._id);
    expect(majUser.username).not.toBe(majUsername);

    //Password has been hashed. Check if current one is the same than the initial one
    expect(majUser.password).toBe(newUser.password);
  } catch (err) {
    throw err;
  }
});
/*    USER DELETE   */
/*==================*/
test("DELETE /users/delete/:id Delete a user", async () => {
  try {
    // Take a user from db
    let user = await User.findOne();
    // Try to delete a user
    let reponse = await supertest(app)
      .delete(`/users/delete/${user.id}`)
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
    // Take a user from db
    let user = await User.findOne();
    // Try to delete a user
    await supertest(app)
      .delete(`/users/delete/${user.id}`)
      .send({ username: "patate", password: "la grosse patate" })
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
      .send({ scheduleId: scheduleA.id, date: "2022-06-22" })
      .expect(400);
    expect(rep.body.success).toBeFalsy();

    // wrong date format
    const repB = await supertest(app)
      .post(`/users/${user.id}/calendar/add/schedule`)
      .send({ scheduleId: scheduleA.id, date: "2022-06-22T20:00" })
      .expect(400);
    expect(repB.body.success).toBeFalsy();
    expect(repB.body.errors[0].param).toBe("date");

    // wrong date schemaId
    const repC = await supertest(app)
      .post(`/users/${user.id}/calendar/add/schedule`)
      .send({ scheduleId: "6262ef89b6b72b18c71626", date: "2022-06-22" })
      .expect(400);
    expect(repC.body.success).toBeFalsy();
    expect(repC.body.errors[0].param).toBe("scheduleId");
  } catch (err) {
    throw err;
  }
});

test("POST and PUT a worktime in user calendar", async () => {
  try {
    let user = await User.findOne();

    const rep = await supertest(app)
      .post(`/users/${user.id}/calendar/add/worktime`)
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
    let user = await User.findOne();

    // Wrong start and end dates
    let rep = await supertest(app)
      .post(`/users/${user.id}/calendar/add/worktime`)
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
    let user = await User.findOne();

    // Create a worktime and put it in user calendar
    let rep = await supertest(app)
      .post(`/users/${user.id}/calendar/add/worktime`)
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

test.only("DELETE a worktime in user calendar with wrong datas", async () => {
  try {
    let user = await User.findOne();

    // Create a worktime and put it in user calendar
    let rep = await supertest(app)
      .post(`/users/${user.id}/calendar/add/worktime`)
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
      .send({
        date: "2022-06-22",
      })
      .expect(400);

    // Try to delete with wrong date format
    rep = await supertest(app)
      .delete(`/users/${user.id}/calendar/delete/worktime`)
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
