const mongoose = require("mongoose");

async function connect(isTest) {
  const mongoURL = isTest ? process.env.MONGO_URL_TEST : process.env.MONGO_URL;
  await mongoose.connect(mongoURL);
}


module.exports = connect;
