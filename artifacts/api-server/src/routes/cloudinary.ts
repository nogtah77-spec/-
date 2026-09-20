import crypto from "node:crypto";
import { Router, type IRouter, type Request, type Response } from "express";

const router: IRouter = Router();

const DEFAULT_CLOUD_NAME = "vis04evc";

function getCloudinaryCredentials() {
  let cloudName = process.env.CLOUDINARY_CLOUD_NAME || process.env.VITE_CLOUDINARY_CLOUD_NAME || DEFAULT_CLOUD_NAME;
  let apiKey = process.env.CLOUDINARY_API_KEY;
  let apiSecret = process.env.CLOUDINARY_API_SECRET;

  if (process.env.CLOUDINARY_URL) {
    try {
      const match = process.env.CLOUDINARY_URL.match(/^cloudinary:\/\/([^:]+):([^@]+)@(.+)$/);
      if (match) {
        apiKey = apiKey || match[1];
        apiSecret = apiSecret || match[2];
        cloudName = cloudName || match[3];
      }
    } catch {}
  }

  return { cloudName, apiKey, apiSecret };
}

function extractPublicId(urlOrId: string): string {
  if (!urlOrId || typeof urlOrId !== "string") return "";
  const trimmed = urlOrId.trim();
  if (!trimmed.includes("cloudinary.com")) return trimmed;
  try {
    const parts = trimmed.split("/upload/");
    if (parts.length < 2) return trimmed;
    let path = parts[1];
    path = path.replace(/^(?:[a-z]_[^/]+\/)*v\d+\//, "");
    const dotIdx = path.lastIndexOf(".");
    return dotIdx > 0 ? path.substring(0, dotIdx) : path;
  } catch {
    return trimmed;
  }
}

/**
 * POST /api/cloudinary/delete
 * Deletes a single image asset from Cloudinary
 */
router.post("/cloudinary/delete", async (req: Request, res: Response): Promise<void> => {
  const { url, publicId } = req.body ?? {};
  const targetId = extractPublicId(publicId || url);

  if (!targetId) {
    res.status(400).json({ error: "Missing url or publicId" });
    return;
  }

  const { cloudName, apiKey, apiSecret } = getCloudinaryCredentials();

  if (!apiKey || !apiSecret) {
    // Graceful response so frontend doesn't crash if keys aren't configured yet
    res.status(200).json({
      success: false,
      warning: "CLOUDINARY_API_KEY or CLOUDINARY_API_SECRET not set in environment",
      publicId: targetId,
    });
    return;
  }

  try {
    const timestamp = Math.floor(Date.now() / 1000);
    const signatureStr = `public_id=${targetId}&timestamp=${timestamp}${apiSecret}`;
    const signature = crypto.createHash("sha1").update(signatureStr).digest("hex");

    const formData = new URLSearchParams();
    formData.append("public_id", targetId);
    formData.append("timestamp", timestamp.toString());
    formData.append("api_key", apiKey);
    formData.append("signature", signature);

    const cloudRes = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/destroy`, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: formData.toString(),
    });

    const result = await cloudRes.json().catch(() => ({}));
    res.json({ success: result?.result === "ok", result, publicId: targetId });
  } catch (error: any) {
    res.status(500).json({ error: error?.message || "Failed to delete Cloudinary asset" });
  }
});

/**
 * POST /api/cloudinary/delete-folder
 * Deletes all images in a folder and removes the folder
 */
router.post("/cloudinary/delete-folder", async (req: Request, res: Response): Promise<void> => {
  const { folder } = req.body ?? {};
  const cleanFolder = typeof folder === "string" ? folder.trim().replace(/^\/+|\/+$/g, "") : "";

  if (!cleanFolder) {
    res.status(400).json({ error: "Missing or invalid folder path" });
    return;
  }

  const { cloudName, apiKey, apiSecret } = getCloudinaryCredentials();

  if (!apiKey || !apiSecret) {
    res.status(200).json({
      success: false,
      warning: "CLOUDINARY_API_KEY or CLOUDINARY_API_SECRET not set in environment",
      folder: cleanFolder,
    });
    return;
  }

  const basicAuth = "Basic " + Buffer.from(`${apiKey}:${apiSecret}`).toString("base64");

  try {
    // 1. Delete all resources in this prefix/folder
    await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/resources/image/upload?prefix=${encodeURIComponent(cleanFolder)}`, {
      method: "DELETE",
      headers: { Authorization: basicAuth },
    });

    // 2. Delete the folder itself
    const folderRes = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/folders/${encodeURIComponent(cleanFolder)}`, {
      method: "DELETE",
      headers: { Authorization: basicAuth },
    });

    const folderResult = await folderRes.json().catch(() => ({}));
    res.json({ success: true, folder: cleanFolder, result: folderResult });
  } catch (error: any) {
    res.status(500).json({ error: error?.message || "Failed to delete Cloudinary folder" });
  }
});

export default router;
