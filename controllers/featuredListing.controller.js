import Listing from "../models/listing.model.js";
import catchAsync from "../utils/catchAsync.js";

const getFeaturedByCategory = async (res, category) => {
  const query = {
    category,
    status: "approved",
    "images.0": { $exists: true },
    $or: [
      { "contactInformation.phone": { $exists: true, $ne: null, $ne: "" } },
      { "contactInformation.whatsapp": { $exists: true, $ne: null, $ne: "" } },
    ],
    "location.address": { $exists: true, $ne: null, $ne: "" },
    "location.area": { $exists: true, $ne: null, $ne: "" },
  };

  const count = await Listing.countDocuments(query);

  if (count === 0) {
    return res.status(200).json({
      status: "success",
      message: "Featured listings retrieved successfully",
      results: 0,
      data: [],
    });
  }

  const limit = 6;
  // Calculate a seed based on the current day to ensure daily rotation
  const dayOfYear = Math.floor(Date.now() / (1000 * 60 * 60 * 24));
  const skip = (dayOfYear * limit) % count;

  let listings = await Listing.find(query).skip(skip).limit(limit);

  // If we reached the end of the collection, wrap around to the beginning
  if (listings.length < limit && count > listings.length) {
    const remaining = limit - listings.length;
    const startListings = await Listing.find(query).limit(remaining);
    listings = [...listings, ...startListings];
  }

  res.status(200).json({
    status: "success",
    message: "Featured listings retrieved successfully",
    results: listings.length,
    data: listings,
  });
};

export const getFeaturedHotels = catchAsync(async (req, res) => {
  await getFeaturedByCategory(res, "hotel");
});

export const getFeaturedShortlets = catchAsync(async (req, res) => {
  await getFeaturedByCategory(res, "shortlet");
});

export const getFeaturedRestaurants = catchAsync(async (req, res) => {
  await getFeaturedByCategory(res, "restaurant");
});

export const getFeaturedServices = catchAsync(async (req, res) => {
  await getFeaturedByCategory(res, "services");
});

export const getFeaturedEvents = catchAsync(async (req, res) => {
  await getFeaturedByCategory(res, "event");
});
