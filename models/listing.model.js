import mongoose from "mongoose";
import validator from "validator";

const HotelListingSchema = new mongoose.Schema({
  vendorId: { type: mongoose.Schema.Types.ObjectId, ref: "Vendor", required: true },
  name: String, // Deluxe, Standard
  description: String,
  roomTypes: [
    {
      name: String,
      pricePerNight: Number,
      capacity: Number,
      amenities: [String],
    },
  ],
  checkInTime: String,
  checkOutTime: String,
});
const ShortletListingSchema = new mongoose.Schema({
  vendorId: { type: mongoose.Schema.Types.ObjectId, ref: "Vendor", required: true },
  title: String,
  description: String,
  pricePerNight: Number,
  maxGuests: Number,
  amenities: [String],
  location: String,
});
const RestaurantListingSchema = new mongoose.Schema({
  vendorId: { type: mongoose.Schema.Types.ObjectId, ref: "Vendor", required: true },
  name: String,
  description: String,
  cuisines: [String],
  openingHours: String,
  acceptsReservations: { type: Boolean, default: false },
  maxGuestsPerReservation: Number,
});
const ServiceListingSchema = new mongoose.Schema({
  vendorId: { type: mongoose.Schema.Types.ObjectId, ref: "Vendor", required: true },
  serviceName: String,
  description: String,
  priceType: { type: String, enum: ["fixed", "hourly", "negotiable"] },
  price: Number,
  availability: [String],
});
const EventListingSchema = new mongoose.Schema({
  vendorId: { type: mongoose.Schema.Types.ObjectId, ref: "Vendor", required: true },
  eventName: String,
  description: String,
  eventDate: Date,
  venue: String,
  ticketPrice: Number,
  capacity: Number,
});

// Helper function to validate details based on category
function validateDetails() {
  return function (details) {
    if (!details || typeof details !== "object") {
      return false;
    }

    const category = this.category;

    if (category === "hotel") {
      // Hotel details: roomTypes, checkInTime, checkOutTime
      return (
        Array.isArray(details.roomTypes) &&
        typeof details.checkInTime === "string" &&
        typeof details.checkOutTime === "string"
      );
    }

    if (category === "shortlet") {
      // Shortlet details: maxGuests, amenities
      return typeof details.maxGuests === "number" && Array.isArray(details.amenities);
    }

    if (category === "restaurant") {
      // Restaurant details: cuisines, openingHours, acceptsReservations
      return Array.isArray(details.cuisines) && typeof details.openingHours === "string";
    }

    if (category === "service provider") {
      // Service details: priceType, availability
      return (
        ["fixed", "hourly", "negotiable"].includes(details.priceType) &&
        Array.isArray(details.availability)
      );
    }

    if (category === "event") {
      // Event details: eventDate, venue, ticketPrice, capacity
      return (
        details.eventDate instanceof Date &&
        typeof details.venue === "string" &&
        typeof details.ticketPrice === "number" &&
        typeof details.capacity === "number"
      );
    }

    return false;
  };
}

const listingSchema = new mongoose.Schema(
  {
    vendorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Vendor is required"],
    },

    category: {
      type: String,
      enum: ["hotel", "restaurant", "shortlet", "service provider", "event"],
      required: [true, "Category is required"],
      lowercase: true,
    },

    title: {
      type: String,
      required: [true, "Listing title is required"],
      trim: true,
    },

    description: {
      type: String,
      trim: true,
      required: [true, "Listing description is required"],
      maxlength: [500, "Listing description must be less than 500 characters"],
      minlength: [10, "Listing description must be at least 10 characters"],
    },

    location: {
      address: {
        type: String,
        required: [true, "Address is required"],
        trim: true,
      },
      city: {
        type: String,
        required: [true, "City is required"],
        trim: true,
      },
      state: String,
      country: {
        type: String,
        required: [true, "Country is required"],
        lowercase: true,
        trim: true,
      },
    },

    images: {
      type: [String],
      required: [true, "Images are required"],
      validate: [validator.isURL, "Please provide a valid image URL"],
      lowercase: true,
      trim: true,
      minlength: [1, "At least one image is required"],
      maxlength: [4, "Maximum 4 images are allowed"],
    },

    price: {
      type: Number,
      required: [true, "Price is required"],
      min: [1000, "Price must be greater than 0"],
    },

    status: {
      type: String,
      enum: ["active", "inactive", "pending", "rejected", "approved"],
      default: "pending",
    },

    approvedAt: {
      type: Date,
      default: null,
    },

    details: {
      type: mongoose.Schema.Types.Mixed, // category-specific
      required: [true, "Details are required"],
      validate: {
        validator: validateDetails(),
        message: "Details do not match the category requirements",
      },
    },
  },
  { timestamps: true }
);

const Listing = mongoose.model("Listing", listingSchema);

export default Listing;
