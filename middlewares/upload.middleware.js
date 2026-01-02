import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import cloudinary from "../config/cloudinary.js";
import { v4 as uuidv4 } from "uuid";

const storage = new CloudinaryStorage({
  cloudinary,
  params: async (req, file) => {
    const customId = uuidv4(); // YOU control this

    return {
      folder: "uploads",
      public_id: customId, // 👈 your ID
      allowed_formats: ["jpg", "png", "jpeg", "webp"],
    };
  },
});

const upload = multer({
  storage,
  limits: { files: 4 },
});

export default upload;
