const Profile = require("../models/Profile");
const User = require("../models/User");
const Course = require("../models/Course");
const { uploadImageToCloudinary } = require("../utils/imageUploader");
//create profile karne ki need nhi hai kyuki  null pada hua hai user controller mein//

exports.updateProfile = async (req, res) => {
  try {
    //console.log("API HIT ", req.body);
    //get data
    const {
      firstName,
      lastName,
      gender,
      dateOfBirth = "",
      about = "",
      contactNumber,
    } = req.body;
    const id = req.user.id;

    //validation//
    if (!contactNumber || !gender || !id) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }
    //find profile //
    const userDetails = await User.findByIdAndUpdate(
      { _id: id },
      {
        firstName,
        lastName,
      },
      { new: true }
    );
    console.log(userDetails);
    const profileId = userDetails.additionalDetails;
    const profileDetails = await Profile.findById({ _id: profileId });

    //update profile //
    profileDetails.dateOfBirth = dateOfBirth;
    profileDetails.about = about;
    profileDetails.gender = gender;
    profileDetails.contactNumber = contactNumber;

    await profileDetails.save();
    const UpdatedDetails = await User.findById({ _id: id }).populate(
      "additionalDetails"
    );
    //retrunr respkonse
    return res.status(200).json({
      success: true,
      message: "Profile Updated successfully",
      updatedUserDetails: UpdatedDetails,
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
exports.updateDisplayPicture = async (req, res) => {
  try {
    const displayPicture = req.files.displayPicture;
    const userId = req.user.id;
    const image = await uploadImageToCloudinary(
      displayPicture,
      process.env.FOLDER_NAME,
      1000,
      1000
    );
    console.log("Uploaded Image: ", image);
    const updatedProfile = await User.findByIdAndUpdate(
      { _id: userId },
      { image: image.secure_url },
      { new: true }
    );
    res.send({
      success: true,
      message: `Image Updated successfully`,
      data: updatedProfile,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.getEnrolledCourses = async (req, res) => {
  try {
    //console.log("inside controller ", req.user);
    const userId = req.user.id;
    const userDetails = await User.findOne({
      _id: userId,
    })
      .populate("courses")
      .exec();
    if (!userDetails) {
      return res.status(400).json({
        success: false,
        message: `Could not find user with id: ${userDetails}`,
      });
    }
    return res.status(200).json({
      success: true,
      data: userDetails.courses,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
