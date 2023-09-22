const Tags = require("../models/Tags");

exports.createTag = async (req, res) => {
  try {
    const { description, name } = req.body;
    //validation
    if (!description || !name) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }
    //create entry in db //
    const tagDetails = await Tags.create({
      name,
      description,
    });
    console.log("Tag details: ", tagDetails);
    return res.status(200).json({
      success: true,
      message: "Tag created successfully",
    });
  } catch (error) {
    console.log("Error occured while creating a tag");
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
exports.showAllTags = async (req, res) => {
  try {
    const allTags = await Tags.find({}, { name: true, description: true });

    return res.status(200).json({
      success: true,
      message: "All tags fetched successfully",
      allTags,
    });
  } catch (error) {
    console.log("Error occured while fetching tags");
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
