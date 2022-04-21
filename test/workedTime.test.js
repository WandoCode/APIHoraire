const supertest = require("supertest");
const WorkTime = require("../models/workTime.model");
const workTimeSeed = require("./seed/workTime.seed");
const app = require("../server");

const { setupDB } = require("./test-setup");

// Open a db with the given name, manage db's datas during and after testing. Add seed if needed.
setupDB("WorkTime", workTimeSeed, false);

/*     workTime model's method and virtual     */
/*=============================================*/
test("Test virtuals 'totalHourString' and 'totalTime' model's method", async () => {
  try {
    let workTimeA = new WorkTime({
      startDate: new Date(2022, 3, 20, 7, 0),
      endDate: new Date(2022, 3, 20, 12, 45),
      breakTime: 0,
    });

    expect(workTimeA).toBeDefined();
    expect(workTimeA.totalTime()).toBe(345);
    expect(workTimeA.totalHourString).toBe("05:45");

    let workTimeB = new WorkTime({
      startDate: new Date(2022, 3, 20, 7, 0),
      endDate: new Date(2022, 3, 20, 13, 0),
      breakTime: 0,
    });

    expect(workTimeB).toBeDefined();
    expect(workTimeB.totalTime()).toBe(360);
    expect(workTimeB.totalHourString).toBe("06:00");

    let workTimeC = new WorkTime({
      startDate: new Date(2022, 3, 20, 7, 0),
      endDate: new Date(2022, 3, 20, 12, 15),
      breakTime: 0,
    });

    expect(workTimeC).toBeDefined();
    expect(workTimeC.totalTime()).toBe(315);
    expect(workTimeC.totalHourString).toBe("05:15");

    let workTimeD = new WorkTime({
      startDate: new Date(2022, 3, 20, 17, 0),
      endDate: new Date(2022, 3, 20, 12, 0),
      breakTime: 0,
    });

    expect(workTimeD).toBeDefined();
    expect(workTimeD.totalTime()).toBe(-300);
    expect(workTimeD.totalHourString).toBe("-05:00");

    let workTimeE = new WorkTime({
      startDate: new Date(2022, 3, 20, 7, 45),
      endDate: new Date(2022, 3, 20, 12, 45),
      breakTime: 600,
    });

    expect(workTimeE).toBeDefined();
    expect(workTimeE.totalTime()).toBe(-300);
    expect(workTimeE.totalHourString).toBe("-05:00");

    let workTimeF = new WorkTime({
      startDate: new Date(2022, 3, 20, 7, 45),
      endDate: new Date(2022, 3, 20, 12, 45),
      breakTime: 30,
    });

    expect(workTimeF).toBeDefined();
    expect(workTimeF.totalTime()).toBe(270);
    expect(workTimeF.totalHourString).toBe("04:30");
  } catch (err) {
    throw err;
  }
});
