const mongoose = require("mongoose");
require("dotenv").config();
exports.DbConnect = async (req, res) => {
  await mongoose
    .connect(process.env.DB_URL, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    })
    .then(() => {
      console.log("Db connected successfully");
    })
    .catch((error) => {
      console.log("Db connection failed");
      console.log(error.message);
      process.exit(1);
    });
};
