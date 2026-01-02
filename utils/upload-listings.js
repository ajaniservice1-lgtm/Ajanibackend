import mongoose from "mongoose";
import dotenv from "dotenv";
import fs from "fs";
import Listing from "../models/listing.model.js";

// Load environment variables
dotenv.config({ path: ".env.local" });

// Connect to MongoDB
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => {
    console.log("✅ Connected to MongoDB");
    uploadListings();
  })
  .catch(err => {
    console.error("❌ MongoDB connection error:", err);
    process.exit(1);
  });

async function uploadListings() {
  try {
    // Read the listings from JSON file
    const listingsData = JSON.parse(fs.readFileSync("listings.json", "utf8"));
    console.log(`📄 Found ${listingsData.length} listings in JSON file\n`);

    let successCount = 0;
    let failCount = 0;
    const errors = [];

    // Try to insert each listing one by one to see detailed errors
    for (let i = 0; i < listingsData.length; i++) {
      const listing = listingsData[i];
      try {
        // Validate the listing first
        const newListing = new Listing(listing);
        await newListing.validate();

        // Check if listing already exists (by title and vendorId)
        const exists = await Listing.findOne({
          title: listing.title,
          vendorId: listing.vendorId,
        });

        if (exists) {
          errors.push({
            index: i + 1,
            title: listing.title,
            error: "Already exists in database",
          });
          failCount++;
          continue;
        }

        // Insert the listing
        await newListing.save();
        successCount++;
        if ((i + 1) % 10 === 0) {
          console.log(`⏳ Processed ${i + 1}/${listingsData.length} listings...`);
        }
      } catch (err) {
        failCount++;
        const errorMsg = err.errors
          ? Object.values(err.errors)
              .map(e => `${e.path}: ${e.message}`)
              .join(", ")
          : err.message;

        errors.push({
          index: i + 1,
          title: listing.title || "Unknown",
          error: errorMsg,
        });
      }
    }

    console.log(`\n✅ Successfully uploaded: ${successCount} listings`);
    console.log(`❌ Failed to upload: ${failCount} listings\n`);

    // Show first 10 errors
    if (errors.length > 0) {
      console.log("⚠️  First 10 errors:");
      errors.slice(0, 10).forEach(err => {
        console.log(`  ${err.index}. "${err.title}" - ${err.error}`);
      });
      if (errors.length > 10) {
        console.log(`  ... and ${errors.length - 10} more errors`);
      }
    }

    // Close the connection
    await mongoose.connection.close();
    console.log("\n✅ Database connection closed");
    process.exit(0);
  } catch (error) {
    console.error("❌ Error uploading listings:", error.message);
    await mongoose.connection.close();
    process.exit(1);
  }
}
