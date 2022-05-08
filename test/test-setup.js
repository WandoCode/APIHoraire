require("dotenv").config({ path: "./config/.env" });

// test-setup.js
const mongoose = require("mongoose");

mongoose.promise = global.Promise;

async function removeAllCollections() {
  const collections = Object.keys(mongoose.connection.collections);
  for (const collectionName of collections) {
    const collection = mongoose.connection.collections[collectionName];
    await collection.deleteMany();
  }
}

async function dropAllCollections() {
  const collections = Object.keys(mongoose.connection.collections);
  for (const collectionName of collections) {
    const collection = mongoose.connection.collections[collectionName];
    try {
      await collection.drop();
    } catch (error) {
      // Sometimes this error happens, but you can safely ignore it
      if (error.message === "ns not found") return;
      // This error occurs when you use it. You can
      // safely ignore this error too
      if (error.message.includes("a background operation is currently running"))
        return;
      console.log(error.message);
    }
  }
}

// Seed the db with datas
async function seedDatabase(runSaveMiddleware = false, seed) {
  // runSaveMiddleware: pour les user, on doit hash le mdp, on l'a écrit dans le 'save' middleware, il faut donc le lancer. Cela ne se fait que via create, pas avec insertMany.
  for (const modelName in seed) {
    const model = mongoose.models[modelName];

    if (!model) throw new Error(`Cannot find Model '${modelName}'`);

    runSaveMiddleware
      ? await model.create(seed[modelName])
      : await model.insertMany(seed[modelName]);
  }
}

module.exports = {
  setupDB(seed, dbName, runSaveMiddleware = false) {
    // Connect with Mongoose (this can replace the mongodb-memory-server method)
    beforeAll(async () => {
      await mongoose.connect(
        process.env.TEST_DB_LINK.replace("<DBNAME>", dbName)
      );
    });

    // Seed Db with datas if needed
    if (seed) {
      beforeEach(async () => {
        await seedDatabase(runSaveMiddleware, seed);
      });
    }

    // Cleans up database between each test
    afterEach(async () => {
      await removeAllCollections();
    });

    // Disconnect Mongoose (this can be replaced by mongodb-memory-server method)
    afterAll(async () => {
      await dropAllCollections();
      await mongoose.connection.close();
    });
  },
};