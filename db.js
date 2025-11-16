const mongoose = require("mongoose");
require("dotenv").config();
// const mongoURI = "mongodb+srv://root:tqaKcgmpS9U9Mo77@dev-cluster.1z0vi99.mongodb.net/test";
const connectToMongo = async () => {
  try {
    mongoose.set("strictQuery", false);
    mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB");
  } catch (error) {
    console.log(error);
  }
};

module.exports = connectToMongo;
