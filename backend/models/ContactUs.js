const mongoose = require("mongoose");
const contactUsSchema = new mongoose.Schema({
  message: {
    type: String,
  },
  email: {
    type: String,
  },
  firstname: {
    type: String,
  },
  lastname: {
    type: String,
  },
  phoneNo: {
    type: Number,
  },
  countryCode: {
    type: Number,
  },
});
module.exports = mongoose.model("ContactUs", contactUsSchema);
// email, firstname, lastname, message, phoneNo, countrycode
