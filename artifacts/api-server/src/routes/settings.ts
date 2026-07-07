import { Router, type IRouter } from "express";
import { db, settingsTable } from "@workspace/db";
import { requireStaff } from "../lib/auth";
import { logActivity, actorFromReq } from "../lib/activityLog";

const router: IRouter = Router();

router.get("/settings", async (_req, res): Promise<void> => {
  const [row] = await db.select().from(settingsTable).limit(1);
  const data = { ...(row?.data ?? {}) } as Record<string, unknown>;
  // Exclude large gallery blobs from app startup payload — served via /api/finishing-gallery
  delete data.finishingGallery;
  res.json(data);
});

router.put("/settings", requireStaff, async (req, res): Promise<void> => {
  const body = req.body;
  if (typeof body !== "object" || body === null || Array.isArray(body)) {
    res.status(400).json({ error: "settings must be an object" });
    return;
  }
  // Preserve gallery data when saving platform settings
  const [row] = await db.select().from(settingsTable).limit(1);
  const existing = (row?.data ?? {}) as Record<string, unknown>;
  const merged = { ...body, finishingGallery: existing.finishingGallery };
  await db
    .insert(settingsTable)
    .values({ id: "main", data: merged })
    .onConflictDoUpdate({ target: settingsTable.id, set: { data: merged } });
  await logActivity({
    action: "updated",
    entityType: "settings",
    title: "تم تعديل إعدادات المنصة",
    actor: actorFromReq(req),
  });
  res.json(body);
});

export default router;
