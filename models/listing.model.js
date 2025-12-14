import mongoose from "mongoose";
import validator from "validator";

const listingSchema = new mongoose.Schema(
  {
    // --- Core Information ---
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
      maxlength: [100, "Name must be less than 100 characters"],
    },
    category: {
      type: String,
      required: [true, "Category is required"],
      trim: true,
    },
    description: {
      type: String,
      required: [true, "Description is required"],
      trim: true,
      maxlength: [1000, "Description must be less than 1000 characters"],
    },
    price: {
      type: Number,
      required: [true, "Price is required"],
      min: [1, "Price must be greater than 0"],
    },
    images: {
      type: [String],
      required: [true, "Images are required"],
      validate: [validator.isURL, "Please provide a valid image URL"],
      trim: true,
    },

    // --- Location and Geo-Data ---
    location: {
      type: {
        address: {
          type: String,
          required: [true, "Address is required"],
          trim: true,
          maxlength: [1000, "Address must be less than 1000 characters"],
        },
        area: {
          type: String,
          required: [true, "Area is required"],
          trim: true,
          maxlength: [100, "Area must be less than 100 characters"],
        },
        // Geospatial data (often used for proximity searches)
        coordinates: {
          latitude: {
            type: Number,
            required: [true, "Latitude is required"],
          },
          longitude: {
            type: Number,
            required: [true, "Longitude is required"],
          },
        },
      },
      required: [true, "Location data is required"],
    },

    // --- Contact Information ---
    contact: {
      type: {
        phone: {
          type: String,
          required: [true, "Phone number is required"],
          validate: [validator.isMobilePhone, "Please provide a valid phone number"],
          lowercase: true,
          trim: true,
          default: null,
        },
        whatsappNumber: {
          type: String,
          required: [true, "Whatsapp number is required"],
          validate: [validator.isMobilePhone, "Please provide a valid whatsapp number"],
          lowercase: true,
          trim: true,
          default: null,
        },
      },
      required: [true, "Contact information is required"],
    },

    // --- Operation Hours ---
    hours: {
      type: {
        opening: {
          type: String,
          required: [true, "Opening hours are required"],
        },
        closing: {
          type: String,
          required: [true, "Closing hours are required"],
        },
      },
      required: [true, "Operational hours are required"],
    },

    // --- Vendor and Status (Metadata) ---
    vendor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Vendor is required"], // Vendor is the user who is listing the service
      default: null,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

const Listing = mongoose.model("Listing", listingSchema);

export default Listing;
