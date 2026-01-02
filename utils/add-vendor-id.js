import fs from "fs";

// Read the listings file
const listings = JSON.parse(fs.readFileSync("listings.json", "utf8"));

// The vendor ID you want to add
const vendorId = "69558890c263664d295678ab";

// Add vendorId to each listing
listings.forEach(listing => {
  listing.vendorId = vendorId;
});

// Save the updated listings back to the file
fs.writeFileSync("listings.json", JSON.stringify(listings, null, 2));

console.log(`✅ Added vendorId to ${listings.length} listings!`);
