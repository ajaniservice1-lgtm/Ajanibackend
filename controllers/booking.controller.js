import Booking from "../models/booking.model.js";
import catchAsync from "../utils/catchAsync.js";

const createBooking = catchAsync(async (req, res) => {
  const { listing, user, serviceType, preferredDate, preferredTime } = req.body;
  const booking = await Booking.create({
    listing,
    user,
    serviceType,
    preferredDate,
    preferredTime,
  });
  res.status(201).json({ message: "Booking created successfully", data: booking });
});

export { createBooking };
