/**
 * Utility functions to handle listing images in both formats:
 * - Old format: URL strings (e.g., "https://...")
 * - New format: Objects with url and public_id (e.g., { url: "...", public_id: "..." })
 */

/**
 * Extract public_id from an image (handles both formats)
 * @param {string|object} image - Image as URL string or object with url and public_id
 * @returns {string|null} - The public_id if available, null otherwise
 */
export function getPublicId(image) {
  // If image is a string (old format), try to extract public_id from URL
  if (typeof image === "string") {
    return extractPublicIdFromUrl(image);
  }

  // If image is an object (new format), return the public_id
  if (image && typeof image === "object" && image.public_id) {
    return image.public_id;
  }

  return null;
}

/**
 * Extract public_id from a Cloudinary URL
 * @param {string} url - Cloudinary image URL
 * @returns {string|null} - The public_id if found, null otherwise
 */
function extractPublicIdFromUrl(url) {
  if (!url || typeof url !== "string") {
    return null;
  }

  try {
    // Cloudinary URL format: https://res.cloudinary.com/{cloud_name}/image/upload/{version}/{folder}/{public_id}.{ext}
    // Examples:
    // - https://res.cloudinary.com/debpabo0a/image/upload/v1765569870/oi1d5qbopcgob0mpvtex.jpg
    // - https://res.cloudinary.com/dzoz6ne8t/image/upload/v1767340791/uploads/e61c453d-0e84-4a3f-b656-b6669952ca38.png
    const urlParts = url.split("/");
    const uploadIndex = urlParts.findIndex(part => part === "upload");

    if (uploadIndex === -1) {
      return null;
    }

    // Get the part after "upload" (skip version if present)
    // Version format: v{timestamp}
    let publicIdIndex = uploadIndex + 1;
    if (urlParts[publicIdIndex] && urlParts[publicIdIndex].startsWith("v")) {
      publicIdIndex++;
    }

    // Get all parts after version (could be folder/filename or just filename)
    // Remove the last part (filename with extension) and get the base name
    const filename = urlParts[urlParts.length - 1];
    if (!filename) {
      return null;
    }

    // Remove file extension to get public_id
    const publicId = filename.replace(/\.[^/.]+$/, "");

    // If there's a folder before the filename (like "uploads"), include it
    // But only if it's not already in the public_id
    if (publicIdIndex < urlParts.length - 1) {
      const folder = urlParts[urlParts.length - 2];
      // Only include folder if it's not the version and not already part of public_id
      if (folder && !folder.startsWith("v") && folder !== publicId) {
        return `${folder}/${publicId}`;
      }
    }

    return publicId;
  } catch (error) {
    console.error("Error extracting public_id from URL:", error);
    return null;
  }
}

/**
 * Normalize an image to the new format (object with url and public_id)
 * @param {string|object} image - Image as URL string or object
 * @returns {object|null} - Normalized image object or null if invalid
 */
export function normalizeImage(image) {
  // If already in new format, return as is
  if (image && typeof image === "object" && image.url && image.public_id) {
    return image;
  }

  // If it's a string (old format), convert to new format
  if (typeof image === "string") {
    const publicId = extractPublicIdFromUrl(image);
    if (publicId) {
      return {
        url: image,
        public_id: publicId,
      };
    }
  }

  return null;
}

/**
 * Normalize an array of images to the new format
 * @param {Array} images - Array of images (strings or objects)
 * @returns {Array} - Array of normalized image objects
 */
export function normalizeImages(images) {
  if (!Array.isArray(images)) {
    return [];
  }

  return images.map(normalizeImage).filter(img => img !== null);
}

/**
 * Get Cloudinary path for deletion (handles both formats)
 * @param {string|object} image - Image as URL string or object
 * @returns {string|null} - Cloudinary path for deletion or null
 */
export function getCloudinaryPath(image) {
  const publicId = getPublicId(image);
  if (!publicId) {
    return null;
  }

  // If public_id already includes "uploads/", use it as is
  // Otherwise, try with "uploads/" prefix (for newer uploads)
  // For old format images, the public_id might not have a folder
  return publicId.startsWith("uploads/") ? publicId : `uploads/${publicId}`;
}

/**
 * Try multiple Cloudinary paths for deletion (handles old format without folder)
 * @param {string|object} image - Image as URL string or object
 * @returns {Array<string>} - Array of possible Cloudinary paths to try
 */
export function getCloudinaryPaths(image) {
  const publicId = getPublicId(image);
  if (!publicId) {
    return [];
  }

  const paths = [];

  // If public_id already includes folder, use it
  if (publicId.includes("/")) {
    paths.push(publicId);
  } else {
    // Try with uploads/ folder (newer format)
    paths.push(`uploads/${publicId}`);
    // Also try without folder (older format)
    paths.push(publicId);
  }

  return paths;
}

/**
 * Delete an image from Cloudinary (handles both formats)
 * @param {string|object} image - Image as URL string or object
 * @param {object} cloudinary - Cloudinary instance
 * @returns {Promise<object>} - Cloudinary deletion result
 */
export async function deleteImageFromCloudinary(image, cloudinary) {
  const paths = getCloudinaryPaths(image);
  if (paths.length === 0) {
    console.warn("Cannot delete image: public_id not found", image);
    return { result: "not_found" };
  }

  // Try each path until one succeeds
  for (const path of paths) {
    try {
      const result = await cloudinary.uploader.destroy(path);
      // If deletion was successful (result.result === "ok" or "not found" is acceptable)
      if (result.result === "ok" || result.result === "not found") {
        return result;
      }
    } catch (error) {
      // If this path failed, try the next one
      continue;
    }
  }

  // If all paths failed, return not_found
  console.warn("Failed to delete image from Cloudinary with all attempted paths:", paths);
  return { result: "not_found" };
}
