const express = require("express");
const app = express();

const userRoutes = require("./routes/User");
const paymentRoutes = require("./routes/Payments");
const courseRoutes = require("./routes/Course");
const profileRoutes = require("./routes/Profile");
require("dotenv").config();
const { DbConnect } = require("./config/database");
const cookieParser = require("cookie-parser");
const cors = require("cors"); //so that backend entertain req of frontend //
const { cloudinaryConnect } = require("./config/cloudinary");
const fileUpload = require("express-fileupload");

const PORT = process.env.PORT || 4000;
//db connect
DbConnect();
//middlewares//
app.use(express.json());
app.use(cookieParser());
app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
  })
);
app.use(
  fileUpload({
    useTempFiles: true,
    tempFileDir: "/tmp/",
  })
);
//cloudinary connect//
cloudinaryConnect();

//routes mounting //
app.use("/api/v1/auth", userRoutes);
app.use("/api/v1/profile", profileRoutes);
app.use("/api/v1/course", courseRoutes);
app.use("/api/v1/payment", paymentRoutes);

//def route//
app.get("/", (req, res) => {
  return res.json({
    success: true,
    message: "Your server is up and running",
  });
});

//activate server //
app.listen(PORT, () => {
  console.log("Your server started at ", PORT);
});
//15:52
