import mongoose from "mongoose";
import validator from "validator";

const HotelDetailsSchema = new mongoose.Schema(
  {
    roomTypes: [
      {
        name: { type: String, required: true },
        pricePerNight: { type: Number, required: true },
        capacity: { type: Number, required: true },
        amenities: [String],
      },
    ],
    checkInTime: String,
    checkOutTime: String,
  },
  { _id: false }
);

const ShortletDetailsSchema = new mongoose.Schema(
  {
    pricePerNight: { type: Number, required: true },
    maxGuests: Number,
    amenities: [String],
  },
  { _id: false }
);

const RestaurantDetailsSchema = new mongoose.Schema(
  {
    cuisines: [String],
    openingHours: String,
    acceptsReservations: { type: Boolean, default: false },
    maxGuestsPerReservation: Number,
  },
  { _id: false }
);

const ServiceDetailsSchema = new mongoose.Schema(
  {
    priceType: {
      type: String,
      enum: ["fixed", "hourly", "negotiable"],
      required: true,
    },
    price: Number,
    availability: [String],
  },
  { _id: false }
);

const EventDetailsSchema = new mongoose.Schema(
  {
    eventDate: { type: Date, required: true },
    venue: String,
    ticketPrice: Number,
    capacity: Number,
  },
  { _id: false }
);

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
      enum: ["hotel", "restaurant", "shortlet", "services", "event"],
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
      area: {
        type: String,
        required: [true, "Area is required"],
        trim: true,
      },
      geolocation: {
        lat: { type: Number, default: null },
        lng: { type: Number, default: null },
      },
    },

    contactInformation: {
      phone: {
        type: String,
        validate: [validator.isMobilePhone, "Please provide a valid phone number"],
        trim: true,
      },
      whatsapp: {
        type: String,
        validate: [validator.isMobilePhone, "Please provide a valid phone number"],
        trim: true,
      },
    },

    images: {
      type: [String],
      required: [true, "Images are required"],
      validate: {
        validator: function (arr) {
          return arr.every(url => validator.isURL(url));
        },
        message: "Please provide valid image URLs",
      },
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
      type: mongoose.Schema.Types.Mixed,
      required: true,
    },
  },
  { timestamps: true }
);

// listingSchema.pre("validate", function (next) {
//   const categorySchemas = {
//     hotel: HotelDetailsSchema,
//     shortlet: ShortletDetailsSchema,
//     restaurant: RestaurantDetailsSchema,
//     service: ServiceDetailsSchema,
//     event: EventDetailsSchema,
//   };

//   const schema = categorySchemas[this.category];

//   if (!schema) {
//     return next(new Error("Invalid listing category"));
//   }

//   const isValid = mongoose.Document.prototype.validateSync.call(
//     new mongoose.Document(this.details, schema)
//   );

//   if (isValid) {
//     return next(new Error(`Invalid details for category: ${this.category}`));
//   }

//   next();
// });

listingSchema.pre("validate", function () {
  const categorySchemas = {
    hotel: HotelDetailsSchema,
    shortlet: ShortletDetailsSchema,
    restaurant: RestaurantDetailsSchema,
    services: ServiceDetailsSchema,
    event: EventDetailsSchema,
  };

  const schema = categorySchemas[this.category];

  if (!schema) {
    this.invalidate("category", "Invalid listing category");
    return;
  }

  if (!this.details) {
    this.invalidate("details", "Details are required for this category");
    return;
  }

  // Validate details against the correct schema
  // const DetailsModel = mongoose.model("__DetailsValidation", schema);

  // const validationDoc = new DetailsModel(this.details);
  // const validationError = validationDoc.validateSync();

  // if (validationError) {
  //   this.invalidate("details", `Invalid details for category: ${this.category}`);
  // }

  // Create a temporary document WITHOUT registering a model
  const tempDoc = new mongoose.Document(this.details, schema);
  const validationError = tempDoc.validateSync();

  if (validationError) {
    Object.values(validationError.errors).forEach(err => {
      this.invalidate(`details.${err.path}`, err.message);
    });
  }
});

const Listing = mongoose.model("Listing", listingSchema);

export default Listing;
