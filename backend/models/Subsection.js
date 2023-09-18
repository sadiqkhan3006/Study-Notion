const mongoose = require("mongoose");
const subsectionSchema = new mongoose.Schema({
  title: String,
  timeDuration: String,
  description: String,
  videoUrl: String,
});
module.exports = mongoose.model("Subsection", subsectionSchema);
