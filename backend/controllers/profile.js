const Profile = require("../models/Profile");
const User = require("../models/User");
const Course = require("../models/Course");
//create profile karne ki need nhi hai kyuki  null pada hua hai user controller mein//

exports.updateProfile = async (req, res) => {
  try {
    //get data
    const { gender, dateOfBirth = "", about = "", contactNumber } = req.body;
    const id = req.user.id;

    //validation//
    if (!contactNumber || !gender || id) {
      return res.status(400).json({
        success: true,
        message: "All fields are required",
      });
    }
    //find profile //
    const userDetails = await User.findById({ _id: id });
    const profileId = userDetails.additionalDetails;
    const profileDetails = await Profile.findById({ _id: profileId });

    //update profile //
    profileDetails.dateOfBirth = dateOfBirth;
    profileDetails.about = about;
    profileDetails.gender = gender;
    profileDetails.contactNumber = contactNumber;

    await profileDetails.save();
    //retrunr respkonse
    return res.status(200).json({
      success: true,
      message: "Profile Updated successfully",
      profileDetails,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
exports.deleteAccount = async (req, res) => {
  try {
    //get id //
    const id = req.user.id;
    //validation//
    const userDetails = await User.findById({ _id: id });
    if (!userDetails) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }
    //delete profile //
    if (req.user.role === "Student") {
      //decreasing student enrolled

      await Course.updateMany(
        { _id: { $in: userDetails.courses } }, // Query condition
        {
          $pull: {
            studentsEnrolled: id,
          },
        }
      );
    }
    if (req.user.role === "Instructor") {
      //pending
      await Course.deleteMany({ instructor: id });
    }
    await Profile.findByIdAndDelete({ _id: userDetails.additionalDetails });
    await User.findByIdAndDelete({ _id: id });
    //return response //
    return res.status(200).json({
      success: true,
      message: "Your Id is successfully deleted",
    });

    //find out crone job
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: error.message,
      message: "Error while deleting account",
    });
  }
};

exports.getAllUserDetails = async (req, res) => {
  try {
    const id = req.user.id;
    const userDetails = await User.findById({ _id: id })
      .populate("additionalDetails")
      .exec();

    return res.status(200).json({
      success: true,
      message: "User data fetched Successfully",
      userDetails,
    });
  } catch (error) {
    return res.status(500).json({
      success: true,
      message: error.message,
    });
  }
};
