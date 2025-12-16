import { generateToken } from "../utils/generateToken.js";
import User from "../models/user.model.js";
import catchAsync from "../utils/catchAsync.js";
import AppError from "../utils/errorHandler.js";
// import sendEmail from "../utils/sendEmail.js";
import crypto from "crypto";
import sendEmailResend from "../utils/resend.js";
import sendEmail from "../utils/sendEmail.js";
import {
  userRegistrationEmailTemplate,
  vendorRegistrationEmailTemplate,
} from "../utils/emailTemplates.js";

export const register = catchAsync(async (req, res, next) => {
  const { firstName, lastName, email, phone, password, role } = req.body;

  // Check if all fields are provided
  if (!firstName || !lastName || !email || !password)
    return next(new AppError(400, "All fields are required"));

  const user = await User.create({
    firstName,
    lastName,
    email,
    phone,
    password,
    role,
  });

  // Send email in background (don't wait for it)
  sendEmail({
    to: email,
    subject: "Welcome to Ajani! Registration Successful",
    html:
      role === "user"
        ? userRegistrationEmailTemplate(firstName)
        : vendorRegistrationEmailTemplate(firstName),
  }).catch(err => {
    console.error("Email sending failed:", err);
  });

  // if (role === "user") {
  //   sendEmailResend({
  //     to: email,
  //     subject: "Welcome to Ajani! Registration Successful",
  //     html: `<p>Hi ${firstName || "there"},</p>
  //          <p>Congratulations! Your account has been successfully created.</p>
  //          <p>You can now start using all the features of Ajani.</p>
  //           <a href="${process.env.FRONTEND_URL}" style="text-decoration: none; padding: 10px; border-radius: 5px; background-color: #007bff; display: inline-block; margin-top: 10px; color: white;">Explore Our Listings</a>
  //          <p>Thank you for joining us!</p>
  //          <p>Best regards,</p>
  //          <p>Ajani Team</p>`,
  //   });
  // } else if (role === "vendor") {
  //   sendEmailResend({
  //     to: email,
  //     subject: "Welcome to Ajani! Registration Successful",
  //     html: `<p>Hi ${firstName || "there"},</p>
  //          <p>Congratulations! Your vendor account has been successfully created.</p>
  //          <p>Please wait for your account to be approved by the admin as it currently under review. This may take up to 24 hours.</p>
  //           <p>Once approved, you will receive an email with full access to your vendor account.</p>
  //           <a href="${process.env.FRONTEND_URL}/vendor/login" style="text-decoration: none; padding: 10px; border-radius: 5px; background-color: #007bff; display: inline-block; margin-top: 10px; color: white;">Login to your vendor account</a>
  //           <p>Thank you for joining us!</p>
  //           <p>Best regards,</p>
  //           <p>Ajani Team</p>`,
  //   });
  // }

  // Generate token - When everything is correct
  const token = generateToken(user);

  // Remove password from output
  user.password = undefined;

  res
    .status(201)
    .json({ message: "Registration successful! Welcome email sent.", data: user, token });
});

// LOGIN USER
export const login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  // Check if all fields are provided
  if (!email || !password) throw new AppError(400, "All fields are required");

  // Check if user exists and include password field (which is normally excluded)
  const user = await User.findOne({ email }).select("+password");

  if (!user || !(await user.correctPassword(password, user.password)))
    return next(new AppError("Incorrect email or password", 400));

  // Generate token - When everything is correct
  const token = generateToken(user);

  // Remove password from output
  user.password = undefined;

  res.status(200).json({ message: "Login successful", data: user, token });
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
  sendEmail({
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

  // Remove password from output
  user.password = undefined;

  res.status(200).json({ message: "Password reset successful", data: user });
});
