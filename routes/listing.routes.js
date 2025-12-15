import express from "express";
import { createListing, getListings, getListingById } from "../controllers/listing.controller.js";
import { protect } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.post("/", protect, createListing);
router.get("/", getListings);
router.get("/:id", getListingById);

export default router;