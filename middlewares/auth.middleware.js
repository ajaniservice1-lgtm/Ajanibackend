import jwt from "jsonwebtoken";
import catchAsync from "../utils/catchAsync.js";
import AppError from "../utils/errorHandler.js";
import User from "../models/user.model.js";
import { promisify } from "util";

export const protect = catchAsync(async (req, res, next) => {
  // 1) Get the token and check if it exist
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
    token = req.headers.authorization.split(" ")[1];
  }

  // Check if token exist
  if (!token) {
    return next(new AppError(401, "Your are not logged in! Please login to get access"));
  }

  // 2) Verifying the token
  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
  console.log(decoded);

  // 3) Check if user still exist
  const freshUser = await User.findById(decoded.id);
  console.log(freshUser);
  if (!freshUser) {
    return next(
      new AppError(
        401,
        "The user belonging to this token does not longer exist! Please login to get access"
      )
    );
  }

  // // 4) Check if user change pwd after token was issued
  // freshUser.changedPasswordAfter(decoded.iat);

  // 5) Grant access to protected route
  req.user = freshUser;
  next();
});

// CHeck if user is admin
export function isAdmin(req, res, next) {
  if (!req.user || req.user.role !== "admin") {
    return res.status(403).json({ message: "Admin access required" });
  }
  next();
}
