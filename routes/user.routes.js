import express from "express";
import {
  getUser,
  getUsers,
  getUsersByVendor,
  updateUser,
  deleteUser,
} from "../controllers/user.controller.js";
import { protect } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.use(protect);
router.get("/", getUsers);
router.get("/:id", getUser).patch("/:id", updateUser).delete("/:id", deleteUser);
router.get("/:vendorId", getUsersByVendor);

export default router;
