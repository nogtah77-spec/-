import { Router, type IRouter } from "express";
import { db, settingsTable } from "@workspace/db";
import { requireStaff } from "../lib/auth";
import { logActivity, actorFromReq } from "../lib/activityLog";

const router: IRouter = Router();

router.get("/settings", async (_req, res): Promise<void> => {
  const [row] = await db.select().from(settingsTable).limit(1);
  res.json(row?.data ?? {});
});

router.put("/settings", requireStaff, async (req, res): Promise<void> => {
  const body = req.body;
  if (typeof body !== "object" || body === null || Array.isArray(body)) {
    res.status(400).json({ error: "settings must be an object" });
    return;
  }
  await db
    .insert(settingsTable)
    .values({ id: "main", data: body })
    .onConflictDoUpdate({ target: settingsTable.id, set: { data: body } });
  await logActivity({
    action: "updated",
    entityType: "settings",
    title: "تم تعديل إعدادات المنصة",
    actor: actorFromReq(req),
  });
  res.json(body);
});

// ─── تتبّع إحصائيات الإعلانات (عامة — بدون auth) ────────────────────────────
// يُهمَل طلب الأدمن/الموظف تلقائياً من طرف الـ server

type AdRecord = { id: string; views?: number; clicks?: number; [key: string]: unknown };
type SettingsData = { ads?: AdRecord[]; [key: string]: unknown };

async function incrementAdStat(
  adId: string,
  field: "views" | "clicks",
  req: import("express").Request,
  res: import("express").Response
): Promise<void> {
  // تجاهل طلبات الأدمن والموظفين
  const role = (req.session as { role?: string })?.role;
  if ((req.session as { userId?: string })?.userId && (role === "admin" || role === "agent")) {
    res.json({ ok: true, skipped: "staff" });
    return;
  }

  try {
    const [row] = await db.select().from(settingsTable).limit(1);
    const data  = ((row?.data ?? {}) as SettingsData);
    const ads   = (data.ads ?? []) as AdRecord[];
    const newAds = ads.map(a =>
      a.id === adId ? { ...a, [field]: ((a[field] as number) ?? 0) + 1 } : a
    );
    const newData: SettingsData = { ...data, ads: newAds };
    await db
      .insert(settingsTable)
      .values({ id: "main", data: newData as Record<string, unknown> })
      .onConflictDoUpdate({ target: settingsTable.id, set: { data: newData as Record<string, unknown> } });
    res.json({ ok: true });
  } catch {
    res.status(500).json({ error: "tracking failed" });
  }
}

router.post("/ads/:id/view",  (req, res) => incrementAdStat(req.params.id, "views",  req, res));
router.post("/ads/:id/click", (req, res) => incrementAdStat(req.params.id, "clicks", req, res));

export default router;
