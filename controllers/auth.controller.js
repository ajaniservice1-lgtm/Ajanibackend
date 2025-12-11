import supabase from "../config/supabase.js";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { generateToken } from "../utils/generateToken.js";
import User from "../models/user.model.js";
import catchAsync from "../utils/catchAsync.js";
import AppError from "../utils/errorHandler.js";
import sendEmail from "../utils/sendEmail.js";

export const register = catchAsync(async (req, res) => {
  const { firstName, lastName, email, phone, password, confirmPassword, role } = req.body;

  // Check if all fields are provided
  if (!firstName || !lastName || !email || !password)
    throw new AppError(400, "All fields are required");

  const verificationToken = crypto.randomBytes(32).toString("hex");
  const verificationTokenExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

  const user = await User.create({
    firstName,
    lastName,
    email,
    phone,
    password,
    confirmPassword,
    role,
    verificationToken,
    verificationTokenExpires,
  });

  const verifyLink = `${req.protocol}://${req.get("host")}/api/v1/auth/verify?token=${verificationToken}`;

  await sendEmail({
    from: "Ajani AI <noreply@ajani.com>",
    to: email,
    subject: "Verify your account",
    html: `<p>Hi ${firstName || "there"},</p>
           <p>Please verify your account by clicking the link below:</p>
           <a href="${verifyLink}">Verify my account</a>
           <p>This link will expire in 24 hours.</p>
           <p>If button does not work, you can copy and paste the link below into your browser:</p>
           <p>${verifyLink}</p>

           <p>If you did not request this verification, please ignore this email.</p>
           <p>Thank you for registering with us.</p>
           <p>Best regards,</p>
           <p>Ajani Team</p>`,
  });

  res.status(201).json({ message: "Check your email to verify", data: user });
});

export const login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  // Check if all fields are provided
  if (!email || !password) throw new AppError(400, "All fields are required");

  // Check if user exists
  const user = await User.findOne({ email }).select("+password");

  if (!user || !(await user.correctPassword(password, user.password)))
    return next(new AppError("Incorrect email or password", 400));

  // Check if user is verified
  if (!user.isVerified) throw new AppError(400, "User is not verified");

  // Check if user is active
  if (!user.isActive) throw new AppError(400, "User is not active");

  // Generate token - When everything is correct
  const token = generateToken(user);

  res.status(200).json({ message: "Login successful", data: user, token });
});

// Verify email
export const verifyEmail = catchAsync(async (req, res) => {
  const token = req.query.token || req.body.token;
  if (!token) throw new AppError(400, "Verification token missing");

  const user = await User.findOne({
    verificationToken: token,
    verificationTokenExpires: { $gt: Date.now() },
  });

  if (!user) throw new AppError(400, "Token invalid or expired");

  user.isVerified = true;
  user.verificationToken = null;
  user.verificationTokenExpires = null;
  await user.save({ validateBeforeSave: false });

  res.status(200).json({ message: "Email verified", data: user });
});
