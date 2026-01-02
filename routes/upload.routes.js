import express from "express";
import upload from "../middlewares/upload.middleware.js";
import { deleteImage, uploadImages } from "../controllers/upload.controller.js";    

const router = express.Router();
router.post("/upload", upload.array("images", 4), uploadImages);
router.delete("/delete", deleteImage);
export default router;
