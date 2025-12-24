import User from "../models/user.model.js";
import catchAsync from "../utils/catchAsync.js";
import AppError from "../utils/errorHandler.js";
import sendEmail from "../utils/sendEmail.js";

export const approveVendor = catchAsync(async (req, res, next) => {
  const { vendorId } = req.params;

  const user = await User.findById(vendorId);
  if (!user || user.role !== "vendor") {
    return next(new AppError(404, "Vendor not found"));
  }

  if (!user.vendor) {
    return next(new AppError(400, "Vendor profile data missing"));
  }

  user.vendor.approvalStatus = "approved";
  user.vendor.approvedAt = Date.now();
  user.isVerified = true;
  user.isActive = true;

  await user.save();

  // Notify vendor (best-effort)
  sendEmail({
    to: user.email,
    subject: "Your vendor account has been approved",
    html: `<p>Hi ${user.firstName},</p><p>Your vendor account has been approved by our team. You can now access vendor features on the platform.</p>`,
  }).catch(err => console.error("Email send failed:", err));

  res.status(200).json({ message: "Vendor approved successfully", data: user });
});

export const rejectVendor = catchAsync(async (req, res, next) => {
  const { vendorId } = req.params;
  const { reason } = req.body;

  const user = await User.findById(vendorId);
  if (!user || user.role !== "vendor") {
    return next(new AppError(404, "Vendor not found"));
  }

  if (!user.vendor) {
    return next(new AppError(400, "Vendor profile data missing"));
  }

  user.vendor.approvalStatus = "rejected";
  user.vendor.approvedAt = null;
  user.isVerified = false;
  user.isActive = false;

  await user.save();

  // Notify vendor with optional reason (best-effort)
  sendEmail({
    to: user.email,
    subject: "Your vendor account application was not approved",
    html: `<p>Hi ${user.firstName},</p><p>We reviewed your vendor application and decided not to approve it at this time.</p>
           ${reason ? `<p>Reason provided: ${reason}</p>` : ""}
           <p>If you believe this is a mistake, please contact support.</p>`,
  }).catch(err => console.error("Email send failed:", err));

  res.status(200).json({ message: "Vendor rejected", data: user });
});

export default { approveVendor, rejectVendor };
