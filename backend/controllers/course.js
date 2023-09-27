const Course = require("../models/Course");
const Tags = require("../models/Tags");
const User = require("../models/User");
const { uploadImageToCloudinary } = require("../utils/imageUploader");

//create course handler function
exports.createCourse = async (req, res) => {
  try {
    //you are already logged in if you are creating course,
    //we could just fetch the account type from req//
    //as we had inserted the uder in req in auth //
    //but we will try diff method by calling db

    //fetch data;
    const {
      courseName,
      courseDescription,
      courseContent,
      whatYouWillLearn,
      price,
      tag,
    } = req.body;

    //get thumnbnaail//
    const thumbnail = req.files.thumnbnailImage;
    //validation
    if (
      !courseName ||
      !courseDescription ||
      !whatYouWillLearn ||
      !price ||
      !tag ||
      !courseContent
    ) {
      res.status(400).json({
        success: false,
        messsage: "All fields are required",
      });
    }
    //check for instructor //
    const userId = req.user.id;
    const instructorDetails = await User.findById({ _id: userId });
    console.log("Instructor details:", instructorDetails);
    if (!instructorDetails) {
      res.status(404).json({
        success: false,
        messsage: "Instructor details not found",
      });
    }

    //check given tag is valid or not //
    const tagDetails = await Tags.findById({ _id: tag }); //doubt//
    if (!tagDetails) {
      res.status(404).json({
        success: false,
        messsage: "Tag not found",
      });
    }

    //upload image thumbnail to cloudinary//
    const thumnbnailImage = await uploadImageToCloudinary(
      thumbnail,
      process.env.FOLDER_NAME
    );
    //create entry for new course//
    const newCourse = await Course.create({
      courseName,
      description: courseDescription,
      whatYouWillLearn,
      courseContent,
      tag: tagDetails._id,
      thumbnail: thumnbnailImage.secure_url,
      instructor: instructorDetails._id,
      price,
    });

    //User update karo adding this course to user  //
    const updatedUser = await User.findByIdAndUpdate(
      { _id: instructorDetails._id },
      {
        $push: {
          courses: newCourse._id,
        },
      },
      { new: true }
    );
    console.log("updatedUser: ", updatedUser);
    //update tags//
    const updatedTag = await Tags.findByIdAndUpdate(
      { _id: tagDetails._id },
      {
        $push: {
          course: newCourse._id,
        },
      },
      {
        new: true,
      }
    );
    console.log("updatedTag: ", updatedTag);
    res.status(200).json({
      success: true,
      messsage: "Course created Successfully",
      data: newCourse,
    });
  } catch (error) {
    console.log("Something went wrong while creting course");
    console.log(error.messsage);
    res.json({
      success: false,
      messsage: error.messsage,
    });
  }
};

exports.showAllCourses = async (req, res) => {
  try {
    const allCourses = await Course.find(
      {},
      {
        courseName: true,
        price: true,
        thumbnail: true,
        instructor: true,
        studentsEnrolled: true,
        ratingAndReviews: true,
      }
    )
      .populate("instructor")
      .exec();

    res.status(200).json({
      success: true,
      messsage: "Data fecthed successfully",
      data: allCourses,
    });
  } catch (error) {
    console.log("Error while fecthing all courses");
    res.json({
      success: false,
      error: error.messsage,
      messsage: "Cannot fecth all courses",
    });
  }
};
