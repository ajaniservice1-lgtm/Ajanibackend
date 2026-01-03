import { generateToken } from "../utils/generateToken.js";
import User from "../models/user.model.js";
import catchAsync from "../utils/catchAsync.js";
import AppError from "../utils/errorHandler.js";
import crypto from "crypto";
import bcrypt from "bcryptjs";
import sendEmailResend from "../utils/resend.js";
import {
  userRegistrationEmailTemplate,
  vendorRegistrationEmailTemplate,
  userConfirmOtpEmailTemplate,
  vendorConfirmOtpEmailTemplate,
} from "../utils/emailTemplates.js";

export const register = catchAsync(async (req, res, next) => {
  const { firstName, lastName, email, phone, password, role, vendor } = req.body;

  // Check if all fields are provided
  if (!firstName || !lastName || !email || !password)
    return next(new AppError(400, "All fields are required"));

  // Check if user already exists
  const existingUser = await User.findOne({ email });
  if (existingUser) return next(new AppError(400, "User with this email already exists"));

  // CREATE USER
  const user = await User.create({
    firstName,
    lastName,
    email,
    phone,
    password,
    role,
    vendor,
  });

  // CREATE 6 DIGIT OTP FOR USER OR VENDOR
  const otp = Math.floor(100000 + Math.random() * 900000);
  const expiryMinutes = 10;
  const verificationToken = otp;
  const verificationTokenExpires = new Date(Date.now() + expiryMinutes * 60 * 1000);
  user.verificationToken = verificationToken;
  user.verificationTokenExpires = verificationTokenExpires;

  // SAVE USER
  await user.save();

  // Send email in background (don't wait for it)
  sendEmailResend({
    to: email,
    subject: "Welcome to Ajani! Registration Successful",
    html:
      role === "user"
        ? userConfirmOtpEmailTemplate(firstName, otp, expiryMinutes)
        : vendorConfirmOtpEmailTemplate(firstName, otp, expiryMinutes),
  }).catch(err => {
    console.error("Email sending failed:", err);
  });

  res.status(201).json({ message: "Account created successfully! OTP email sent.", data: user });
});

// LOGIN USER
export const login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  // Check if all fields are provided
  if (!email || !password) throw new AppError(400, "All fields are required");

  // Check if user exists and include password field (which is normally excluded)
  // Use lean() for faster queries - returns plain object instead of Mongoose document
  const user = await User.findOne({ email }).select("+password").lean();

  if (!user) return next(new AppError(400, "Incorrect email or password"));

  const isPasswordCorrect = await bcrypt.compare(password, user.password);
  if (!isPasswordCorrect) return next(new AppError(400, "Incorrect email or password"));

  // Generate token - When everything is correct
  const token = generateToken(user);

  // Remove password and sensitive fields from output
  delete user.password;
  delete user.verificationToken;
  delete user.verificationTokenExpires;
  delete user.resetToken;
  delete user.resetTokenExpires;

  res.status(200).json({ message: "Login successful! Welcome to Ajani.", data: user, token });
});

// FORGOT PASSWORD
export const forgotPassword = catchAsync(async (req, res) => {
  const { email } = req.body;

  // Check if email is provided
  if (!email) throw new AppError(400, "Email is required");

  // Check if user exists
  const user = await User.findOne({ email });
  if (!user) throw new AppError(400, "Reset link will be sent if it exists");

  // Generate reset token
  const resetToken = crypto.randomBytes(32).toString("hex");
  const resetTokenExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
  const resetLink = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;

  // Save reset token to user
  user.resetToken = resetToken;
  user.resetTokenExpires = resetTokenExpires;
  await user.save();

  // Send reset email in background (don't wait for it)
  sendEmailResend({
    to: email,
    subject: "Reset your password",
    html: `<p>Hi ${user.firstName || "there"},</p>
    <p>Click the link below to reset your password:</p>
    <p>This link will expire in 10 minutes.</p>
    <a href="${resetLink}">Reset my password</a>`,
  }).catch(err => console.error("Email sending failed:", err));

  res.status(200).json({
    message: "Reset password email sent",
  });
});

// RESET PASSWORD
export const resetPassword = catchAsync(async (req, res) => {
  const { token, password } = req.body;
  if (!token || !password) throw new AppError(400, "All fields are required");

  const user = await User.findOne({ resetToken: token, resetTokenExpires: { $gt: Date.now() } });
  if (!user) throw new AppError(400, "Invalid or expired token");

  user.resetToken = null;
  user.resetTokenExpires = null;
  await user.save();

  // Remove sensitive data from output
  user.password = undefined;
  user.verificationToken = undefined;
  user.verificationTokenExpires = undefined;
  user.resetToken = undefined;
  user.resetTokenExpires = undefined;

  res.status(200).json({ message: "Password reset successful! Welcome to Ajani.", data: user });
});

// VERIFY OTP
export const verifyOtp = catchAsync(async (req, res) => {
  const { email, otp } = req.body;
  if (!email || !otp) throw new AppError(400, "All fields are required");

  const user = await User.findOne({
    email,
    verificationToken: otp,
    verificationTokenExpires: { $gt: Date.now() },
  });
  if (!user) throw new AppError(400, "Invalid or expired OTP");

  user.verificationToken = null;
  user.verificationTokenExpires = null;
  user.isVerified = true;
  user.isActive = true;

  await user.save();

  // Send welcome email
  sendEmailResend({
    to: email,
    subject: "Welcome to Ajani! Registration Successful",
    html:
      user.role === "user"
        ? userRegistrationEmailTemplate(user.firstName)
        : vendorRegistrationEmailTemplate(user.firstName),
  }).catch(err => console.error("Email sending failed:", err));

  // Generate token - When everything is correct
  const token = generateToken(user);

  // Remove password from output
  user.password = undefined;
  user.verificationToken = undefined;
  user.verificationTokenExpires = undefined;
  user.resetToken = undefined;
  user.resetTokenExpires = undefined;

  res.status(200).json({ message: "OTP verified successfully", data: user, token });
});

// RESEND OTP
export const resendOtp = catchAsync(async (req, res) => {
  const { email } = req.body;
  if (!email) throw new AppError(400, "Email is required");

  const user = await User.findOne({ email });
  if (!user) throw new AppError(400, "User not found");

  const otp = Math.floor(100000 + Math.random() * 900000);
  const expiryMinutes = 10;
  const verificationToken = otp;
  const verificationTokenExpires = new Date(Date.now() + expiryMinutes * 60 * 1000);
  user.verificationToken = verificationToken;
  user.verificationTokenExpires = verificationTokenExpires;
  await user.save();

  sendEmailResend({
    to: email,
    subject: "Resend OTP",
    html:
      user.role === "user"
        ? userConfirmOtpEmailTemplate(user.firstName, otp, expiryMinutes)
        : vendorConfirmOtpEmailTemplate(user.firstName, otp, expiryMinutes),
  }).catch(err => console.error("Email sending failed:", err));

  res.status(200).json({ message: "OTP resent successfully" });
});
