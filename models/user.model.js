import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import validator from "validator";
import AppError from "../utils/errorHandler.js";

// Vendor Schema (for vendors - needs admin approval)
const vendorSchema = new mongoose.Schema(
  {
    categories: {
      type: [String],
      enum: ["hotel", "restaurant", "shortlet", "services", "event"],
      required: [true, "At least one category is required"],
      validate: {
        validator: function (arr) {
          return arr && arr.length > 0;
        },
        message: "At least one category is required",
      },
    },
    approvalStatus: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
    approvedAt: {
      type: Date,
      default: null,
    },
    businessName: {
      type: String,
      trim: true,
      default: null,
    },
    businessAddress: {
      type: String,
      trim: true,
      default: null,
    },
  },
  { _id: false }
);

// User Schema (for regular users)
const userSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: [true, "First name is required"],
      trim: true,
    },
    lastName: {
      type: String,
      required: [true, "Last name is required"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      validate: [validator.isEmail, "Please provide a valid email"],
      lowercase: true,
      trim: true,
    },
    phone: {
      type: String,
      required: [true, "Phone number is required"],
      validate: [validator.isMobilePhone, "Please provide a valid phone number"],
      trim: true,
      default: null,
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      select: false,
      minlength: [8, "Password must be at least 8 characters long"],
      trim: true,
    },
    profilePicture: {
      type: String,
      default: null,
    },
    verificationToken: {
      type: String,
      default: null,
    },
    verificationTokenExpires: {
      type: Date,
      default: null,
    },
    resetToken: {
      type: String,
      default: null,
    },
    resetTokenExpires: {
      type: Date,
      default: null,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    role: {
      type: String,
      enum: ["user", "admin", "vendor"],
      default: "user",
    },

    vendor: {
      type: vendorSchema,
      default: null,
    },
  },
  { timestamps: true }
);

// Email already has unique: true which creates an index automatically
userSchema.index({ role: 1 });
userSchema.index({ "vendor.approvalStatus": 1 });

// Hash password before saving - for User
userSchema.pre("save", async function () {
  if (!this.isModified("password")) return;
  this.password = await bcrypt.hash(this.password, 12);
});

// Validate vendor categories before saving
userSchema.pre("save", async function () {
  if (this.role === "vendor") {
    if (!this.vendor || !this.vendor.categories || this.vendor.categories.length === 0) {
      throw new AppError(400, "At least one category is required for vendor accounts");
    }
    // Normalize categories: trim and lowercase each category
    if (this.vendor.categories && Array.isArray(this.vendor.categories)) {
      this.vendor.categories = this.vendor.categories.map(cat => cat.trim().toLowerCase());
    }
  }
});

// INSTANCE METHOD: Check password for User
userSchema.methods.correctPassword = async function (candidatePassword, userPassword) {
  return await bcrypt.compare(candidatePassword, userPassword);
};

const User = mongoose.model("User", userSchema);

export default User;
