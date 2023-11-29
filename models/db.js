const mongoose = require("mongoose");

require("dotenv").config();

const connectToDb = async () => {
  try {
    console.log("Trying to connect to database...");
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Connected to database...");
  } catch (error) {
    console.log(`Error connecting to database... ${error}`);
  }
};

module.exports = connectToDb;
