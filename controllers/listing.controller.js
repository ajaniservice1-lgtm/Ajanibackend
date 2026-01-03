import mongoose from "mongoose";
import Listing from "../models/listing.model.js";
import catchAsync from "../utils/catchAsync.js";
import AppError from "../utils/errorHandler.js";
import cloudinary from "../config/cloudinary.js";
import { deleteImageFromCloudinary, normalizeImages } from "../utils/imageHelpers.js";
import APIFeatures from "../utils/apiFeatures.js";

// CREATE LISTING
const createListing = catchAsync(async (req, res, next) => {
  const { title, category, description, price, images, location, contactInformation, details } =
    req.body;

  // CHECK IF USER IS A VENDOR
  if (req.user.role !== "vendor" && req.user.role !== "admin") {
    return next(new AppError(403, "You are not a registered to create listings"));
  }

  // CHECK IF VENDOR IS APPROVED
  if (req.user.vendor.approvalStatus !== "approved") {
    return next(new AppError(403, "Your vendor account is not approved"));
  }

  // CHECK IF USER CATEGORY IS NOT SERVICES
  if (category !== "services" && req.user.role !== "admin") {
    return next(
      new AppError(
        403,
        `You cannot create listing for ${category?.toUpperCase()} for now, reach out to admin`
      )
    );
  }

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

  const features = new APIFeatures(Listing.find(query), req.query)
    .filter()
    .sort()
    .limitFields()
    .paginate();

  const listings = await features.query.populate("vendorId");

  res.status(200).json({
    status: "success",
    message: "Listings retrieved successfully",
    results: listings.length,
    data: {
      listings,
    },
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
  const listings = await Listing.find({ vendorId: req.params.vendorId });
  // .populate("vendorId");
  const totalListings = await Listing.countDocuments({ vendorId: req.params.vendorId });

  console.log(req.params.vendorId);

  res.status(200).json({
    message: "Listings retrieved successfully",
    results: totalListings,
    data: listings,
  });
});

// UPDATE LISTING
const updateListing = catchAsync(async (req, res, next) => {
  // Find the listing first
  const listing = await Listing.findById(req.params.id);

  // CHECK IF LISTING EXISTS
  if (!listing) {
    return next(new AppError(404, "Listing not found"));
  }

  // CHECK IF CATEGORY IS BEING UPDATED
  const updateData = { ...req.body };
  delete updateData.category;

  // CHECK IF IMAGES ARE BEING UPDATED
  if (updateData.images && Array.isArray(updateData.images)) {
    const oldImages = listing.images || [];
    const newImages = normalizeImages(updateData.images);

    // CHECK IF IMAGES WERE REMOVED
    const oldImageIds = new Set(
      oldImages.map(img => {
        if (typeof img === "string") {
          return img;
        }
        return img.url || img.public_id;
      })
    );

    const newImageIds = new Set(newImages.map(img => img.url || img.public_id));

    // CHECK IF IMAGES WERE REMOVED
    for (const oldImage of oldImages) {
      const oldId = typeof oldImage === "string" ? oldImage : oldImage.url || oldImage.public_id;
      if (!newImageIds.has(oldId)) {
        try {
          await deleteImageFromCloudinary(oldImage, cloudinary);
        } catch (error) {
          // CHECK IF IMAGE DELETION FAILED
          console.error("Failed to delete removed image from Cloudinary:", error);
        }
      }
    }

    // NORMALIZE NEW IMAGES TO ENSURE CONSISTENT FORMAT
    updateData.images = newImages;
  }

  // UPDATE THE LISTING
  const updatedListing = await Listing.findByIdAndUpdate(req.params.id, updateData, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    status: "success",
    message: "Listing updated successfully",
    data: updatedListing,
  });
});

// DELETE LISTING
const deleteListing = catchAsync(async (req, res, next) => {
  const listing = await Listing.findByIdAndDelete(req.params.id);
  if (!listing) {
    return next(new AppError(404, "Listing not found"));
  }

  // Delete all images from Cloudinary (handles both old and new formats)
  if (listing.images && Array.isArray(listing.images)) {
    for (const image of listing.images) {
      try {
        await deleteImageFromCloudinary(image, cloudinary);
      } catch (error) {
        // CHECK IF IMAGE DELETION FAILED
        console.error("Failed to delete image from Cloudinary:", error);
      }
    }
  }

  res.status(200).json({ status: "success", message: "Listing deleted successfully" });
});

export {
  createListing,
  getListings,
  getListingById,
  getListingsByVendorId,
  updateListing,
  deleteListing,
};
