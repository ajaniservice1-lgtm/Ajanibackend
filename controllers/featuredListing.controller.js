import Listing from "../models/listing.model.js";
import catchAsync from "../utils/catchAsync.js";

export const getFeaturedHotels = catchAsync(async (req, res) => {
  const hotels = await Listing.find({ category: "hotel" });
});

export const getFeaturedShortlets = catchAsync(async (req, res) => {
  const shortlets = await Listing.find({ category: "shortlet" });
});

export const getFeaturedRestaurants = catchAsync(async (req, res) => {
  const restaurants = await Listing.find({ category: "restaurant" });
});

export const getFeaturedServices = catchAsync(async (req, res) => {
  const services = await Listing.find({ category: "services" });
});

export const getFeaturedEvents = catchAsync(async (req, res) => {
  const events = await Listing.find({ category: "event" });
});

export {
  getFeaturedHotels,
  getFeaturedShortlets,
  getFeaturedRestaurants,
  getFeaturedServices,
  getFeaturedEvents,
};
