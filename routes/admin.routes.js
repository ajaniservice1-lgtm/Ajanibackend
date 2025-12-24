import express from "express";
import { protect, isAdmin } from "../middlewares/auth.middleware.js";
import { approveVendor, rejectVendor } from "../controllers/admin.controller.js";

const router = express.Router();

// All admin routes require authentication and admin role
router.use(protect);
router.use(isAdmin);

// Approve a vendor account
router.patch("/vendors/:vendorId/approve", approveVendor);

// Reject a vendor account (optional `reason` in body)
router.patch("/vendors/:vendorId/reject", rejectVendor);

export default router;
