const User = require("../models/User");
const OTP = require("../models/OTP");
const otpGenerator = require("otp-generator");
const bcrypt = require("bcrypt");
const Profile = require("../models/Profile");
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
      !contactNumber ||
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
    if (recentOtp.length() == 0) {
      //otp not found//
      return res.status(400).json({
        success: false,
        message: `OTP is not valid`,
      });
    }
    if (otp !== recentOtp) {
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
