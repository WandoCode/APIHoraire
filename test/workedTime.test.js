const supertest = require("supertest");
const WorkTime = require("../models/workTime.model");
const app = require("../server");

const { setupDB } = require("./test-setup");

// Open a db with the given name, manage db's datas during and after testing. Add seed if needed.
setupDB("WorkedTime", null, false);

/*     workTime model's method and virtual     */
/*=============================================*/
test.only("Test virtuals 'totalHourString' and 'totalTime' model's method", async () => {
  try {
    let workTimeA = new WorkTime({
      startDate: new Date(2022, 3, 20, 7, 0),
      endDate: new Date(2022, 3, 20, 12, 45),
      breakTime: 0,
    });
    console.log(workTimeA.totalHoursString);
    expect(workTimeA).toBeDefined();
    expect(workTimeA.totalTime).toBe(345);
    expect(workTimeA.totalHoursString).toBe("05:45");
  } catch (err) {
    throw err;
  }
});
