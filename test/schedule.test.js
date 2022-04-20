const supertest = require("supertest");
const WorkTime = require("../models/workTime.model");
const Schedule = require("../models/schedule.model");
const scheduleSeed = require("./seed/schedule.seed");

const app = require("../server");

const { setupDB } = require("./test-setup");

// Open a db with the given name, manage db's datas during and after testing. Add seed if needed.
setupDB("Schedule", scheduleSeed, false);

/*     workTime model's method and virtual     */
/*=============================================*/
test("Test that seeding is correct", async () => {
  try {
  } catch (err) {
    throw err;
  }
});
