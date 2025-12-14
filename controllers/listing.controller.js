import Listing from "../models/listing.model.js";
import catchAsync from "../utils/catchAsync.js";

const createListing = catchAsync(async (req, res) => {
  const { name, category, description, price, images, location, contact } = req.body;
  const listing = await Listing.create({
    name,
    category,
    description,
    price,
    images,
    location,
    contact,
  });
  res.status(201).json({ message: "Listing created successfully", data: listing });
});

const getListings = catchAsync(async (req, res) => {
  const listings = await Listing.find({ isActive: true });
  res.status(200).json({ message: "Listings retrieved successfully", data: listings });
});

const getListingById = catchAsync(async (req, res) => {
  const listing = await Listing.findById(req.params.id);
  res.status(200).json({ message: "Listing retrieved successfully", data: listing });
});

export { createListing, getListings, getListingById };
