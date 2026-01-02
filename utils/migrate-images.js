/**
 * Migration script to normalize old image format (URL strings) to new format (objects with url and public_id)
 *
 * Usage: node utils/migrate-images.js
 *
 * This script will:
 * 1. Find all listings with old image format (URL strings)
 * 2. Convert them to new format (objects with url and public_id)
 * 3. Save the updated listings
 */

import mongoose from "mongoose";
import dotenv from "dotenv";
import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";
import Listing from "../models/listing.model.js";
import { normalizeImages } from "./imageHelpers.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: ".env.local" });

async function migrateImages() {
  try {
    // Connect to MongoDB
    const mongoUri = process.env.MONGODB_URI;
    if (!mongoUri) {
      throw new Error("MONGO_URI not found in environment variables");
    }

    await mongoose.connect(mongoUri);
    console.log("Connected to MongoDB");

    // Find all listings
    const listings = await Listing.find({});
    console.log(`Found ${listings.length} listings`);

    let migratedCount = 0;
    let skippedCount = 0;

    for (const listing of listings) {
      if (!listing.images || !Array.isArray(listing.images)) {
        skippedCount++;
        continue;
      }

      // Check if any image is in old format (string)
      const hasOldFormat = listing.images.some(img => typeof img === "string");

      if (hasOldFormat) {
        // Normalize images
        const normalized = normalizeImages(listing.images);

        if (normalized.length > 0) {
          listing.images = normalized;
          await listing.save();
          migratedCount++;
          console.log(`✓ Migrated listing: ${listing._id} (${listing.title})`);
        } else {
          console.warn(`⚠ Could not normalize images for listing: ${listing._id}`);
          skippedCount++;
        }
      } else {
        skippedCount++;
      }
    }

    console.log("\n=== Migration Summary ===");
    console.log(`Total listings: ${listings.length}`);
    console.log(`Migrated: ${migratedCount}`);
    console.log(`Skipped: ${skippedCount}`);

    // Update listings.json file
    try {
      console.log("\nUpdating listings.json file...");
      const jsonPath = path.join(__dirname, "..", "listings.json");

      // Read existing JSON file
      let jsonListings = [];
      try {
        const jsonContent = await fs.readFile(jsonPath, "utf-8");
        jsonListings = JSON.parse(jsonContent);
        console.log(`Found ${jsonListings.length} listings in JSON file`);
      } catch (error) {
        console.warn("Could not read listings.json, will create new one:", error.message);
      }

      // Update images in JSON file to match migrated format
      let jsonUpdatedCount = 0;
      for (let i = 0; i < jsonListings.length; i++) {
        const jsonListing = jsonListings[i];
        if (jsonListing.images && Array.isArray(jsonListing.images)) {
          // Check if any image is in old format (string)
          const hasOldFormat = jsonListing.images.some(img => typeof img === "string");

          if (hasOldFormat) {
            // Normalize images
            const normalized = normalizeImages(jsonListing.images);
            if (normalized.length > 0) {
              jsonListings[i].images = normalized;
              jsonUpdatedCount++;
            }
          }
        }
      }

      // Write updated JSON back to file
      await fs.writeFile(jsonPath, JSON.stringify(jsonListings, null, 2), "utf-8");
      console.log(`✓ Updated ${jsonUpdatedCount} listings in listings.json`);
      console.log("Migration completed!");
    } catch (error) {
      console.error("Error updating listings.json:", error);
      console.log("Database migration completed, but JSON file update failed");
    }

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error("Migration error:", error);
    await mongoose.disconnect();
    process.exit(1);
  }
}

// Run migration if script is executed directly
migrateImages();

export default migrateImages;
