import User from "../models/user.model.js";
import catchAsync from "../utils/catchAsync.js";
import AppError from "../utils/errorHandler.js";

export const getUser = catchAsync(async (req, res) => {
  const userId = req.params.id || req.user.id;

  // Users can only get their own profile unless they're admin
  if (req.user.role !== "admin" && userId !== req.user.id.toString()) {
    throw new AppError(403, "You can only access your own profile");
  }

  const user = await User.findById(userId);

  if (!user) {
    throw new AppError(404, "User not found");
  }

  res.status(200).json({
    message: "User retrieved successfully",
    data: user,
  });
});

export const getUsers = catchAsync(async (req, res) => {
  // Only admin can access this
  if (req.user.role !== "admin") {
    throw new AppError(403, "Only admin can access this resource");
  }

  const users = await User.find().select(
    "-password -confirmPassword -verificationToken -verificationTokenExpires"
  );

  res.status(200).json({
    message: "Users retrieved successfully",
    data: users,
    count: users.length,
  });
});

export const getUsersByVendor = catchAsync(async (req, res) => {
  // Only vendor or admin can access this
  if (req.user.role !== "vendor" && req.user.role !== "admin") {
    throw new AppError(403, "Only vendors and admins can access this resource");
  }

  // Get vendorId from query parameter
  const vendorId = req.query.vendorId;

  // If no vendorId provided and user is a vendor, use their own ID
  let targetVendorId = vendorId || (req.user.role === "vendor" ? req.user.id : null);

  if (!targetVendorId) {
    throw new AppError(400, "Vendor ID is required");
  }

  // Vendors can only query their own vendor ID (unless they're admin)
  if (req.user.role === "vendor" && targetVendorId !== req.user.id.toString()) {
    throw new AppError(403, "You can only view users for your own vendor account");
  }

  // Verify that the vendorId exists and is actually a vendor
  const vendor = await User.findById(targetVendorId);
  if (!vendor) {
    throw new AppError(404, "Vendor not found");
  }
  if (vendor.role !== "vendor") {
    throw new AppError(400, "The provided ID does not belong to a vendor");
  }

  // TODO: When BookingRequest/Listing models are available,
  // query users associated with this vendor through those relationships
  // For now, return all users with role "user" (customers)
  // In the future, this should be: users who have bookings/listings with this vendor
  const users = await User.find({ role: "user" }).select(
    "-password -confirmPassword -verificationToken -verificationTokenExpires"
  );

  res.status(200).json({
    message: "Users retrieved successfully",
    data: users,
    count: users.length,
    vendorId: targetVendorId,
  });
});

export const updateUser = catchAsync(async (req, res) => {
  const userId = req.params.id || req.user.id;
  const {
    firstName,
    lastName,
    email,
    phone,
    password,
    confirmPassword,
    role,
    isActive,
    isVerified,
  } = req.body;
  const isAdmin = req.user.role === "admin";

  // Users can only edit their own profile unless they're admin
  if (!isAdmin && userId !== req.user.id.toString()) {
    throw new AppError(403, "You can only edit your own profile");
  }

  const user = await User.findById(userId);

  if (!user) {
    throw new AppError(404, "User not found");
  }

  // Regular users can update: firstName, lastName, password
  // Admin can update: all fields including email, phone, role, isActive, isVerified
  if (firstName !== undefined) user.firstName = firstName;
  if (lastName !== undefined) user.lastName = lastName;

  // Admin-only fields
  if (isAdmin) {
    if (email !== undefined) user.email = email;
    if (phone !== undefined) user.phone = phone;
    if (role !== undefined) user.role = role;
    if (isActive !== undefined) user.isActive = isActive;
    if (isVerified !== undefined) user.isVerified = isVerified;
  } else {
    // Prevent regular users from updating email and phone
    if (email !== undefined || phone !== undefined) {
      throw new AppError(403, "You cannot update email or phone number. Please contact admin.");
    }
    if (role !== undefined || isActive !== undefined || isVerified !== undefined) {
      throw new AppError(403, "You do not have permission to update this field");
    }
  }

  await user.save();

  res.status(200).json({
    message: "User updated successfully",
    data: user,
  });
});

export const deleteUser = catchAsync(async (req, res) => {
  const userId = req.params.id || req.user.id;

  // Users can only delete their own profile unless they're admin
  if (req.user.role !== "admin" && userId !== req.user.id.toString()) {
    throw new AppError(403, "You can only delete your own profile");
  }

  const user = await User.findById(userId);

  if (!user) {
    throw new AppError(404, "User not found");
  }

  await User.findByIdAndDelete(userId);

  res.status(200).json({
    message: "User deleted successfully",
  });
});
