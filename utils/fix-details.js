import fs from "fs";

// Read the listings file
const listings = JSON.parse(fs.readFileSync("listings.json", "utf8"));

let fixedCount = 0;
const issues = [];

listings.forEach((listing, index) => {
  let fixed = false;

  // Fix shortlet details - requires pricePerNight
  if (listing.category === "shortlet") {
    if (!listing.details.pricePerNight) {
      // Use the main price if available, otherwise default
      listing.details.pricePerNight = listing.price || 1000;
      fixed = true;
      issues.push(
        `Listing ${index + 1} (${listing.title}): Added missing pricePerNight to shortlet details`
      );
    }
  }

  // Fix hotel details - requires roomTypes with pricePerNight
  if (listing.category === "hotel") {
    if (!listing.details.roomTypes || listing.details.roomTypes.length === 0) {
      listing.details.roomTypes = [
        {
          name: "Standard Room",
          pricePerNight: listing.price || 1000,
          capacity: 2,
          amenities: [],
        },
      ];
      fixed = true;
      issues.push(
        `Listing ${index + 1} (${listing.title}): Added missing roomTypes to hotel details`
      );
    } else {
      // Ensure each room type has required fields
      listing.details.roomTypes.forEach((room, roomIndex) => {
        if (!room.pricePerNight) {
          room.pricePerNight = listing.price || 1000;
          fixed = true;
          issues.push(
            `Listing ${index + 1} (${listing.title}): Added missing pricePerNight to room ${roomIndex + 1}`
          );
        }
        if (!room.capacity) {
          room.capacity = 2;
          fixed = true;
        }
        if (!room.amenities) {
          room.amenities = [];
          fixed = true;
        }
      });
    }
    // Ensure checkInTime and checkOutTime exist
    if (!listing.details.checkInTime) {
      listing.details.checkInTime = "14:00";
      fixed = true;
    }
    if (!listing.details.checkOutTime) {
      listing.details.checkOutTime = "12:00";
      fixed = true;
    }
  }

  // Fix restaurant details - requires cuisines and openingHours
  if (listing.category === "restaurant") {
    if (!listing.details.cuisines) {
      listing.details.cuisines = [];
      fixed = true;
    }
    if (!listing.details.openingHours) {
      listing.details.openingHours = "09:00-21:00";
      fixed = true;
      issues.push(
        `Listing ${index + 1} (${listing.title}): Added missing openingHours to restaurant details`
      );
    }
    if (listing.details.acceptsReservations === undefined) {
      listing.details.acceptsReservations = false;
      fixed = true;
    }
    if (!listing.details.maxGuestsPerReservation) {
      listing.details.maxGuestsPerReservation = 10;
      fixed = true;
    }
  }

  // Fix services details - requires priceType and availability
  if (listing.category === "services") {
    if (!listing.details.priceType) {
      listing.details.priceType = "fixed";
      fixed = true;
      issues.push(
        `Listing ${index + 1} (${listing.title}): Added missing priceType to services details`
      );
    }
    if (!listing.details.availability) {
      listing.details.availability = ["Mon-Fri"];
      fixed = true;
    }
  }

  // Fix event details - requires eventDate, venue, ticketPrice, capacity
  if (listing.category === "event") {
    if (!listing.details.eventDate) {
      // Set a default future date
      const futureDate = new Date();
      futureDate.setMonth(futureDate.getMonth() + 6);
      listing.details.eventDate = futureDate.toISOString();
      fixed = true;
      issues.push(
        `Listing ${index + 1} (${listing.title}): Added missing eventDate to event details`
      );
    }
    if (!listing.details.venue) {
      listing.details.venue = listing.location.address || "Venue TBA";
      fixed = true;
    }
    if (!listing.details.ticketPrice) {
      listing.details.ticketPrice = listing.price || 1000;
      fixed = true;
    }
    if (!listing.details.capacity) {
      listing.details.capacity = 50;
      fixed = true;
    }
  }

  if (fixed) {
    fixedCount++;
  }
});

// Save the fixed listings
fs.writeFileSync("listings.json", JSON.stringify(listings, null, 2));

console.log(`✅ Fixed ${fixedCount} listings with missing detail fields`);
console.log(`\n📋 Issues fixed:`);
issues.slice(0, 30).forEach(issue => console.log(`  - ${issue}`));
if (issues.length > 30) {
  console.log(`  ... and ${issues.length - 30} more issues`);
}
