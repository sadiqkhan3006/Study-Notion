const User = require("../models/User");
const mailSender = require("../utils/mailSender");
const bcrypt = require("bcrypt");
const crypto = require("crypto");
const { passwordUpdated } = require("../mail/passwordUpdateEmail");
//reset password token
exports.resetPasswordToken = async (req, res) => {
  try {
    //get email from req//
    const { email } = req.body;
    //check user for email //
    const user = await User.findOne({ email });
    if (!user) {
      return res.json({
        success: false,
        message: `Your email is not registered`,
      });
    }
    //generate token
    const token = crypto.randomUUID();
    console.log("resetPasswordToken: ", token);
    //update user by adding token and expiration time
    const updateddetails = await User.findOneAndUpdate(
      { email },
      {
        token: token,
        resetPasswordExpires: Date.now() + 5 * 60 * 1000, //5 min
      },
      { new: true }
    );
    //create url
    const url = `https://studynotion-backend-459p.onrender.com/update-password/${token}`;
    //send mail containing the url
    await mailSender(
      email,
      "Password Reset Link",
      `Password reset Link ${url}`
    );
    //return response //
    return res.json({
      success: true,
      message:
        "Email sent successfully, please check email and change the password",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: error.message,
      message: "Something went wrong",
    });
  }
};

exports.resetPassword = async (req, res) => {
  try {
    //data fetch
    const { password, confirmPassword, token } = req.body; //frontend ne toke ko body mei dala hai
    //validate
    if (password !== confirmPassword) {
      return res.json({
        success: false,
        message: "Passwords are not matching",
      });
    }
    //get user details from db using token//
    const userData = await User.findOne({ token });
    if (!userData) {
      return res.json({
        success: false,
        message: "Token Invalid",
      });
    }
    //token time check
    if (userData.resetPasswordExpires < Date.now()) {
      return res.json({
        success: false,
        message: "Token expired",
      });
    }

    //hash pass//
    const hashedPassword = await bcrypt.hash(password, 10);
    //update pass//
    const passwordUpdateResponse = await User.findOneAndUpdate(
      { token },
      { password: hashedPassword },
      { new: true }
    );
    await mailSender(
      userData.email,
      "Password Changed",
      passwordUpdated(userData.email, userData.firstName)
    );
    return res.json({
      success: true,
      message: "Password reset successfully",
      Updated_Entry: passwordUpdateResponse,
    });
  } catch (error) {
    console.log("Error while reseting password");
    return res.json({
      success: false,
      message: "Something went wrong",
      error: error.message,
    });
  }
};
