import mongoose from "mongoose";
import Listing from "../models/listing.model.js";
import catchAsync from "../utils/catchAsync.js";
import AppError from "../utils/errorHandler.js";

// CREATE LISTING
const createListing = catchAsync(async (req, res, next) => {
  const { title, category, description, price, images, location, contactInformation, details } =
    req.body;

  // CHECK IF USER IS A VENDOR
  if (req.user.role !== "vendor" && req.user.role !== "admin") {
    return next(new AppError(403, "You are not a registered to create listings"));
  }

  // CHECK IF VENDOR IS APPROVED
  // if (req.user.vendor.approvalStatus !== "approved") {
  //   return next(new AppError(403, "Your vendor account is not approved"));
  // }

  // CHECK IF VENDOR CATEGORY IS NOT SERVICES

  const listing = await Listing.create({
    vendorId: req.user.id, // from auth middleware
    title,
    category,
    description,
    price,
    images,
    location,
    contactInformation,
    details, // category-specific data
  });

  res.status(201).json({
    status: "success",
    message: "Listing created successfully",
    data: listing,
  });
});

// GET ALL LISTINGS
const getListings = catchAsync(async (req, res) => {
  const queryObj = req.query;
  const queryString = JSON.stringify(queryObj);
  const query = JSON.parse(queryString);

  const listings = await Listing.find(query).sort("-createdAt").populate("vendorId");

  const totalListings = await Listing.countDocuments();

  res.status(200).json({
    message: "Listings retrieved successfully",
    results: totalListings,
    data: listings,
  });
});

// GET LISTING BY ID
const getListingById = catchAsync(async (req, res, next) => {
  const listing = await Listing.findById(req.params.id).populate("vendorId");

  if (!listing) {
    return next(new AppError(404, "Listing not found"));
  }

  res.status(200).json({
    message: "Listing retrieved successfully",
    data: listing,
  });
});

// GET LISTINGS BY VENDOR ID
const getListingsByVendorId = catchAsync(async (req, res) => {
  const listings = await Listing.find({ vendorId: req.params.id }).populate("vendorId");
  const totalListings = await Listing.countDocuments({ vendorId: req.params.id });

  res.status(200).json({
    message: "Listings retrieved successfully",
    results: totalListings,
    data: listings,
  });
});

export { createListing, getListings, getListingById, getListingsByVendorId };
