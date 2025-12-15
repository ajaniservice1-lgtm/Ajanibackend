import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import validator from "validator";

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
      lowercase: true,
      trim: true,
      default: null,
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      select: false,
      minlength: [8, "Password must be at least 8 characters long"],
      maxlength: [32, "Password must be less than 32 characters long"],
      trim: true,
    },

    role: {
      type: String,
      enum: ["user", "vendor", "admin"],
      default: "user",
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
  },
  { timestamps: true }
);

// Hash password before saving
userSchema.pre("save", async function () {
  // Only run if password was actually modified
  if (!this.isModified("password")) return;

  // Pass the password with cost of 12 (CPU intensive)
  this.password = await bcrypt.hash(this.password, 12);
});

// INSTANCE METHOD: METHOD AVAILABLE TO ALL DOCS IN THE COLLECTION
userSchema.methods.correctPassword = async function (candidatePassword, userPassword) {
  // NOTE: this.password will not work because in the schema password has {select: false}
  return await bcrypt.compare(candidatePassword, userPassword);
};

const User = mongoose.model("User", userSchema);

export default User;
