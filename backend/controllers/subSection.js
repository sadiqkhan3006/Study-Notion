const Section = require("../models/Section");
const Subsection = require("../models/Subsection");
const { uploadImageToCloudinary } = require("../utils/imageUploader");
require("dotenv").config();
exports.createSubsection = async (req, res) => {
  try {
    //fetch data //
    const { sectionId, title, timeDuration, description } = req.body;
    //extract files/video
    const video = req.files.videoFile;
    //validation
    if (!sectionId || !title || !timeDuration || !description) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }
    //upload to cloudinary //
    const uploadDetails = await uploadImageToCloudinary(
      video,
      process.env.FOLDER_NAME
    );
    //create a subsection//
    const SubsectionDetails = await Subsection.create({
      title,
      timeDuration,
      description,
      videoUrl: uploadDetails.secure_url,
    });
    //update section with subsection ObjectId/
    const UpdatedSection = await Section.findByIdAndUpdate(
      { _id: sectionId },
      {
        $push: {
          subsection: SubsectionDetails._id,
        },
      },
      { new: true }
    )
      .populate("subsection")
      .exec();
    //return response
    return res.status(200).json({
      success: true,
      message: "Subsection created successfully",
      UpdatedSection,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Something went wrong while updating section",
      error: error.message,
    });
  }
};
exports.updateSubsection = async (req, res) => {
  try {
    // Get data from the request
    const { subsectionId, title, timeDuration, description } = req.body;

    // Check if the required fields are provided
    if (!subsectionId || !title || !timeDuration || !description) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    // TODO: Add code to update the subsection here
    const updatedSubsection = await Subsection.findOneAndUpdate(
      { _id: subsectionId },
      {
        title,
        timeDuration,
        description,
      },
      { new: true }
    );

    // Check if the subsection was not found
    if (!updatedSubsection) {
      return res.status(404).json({
        success: false,
        message: "Subsection not found",
      });
    }

    // Return success response
    return res.status(200).json({
      success: true,
      message: "Subsection updated successfully",
      updatedSubsection,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Something went wrong while updating subsection",
      error: error.message,
    });
  }
};

exports.deleteSubsection = async (req, res) => {
  try {
    // Get the 'subsectionId' from the request parameters or body
    const { subsectionId } = req.params; // Assuming 'subsectionId' is in the URL parameters

    // Check if 'subsectionId' is provided
    if (!subsectionId) {
      return res.status(400).json({
        success: false,
        message: "Subsection ID is required",
      });
    }

    // TODO: Implement subsection deletion logic here
    const deletedSubsection = await Subsection.findOneAndDelete({
      _id: subsectionId,
    });

    // Check if the subsection was not found
    if (!deletedSubsection) {
      return res.status(404).json({
        success: false,
        message: "Subsection not found",
      });
    }

    // Return success response
    return res.status(200).json({
      success: true,
      message: "Subsection deleted successfully",
      deletedSubsection,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Something went wrong while deleting subsection",
      error: error.message,
    });
  }
};
