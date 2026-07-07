import { Router, type IRouter } from "express";
import { randomUUID } from "node:crypto";
import { db, finishingGalleryTable } from "@workspace/db";
import { eq, asc } from "drizzle-orm";
import { requireStaff } from "../lib/auth";
import { logActivity, actorFromReq } from "../lib/activityLog";

const router: IRouter = Router();

router.get("/finishing-gallery", async (req, res): Promise<void> => {
  const sess = req.session as { userId?: string; role?: string };
  const isStaff = !!sess?.userId && (sess.role === "admin" || sess.role === "agent");
  const rows = await db.select().from(finishingGalleryTable).orderBy(asc(finishingGalleryTable.displayOrder));
  res.json(isStaff ? rows : rows.filter(r => r.active));
});

router.post("/finishing-gallery", requireStaff, async (req, res): Promise<void> => {
  const { title = "", description = "", imageUrl = "", videoUrl = "", displayOrder = 0, active = true } = req.body as {
    title?: string; description?: string; imageUrl?: string;
    videoUrl?: string; displayOrder?: number; active?: boolean;
  };
  const item = {
    id: randomUUID(),
    title, description, imageUrl, videoUrl,
    displayOrder: Number(displayOrder),
    active: !!active,
    createdAt: new Date().toISOString(),
  };
  await db.insert(finishingGalleryTable).values(item);
  await logActivity({ action: "created", entityType: "finishing_gallery", title: `تم إضافة عنصر للمعرض: ${title || "بدون عنوان"}`, actor: actorFromReq(req) });
  res.status(201).json(item);
});

router.patch("/finishing-gallery/:id", requireStaff, async (req, res): Promise<void> => {
  const id = String(req.params.id);
  const [existing] = await db.select().from(finishingGalleryTable).where(eq(finishingGalleryTable.id, id)).limit(1);
  if (!existing) { res.status(404).json({ error: "not found" }); return; }
  await db.update(finishingGalleryTable).set(req.body).where(eq(finishingGalleryTable.id, id));
  await logActivity({ action: "updated", entityType: "finishing_gallery", title: `تم تعديل عنصر المعرض: ${existing.title || "بدون عنوان"}`, actor: actorFromReq(req) });
  res.json({ ...existing, ...req.body });
});

router.delete("/finishing-gallery/:id", requireStaff, async (req, res): Promise<void> => {
  const id = String(req.params.id);
  const [existing] = await db.select().from(finishingGalleryTable).where(eq(finishingGalleryTable.id, id)).limit(1);
  if (!existing) { res.status(404).json({ error: "not found" }); return; }
  await db.delete(finishingGalleryTable).where(eq(finishingGalleryTable.id, id));
  await logActivity({ action: "deleted", entityType: "finishing_gallery", title: `تم حذف عنصر المعرض: ${existing.title || "بدون عنوان"}`, actor: actorFromReq(req) });
  res.json({ ok: true });
});

export default router;
