const Section = require("../models/Section");
const Course = require("../models/Course");
const SubSection = require("../models/Subsection");

exports.createSection = async (req, res) => {
  try {
    //data fecth //
    //console.log("heyyy sadiq");
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
    console.log("newSection ", newSection, courseId);
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
    console.log("updated details : ", updateCourseDetails);

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
    const { sectionName, sectionId, courseId } = req.body;
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
    const course = await Course.findById(courseId)
      .populate({
        path: "courseContent",
        populate: {
          path: "subsection",
        },
      })
      .exec();
    return res.status(200).json({
      success: true,
      message: "section Updated successfully",
      data: course,
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
    console.log("heyy");
    const { sectionId, courseId } = req.body;
    //console.log(sectionId, " ", courseId);
    const C = await Course.findByIdAndUpdate(courseId, {
      $pull: {
        courseContent: sectionId,
      },
    });
    //console.log("course: ", C);
    const section = await Section.findById(sectionId);
    //console.log(section);
    //console.log(sectionId, courseId);
    if (!section) {
      return res.status(404).json({
        success: false,
        message: "Section not found",
      });
    }
    // Delete the associated subsections
    await SubSection.deleteMany({ _id: { $in: section.subsection } });

    await Section.findByIdAndDelete(sectionId);

    // find the updated course and return it
    const course = await Course.findById(courseId)
      .populate({
        path: "courseContent",
        populate: {
          path: "subsection",
        },
      })
      .exec();

    res.status(200).json({
      success: true,
      message: "Section deleted",
      data: course,
    });
  } catch (error) {
    console.error("Error deleting section:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};
