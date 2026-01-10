import mongoose from "mongoose";
import dotenv from "dotenv";
import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";
import Listing from "../models/listing.model.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: ".env.local" });

async function approveListings() {
  try {
    // Connect to MongoDB
    const mongoUri = process.env.MONGODB_URI;
    if (!mongoUri) {
      throw new Error("MONGODB_URI not found in environment variables");
    }

    await mongoose.connect(mongoUri);
    console.log("Connected to MongoDB");

    // Update in Database
    console.log("Approving all pending listings...");
    const result = await Listing.updateMany(
      { status: "pending" },
      {
        $set: {
          status: "approved",
          approvedAt: new Date(),
        },
      }
    );

    console.log(`Matched ${result.matchedCount} pending listings.`);
    console.log(`Approved ${result.modifiedCount} listings.`);

    // Update listings.json file if it exists
    try {
      console.log("\nChecking listings.json file...");
      const jsonPath = path.join(__dirname, "..", "listings.json");

      const jsonContent = await fs.readFile(jsonPath, "utf-8");
      let jsonListings = JSON.parse(jsonContent);

      let jsonUpdatedCount = 0;
      const now = new Date().toISOString();

      jsonListings = jsonListings.map(listing => {
        if (listing.status === "pending") {
          listing.status = "approved";
          listing.approvedAt = now;
          jsonUpdatedCount++;
        }
        return listing;
      });

      if (jsonUpdatedCount > 0) {
        await fs.writeFile(jsonPath, JSON.stringify(jsonListings, null, 2), "utf-8");
        console.log(`✓ Updated ${jsonUpdatedCount} listings in listings.json`);
      } else {
        console.log("No pending listings found in listings.json");
      }
    } catch (error) {
      console.warn("Could not update listings.json or file not found:", error.message);
    }

    await mongoose.disconnect();
    console.log("Done!");
    process.exit(0);
  } catch (error) {
    console.error("Error approving listings:", error);
    try {
      await mongoose.disconnect();
    } catch (e) {
      // ignore
    }
    process.exit(1);
  }
}

approveListings();
