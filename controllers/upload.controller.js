import cloudinary from "../config/cloudinary.js";
import catchAsync from "../utils/catchAsync.js";

export const uploadImages = catchAsync(async (req, res) => {
  if (!req.files || req.files.length === 0) {
    return res.status(400).json({
      status: "error",
      message: "No files uploaded. Please send files with field name 'images'",
    });
  }

  const images = req.files.map(file => ({
    url: file.path,
    public_id: file.filename.replace(/^uploads\//, ""), // Remove uploads/ prefix
  }));

  res.status(200).json({ status: "success", data: images });
});

export const deleteImage = catchAsync(async (req, res) => {
  const { public_id } = req.body;

  if (!public_id) {
    return res.status(400).json({ message: "public_id required" });
  }

  await cloudinary.uploader.destroy(`uploads/${public_id}`);

  res.json({ success: true, message: "Image deleted successfully" });
});
