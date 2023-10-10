const RatingAndReview = require("../models/RatingAndReview");
const Course = require("../models/Course");
const { default: mongoose } = require("mongoose");

//create rating

exports.createRating = async (req, res) => {
  try {
    //get userid
    const userId = req.user.id;

    //fecthdata from req
    const { rating, review, courseId } = req.body;
    //check user enrolled or not
    const courseDetails = await Course.findOne({
      _id: courseId,
      studentsEnrolled: { $elemMatch: { $eq: userId } },
    });
    if (!courseDetails) {
      return res.status(404).json({
        success: false,
        message: "Student is not enrolled in the course",
      });
    }
    //check if user already reviewed the course
    const alreadyReviewed = await RatingAndReview.findOne({
      user: userId,
      course: courseId,
    });
    if (!alreadyReviewed) {
      return res.status(403).json({
        success: false,
        message: "Course is already reviewed by the user ",
      });
    }
    //create rating
    const ratingReview = await RatingAndReview.create({
      rating,
      review,
      course: courseId,
      user: userId,
    });
    //update course model
    const updatedCourseDetails = await Course.findByIdAndUpdate(
      {
        _id: courseId,
      },
      {
        $push: {
          ratingAndReviews: ratingReview._id,
        },
      },
      {
        new: true,
      }
    );
    console.log(updatedCourseDetails);
    return res.status(200).json({
      success: true,
      message: "Rating review created",
      ratingReview,
    });
  } catch (error) {
    console.log(error.message);
    return res.status(500).json({
      success: false,
      message: "Something went wrong while creating rating and raview",
      error: error.message,
    });
  }
};

//get aveerge rating for a course //

exports.getAverageRating = async (req, res) => {
  try {
    //get courseId //
    const courseId = req.body.courseId;
    //calc average rating /
    const result = await RatingAndReview.aggregate([
      {
        $match: {
          course: new mongoose.Types.ObjectId(courseId),
        },
      },
      {
        $group: {
          _id: null, //ek single group mei wrap kardiya
          averageRating: { $avg: "rating" },
        },
      },
    ]);
    //return rating
    if (result.length > 0) {
      return res.status(200).json({
        success: true,
        averageRating: result[0].averageRating,
      });
    }

    //if no review exist//
    return res.status(200).json({
      success: true,
      message: "Averayge rating is zero ",
      averageRating: 0,
    });
  } catch (error) {
    console.log(error.message);
    return res.status(500).json({
      success: false,
      message: "Something went wrong while creating rating and raview",
      error: error.message,
    });
  }
};

exports.getAllRating = async (req, res) => {
  try {
    const allReviews = await RatingAndReview.find({})
      .sort({ rating: "desc" })
      .populate({
        path: "user",
        select: "firstName lastName email image",
      })
      .populate({
        path: "course",
        select: "courseName",
      })
      .exec();

    return res.status(200).json({
      success: true,
      message: "All reviews fetched successfully ",
      data: allReviews,
    });
  } catch (error) {
    console.log(error.message);
    return res.status(500).json({
      success: false,
      message: "Something went wrong while creating rating and raview",
      error: error.message,
    });
  }
};
