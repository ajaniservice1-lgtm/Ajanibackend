import express from "express";
import {
  createListing,
  getListings,
  getListingById,
  getListingsByVendorId,
  updateListing,
  deleteListing,
} from "../controllers/listing.controller.js";
import { protect } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.post("/", protect, createListing);
router.get("/", getListings);
router.get("/:id", getListingById);
router.get("/vendor/:vendorId", getListingsByVendorId);
router.patch("/:id", protect, updateListing);
router.delete("/:id", protect, deleteListing);

export default router;
