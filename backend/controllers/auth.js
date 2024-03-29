const User = require("../models/User");
const OTP = require("../models/OTP");
const otpGenerator = require("otp-generator");
const bcrypt = require("bcrypt");
const Profile = require("../models/Profile");
const jwt = require("jsonwebtoken");
const mailSender = require("../utils/mailSender");
const { passwordUpdated } = require("../mail/passwordUpdateEmail");

require("dotenv").config();
//send otp for verification//
exports.sendOTP = async (req, res) => {
  try {
    const { email } = req.body;
    //check if user already exist or not
    const existingUser = await User.findOne({ email });
    //if user exist , then return response //
    if (existingUser) {
      return res.status(401).json({
        success: false,
        message: `User already registered with this email 
            ${email}`,
      });
    }
    //generate otp//
    let otp = otpGenerator.generate(6, {
      upperCaseAlphabets: false,
      lowerCaseAlphabets: false,
      specialChars: false,
    });
    console.log("Generated OTP: ", otp);

    //uniqueness of otp//
    let duplicateOtp = await OTP.findOne({ otp });
    while (duplicateOtp) {
      otp = otpGenerator.generate(6, {
        upperCaseAlphabets: false,
        lowerCaseAlphabets: false,
        specialChars: false,
      });
      console.log("Generated OTP: ", otp);

      duplicateOtp = await OTP.findOne({ otp });
    }
    const otpPayload = { email, otp };
    //entry in db//
    const otpBody = await OTP.create(otpPayload);
    console.log("Saved otp in db: ", otpBody);
    res.status(200).json({
      success: true,
      message: "OTP send successfully",
    });
  } catch (error) {
    console.log("Error while sending otp");
    console.log(error.message);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

//signup
exports.signUp = async (req, res) => {
  try {
    //data fetch//
    const {
      firstName,
      lastName,
      email,
      password,
      confirmPassword,
      accountType,
      contactNumber,
      otp,
    } = req.body;
    //data validate//
    if (
      !firstName ||
      !lastName ||
      !email ||
      !password ||
      !confirmPassword ||
      !otp
    ) {
      return res.status(403).json({
        success: false,
        message: "All fields are required",
      });
    }
    //two pass match//

    if (password !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: "passwords dont match please try again",
      });
    }
    //check user already exists or not //
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: `User exists with this email ${email}`,
      });
    }

    //find most recent otp //
    const recentOtp = await OTP.find({ email })
      .sort({ createdAt: -1 })
      .limit(1);
    console.log("recent Otp: ", recentOtp);

    //validate otp//
    if (recentOtp.length == 0) {
      //otp not found//
      return res.status(400).json({
        success: false,
        message: `OTP is not valid`,
      });
    }
    if (otp !== recentOtp[0].otp) {
      return res.status(400).json({
        success: false,
        message: `Invalid OTP`,
      });
    }

    //hash pass/
    const hashedPassword = await bcrypt.hash(password, 10);
    //save in db //
    const profileDetails = await Profile.create({
      gender: null,
      dateOfBirth: null,
      about: null,
      contactNumber: contactNumber,
    });
    const user = await User.create({
      firstName,
      lastName,
      email,
      password: hashedPassword,
      accountType,
      additionalDetails: profileDetails._id,
      image: `https://api.dicebear.com/5.x/initials/svg?seed=${firstName} ${lastName}`,
    });
    //return response
    return res.status(200).json({
      success: true,
      message: `User registered Successfully`,
      user,
    });
  } catch (error) {
    console.log("Something Went wrong during SignUp..");
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

exports.login = async (req, res) => {
  try {
    //get data
    const { email, password } = req.body;
    //data validate
    if (!email || !password) {
      return res.status(403).json({
        success: false,
        message: "All fields are required",
      });
    }
    //check user existence//
    const existingUser = await User.findOne({ email }).populate({
      path: "additionalDetails",
    });
    if (!existingUser) {
      return res.status(401).json({
        success: false,
        message: "User is not registered please Signup",
      });
    }
    //generate jwt token , after matching passsword
    if (await bcrypt.compare(password, existingUser.password)) {
      const payload = {
        email: existingUser.email,
        id: existingUser._id,
        role: existingUser.accountType,
      };
      const token = jwt.sign(payload, process.env.JWT_SECRET, {
        expiresIn: "12h",
      });
      existingUser.token = token; //might throw error because of schema of User
      existingUser.password = undefined;
      //create cookie
      const options = {
        expires: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 day
        httpOnly: true,
      };
      res.cookie("token", token, options).status(200).json({
        success: true,
        token,
        user: existingUser,
        message: "Logged in successfully",
      });
    } else {
      res.status(401).json({
        success: false,
        message: "Password is innocrrect",
      });
    }
  } catch (error) {
    console.log("Erro while logging in: ", error.message);
    return res.status(500).json({
      success: false,
      error: error.message,
      message: "login failure",
    });
  }
};
exports.changePassword = async (req, res) => {
  try {
    // Get user data from req.user
    const userDetails = await User.findById(req.user.id);

    // Get old password, new password, and confirm new password from req.body
    const { oldPassword, newPassword, confirmNewPassword } = req.body;

    // Validate old password
    const isPasswordMatch = await bcrypt.compare(
      oldPassword,
      userDetails.password
    );
    if (!isPasswordMatch) {
      // If old password does not match, return a 401 (Unauthorized) error
      return res
        .status(401)
        .json({ success: false, message: "The password is incorrect" });
    }

    // Match new password and confirm new password
    if (newPassword !== confirmNewPassword) {
      // If new password and confirm new password do not match, return a 400 (Bad Request) error
      return res.status(400).json({
        success: false,
        message: "The password and confirm password does not match",
      });
    }

    // Update password
    const encryptedPassword = await bcrypt.hash(newPassword, 10);
    const updatedUserDetails = await User.findByIdAndUpdate(
      req.user.id,
      { password: encryptedPassword },
      { new: true }
    );

    // Send notification email
    try {
      const emailResponse = await mailSender(
        updatedUserDetails.email,
        "Password Updated Successfully",
        passwordUpdated(updatedUserDetails.email, updatedUserDetails.firstName)
      );
      console.log("Email sent successfully:", emailResponse.response);
    } catch (error) {
      // If there's an error sending the email, log the error and return a 500 (Internal Server Error) error
      console.error("Error occurred while sending email:", error);
      return res.status(500).json({
        success: false,
        message: "Error occurred while sending email",
        error: error.message,
      });
    }

    // Return success response
    return res
      .status(200)
      .json({ success: true, message: "Password updated successfully" });
  } catch (error) {
    // If there's an error updating the password, log the error and return a 500 (Internal Server Error) error
    console.error("Error occurred while updating password:", error);
    return res.status(500).json({
      success: false,
      message: "Error occurred while updating password",
      error: error.message,
    });
  }
};
