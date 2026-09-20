/**
 * Cloudinary Cloud Storage Service for Alamoudi Real Estate Platform
 * Uploads property images directly to Cloudinary organized by Region and Property Code.
 */

export const CLOUDINARY_CONFIG = {
  cloudName: import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || "vis04evc",
  uploadPreset: import.meta.env.VITE_CLOUDINARY_PRESET || "h2ft0erz",
};

/**
 * Builds a structured folder path for Cloudinary:
 * e.g., "alamoudi_properties/shorouk/S93"
 */
export function getPropertyCloudinaryFolder(regionId = "general", propertyCode = "unassigned"): string {
  const cleanRegion = (regionId || "general").toLowerCase().replace(/[^a-z0-9_-]/g, "_");
  const cleanCode = (propertyCode || "unassigned").toUpperCase().replace(/[^A-Z0-9_-]/g, "_");
  return `alamoudi_properties/${cleanRegion}/${cleanCode}`;
}

/**
 * Builds a structured folder path for Region Hero images:
 * e.g., "alamoudi_regions/madinaty"
 */
export function getRegionCloudinaryFolder(regionId = "general"): string {
  const cleanRegion = (regionId || "general").toLowerCase().replace(/[^a-z0-9_-]/g, "_");
  return `alamoudi_regions/${cleanRegion}`;
}

/**
 * Folder for site-wide branding and home background images
 */
export function getBrandingCloudinaryFolder(subCategory = "home_hero"): string {
  return `alamoudi_branding/${subCategory}`;
}

/**
 * Folder for finishing gallery work showcase images
 */
export function getFinishingCloudinaryFolder(): string {
  return "alamoudi_finishing";
}

/**
 * Extracts Cloudinary public ID from a URL
 */
export function extractCloudinaryPublicId(url: string): string | null {
  if (!url || typeof url !== "string" || !url.includes("cloudinary.com")) return null;
  try {
    const parts = url.split("/upload/");
    if (parts.length < 2) return null;
    let path = parts[1];
    // Remove transformation params like v12345/ or w_500/
    path = path.replace(/^(?:[a-z]_[^/]+\/)*v\d+\//, "");
    // Remove extension
    const dotIdx = path.lastIndexOf(".");
    return dotIdx > 0 ? path.substring(0, dotIdx) : path;
  } catch {
    return null;
  }
}

/**
 * Uploads a single file or base64 data string to Cloudinary in a specific folder
 * Returns the secure HTTPS URL.
 */
export async function uploadToCloudinary(
  fileOrBase64: File | Blob | string,
  folder = "alamoudi_properties"
): Promise<string> {
  const { cloudName, uploadPreset } = CLOUDINARY_CONFIG;
  if (!cloudName || !uploadPreset) {
    throw new Error("Cloudinary configuration missing");
  }

  const endpoint = `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`;
  const formData = new FormData();
  formData.append("file", fileOrBase64);
  formData.append("upload_preset", uploadPreset);
  if (folder) {
    formData.append("folder", folder);
  }

  const res = await fetch(endpoint, {
    method: "POST",
    body: formData,
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    const message = errorData?.error?.message || `HTTP ${res.status}: Upload failed`;
    throw new Error(message);
  }

  const data = await res.json();
  return data.secure_url || data.url;
}

/**
 * Batch upload multiple files to Cloudinary with specific folder and progress callback
 */
export async function uploadMultipleToCloudinary(
  files: (File | Blob | string)[],
  folder = "alamoudi_properties",
  onProgress?: (current: number, total: number) => void
): Promise<string[]> {
  const total = files.length;
  const urls: string[] = [];

  for (let i = 0; i < total; i++) {
    const item = files[i];
    try {
      const url = await uploadToCloudinary(item, folder);
      urls.push(url);
    } catch (err) {
      console.warn(`[Cloudinary] Upload failed for item ${i + 1}, falling back:`, err);
      // If it's already a string (data URL or http), preserve it
      if (typeof item === "string") {
        urls.push(item);
      }
    }
    if (onProgress) {
      onProgress(i + 1, total);
    }
  }

  return urls;
}
