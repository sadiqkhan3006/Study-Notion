const cloudinary = require("cloudinary").v2;
exports.uploadImageToCloudinary = async (
  file,
  folder,
  del = false,
  type,
  height,
  quality
) => {
  const options = { folder };
  if (height) {
    options.height = height;
  }
  if (quality) {
    options.quality = quality;
  }
  options.resource_type = "auto";
  if (del !== false) {
    const public_id = `Study-Notion/${del}`;
    console.log("Checking existence of resource with public ID:", public_id);
    try {
      console.log("type: ", type);
      const result = await cloudinary.api.resource(public_id, {
        type: "upload",
        resource_type: type,
      });
      console.log("Resource details before deletion:", result);
      if (!result) {
        console.log("Resource not found. Skipping deletion.");
        return { result: "not found" };
      }
      const deletionResult = await cloudinary.uploader.destroy(public_id, {
        type: "upload",
        resource_type: type,
      });
      console.log("Deletion result:", deletionResult);
      return deletionResult;
    } catch (error) {
      console.error("Error deleting from Cloudinary:", error.message);
      throw error;
    }
  }

  return cloudinary.uploader.upload(file.tempFilePath, options);
};
