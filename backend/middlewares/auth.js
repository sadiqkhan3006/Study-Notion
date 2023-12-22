const jwt = require("jsonwebtoken");
require("dotenv").config();
const User = require("../models/User");

//auth//
exports.auth = async (req, res, next) => {
  try {
    //extract token

    const token =
      req.cookies.token ||
      req.body.token ||
      req.header("Authorization").replace("Bearer ", "");
    console.log("inside auth middleware token", req.body);
    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Token is Missing",
      });
    }

    //verify token
    try {
      const decode = jwt.verify(token, process.env.JWT_SECRET);
      console.log("Decoded JWT: ", decode);
      req.user = decode;
    } catch (error) {
      return res.status(401).json({
        success: false,
        message: "Token is Missing",
        error: error.message,
      });
    }
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Something Went wrong while validating the token",
      error: error.message,
    });
  }
};

//isStudent //
exports.isStudent = async (req, res, next) => {
  try {
    if (req.user.role !== "Student") {
      return res.status(401).json({
        success: false,
        message: "This is protected route for students",
      });
    }
    next();
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "User role failed to be verified",
    });
  }
};

//isInstructor//
exports.isInstructor = async (req, res, next) => {
  try {
    if (req.user.role !== "Instructor") {
      return res.status(401).json({
        success: false,
        message: "This is protected route for Instructor",
      });
    }
    next();
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "User role failed to be verified",
    });
  }
};

//isAdmin
exports.isAdmin = async (req, res, next) => {
  try {
    if (req.user.role !== "Admin") {
      return res.status(401).json({
        success: false,
        message: "This is protected route for Admin",
      });
    }
    next();
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "User role failed to be verified",
    });
  }
};
