const Section = require("../models/Section");
const Course = require("../models/Course");

exports.createSection = async (req, res) => {
  try {
    //data fecth //
    const { sectionName, courseId } = req.body;
    if (!sectionName || !courseId) {
      return res.status(400).json({
        success: false,
        message: "Missing properties",
      });
    }

    //create section//
    const newSection = await Section.create({ sectionName });
    //update course //
    const updateCourseDetails = await Course.findByIdAndUpdate(
      { _id: courseId },
      {
        $push: {
          courseContent: newSection._id,
        },
      },
      { new: true }
    )
      .populate({
        path: "courseContent",
        populate: {
          path: "subsection", // Nested field you want to populate
          model: "Subsection", // The model to use for populating 'subsection'
        },
      })
      .exec();
    return res.status(200).json({
      success: true,
      message: "section created successfully",
      updateCourseDetails,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Something went wrong while creating section",
      error: error.message,
    });
  }
};
exports.updateSection = async (req, res) => {
  try {
    const { sectionName, sectionId } = req.body;
    if (!sectionName || !sectionId) {
      return res.status(400).json({
        success: false,
        message: "Missing properties",
      });
    }

    //update data//
    const updatedSection = await Section.findByIdAndUpdate(
      { _id: sectionId },
      { sectionName },
      { new: true }
    );
    return res.status(200).json({
      success: true,
      message: "section Updated successfully",
    });
  } catch (error) {
    console.log("error: ", error.message);
    return res.status(500).json({
      success: false,
      message: "Something went wrong while updating section",
      error: error.message,
    });
  }
};
exports.deleteSection = async (req, res) => {
  try {
    //get id sending id in params
    const { sectionId } = req.params;
    await Section.findByIdAndDelete({ _id: sectionId });
    //TODO : do we need to delete it from course schema ??

    return res.status(200).json({
      success: true,
      message: "Section Deleted successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Something went wrong while deleting section",
      error: error.message,
    });
  }
};
