const mongoose = require("mongoose");

/*=================================================*/
/*              Start mongoDB connection           */
/*-------------------------------------------------*/
const mongoDb = process.env.DB_LINK.replace("<DBNAME>", "Main");
mongoose.connect(mongoDb);

const db = mongoose.connection;

db.on("error", console.error.bind(console, "mongo connection error"));
/***************************************************/
