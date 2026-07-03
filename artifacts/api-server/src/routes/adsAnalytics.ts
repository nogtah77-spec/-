import { Router, type IRouter } from "express";
import { db, settingsTable, adEventsTable } from "@workspace/db";
import { eq, and, gte, count, sql } from "drizzle-orm";
import { requireStaff } from "../lib/auth";

const router: IRouter = Router();

// ─── helper: هل الطلب من موظف/أدمن؟ ────────────────────────────────────────

function isStaffReq(req: import("express").Request): boolean {
  const sess = req.session as { userId?: string; role?: string };
  return !!sess?.userId && (sess.role === "admin" || sess.role === "agent");
}

// ─── تتبّع مشاهدة إعلان ─────────────────────────────────────────────────────

router.post("/ads/:id/view", async (req, res): Promise<void> => {
  if (isStaffReq(req)) { res.json({ ok: true, skipped: "staff" }); return; }
  const { id } = req.params;
  const {
    sessionId, deviceType, browser, os,
    screenWidth, screenHeight, language,
    referrer, referrerType, referrerPage,
    viewDuration,
  } = req.body ?? {};

  try {
    // ١ — تخزين الحدث التفصيلي
    await db.insert(adEventsTable).values({
      adId:         id,
      eventType:    "view",
      sessionId:    sessionId ?? null,
      deviceType:   deviceType ?? null,
      browser:      browser ?? null,
      os:           os ?? null,
      screenWidth:  screenWidth ?? null,
      screenHeight: screenHeight ?? null,
      language:     language ?? null,
      referrer:     referrer ?? null,
      referrerType: referrerType ?? null,
      referrerPage: referrerPage ?? null,
      viewDuration: viewDuration ?? null,
    });

    // ٢ — تحديث العداد السريع في settings (للعرض الفوري في لوحة الأدمن)
    const [row] = await db.select().from(settingsTable).limit(1);
    const data  = (row?.data ?? {}) as Record<string, unknown>;
    const ads   = (data.ads ?? []) as Array<Record<string, unknown>>;
    const newAds = ads.map(a =>
      a.id === id ? { ...a, views: ((a.views as number) ?? 0) + 1 } : a
    );
    const newData = { ...data, ads: newAds };
    await db.insert(settingsTable).values({ id: "main", data: newData })
      .onConflictDoUpdate({ target: settingsTable.id, set: { data: newData } });

    res.json({ ok: true });
  } catch {
    res.status(500).json({ error: "tracking failed" });
  }
});

// ─── تتبّع نقرة إعلان ───────────────────────────────────────────────────────

router.post("/ads/:id/click", async (req, res): Promise<void> => {
  if (isStaffReq(req)) { res.json({ ok: true, skipped: "staff" }); return; }
  const { id } = req.params;
  const {
    sessionId, deviceType, browser, os,
    screenWidth, screenHeight, language,
    referrer, referrerType, referrerPage,
    clickX, clickY,
  } = req.body ?? {};

  try {
    await db.insert(adEventsTable).values({
      adId:         id,
      eventType:    "click",
      sessionId:    sessionId ?? null,
      deviceType:   deviceType ?? null,
      browser:      browser ?? null,
      os:           os ?? null,
      screenWidth:  screenWidth ?? null,
      screenHeight: screenHeight ?? null,
      language:     language ?? null,
      referrer:     referrer ?? null,
      referrerType: referrerType ?? null,
      referrerPage: referrerPage ?? null,
      clickX:       clickX ?? null,
      clickY:       clickY ?? null,
    });

    const [row] = await db.select().from(settingsTable).limit(1);
    const data  = (row?.data ?? {}) as Record<string, unknown>;
    const ads   = (data.ads ?? []) as Array<Record<string, unknown>>;
    const newAds = ads.map(a =>
      a.id === id ? { ...a, clicks: ((a.clicks as number) ?? 0) + 1 } : a
    );
    const newData = { ...data, ads: newAds };
    await db.insert(settingsTable).values({ id: "main", data: newData })
      .onConflictDoUpdate({ target: settingsTable.id, set: { data: newData } });

    res.json({ ok: true });
  } catch {
    res.status(500).json({ error: "tracking failed" });
  }
});

// ─── إحصائيات إعلان (للأدمن فقط) ───────────────────────────────────────────

router.get("/ads/:id/analytics", requireStaff, async (req, res): Promise<void> => {
  const id  = String(req.params.id);
  const { from, to } = req.query as { from?: string; to?: string };

  const fromDate = from ? new Date(from) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  const toDate   = to   ? new Date(to)   : new Date();

  const conditions = [
    eq(adEventsTable.adId, id),
    gte(adEventsTable.createdAt, fromDate),
  ];

  const allEvents = await db
    .select()
    .from(adEventsTable)
    .where(and(...conditions));

  const views  = allEvents.filter(e => e.eventType === "view");
  const clicks = allEvents.filter(e => e.eventType === "click");

  // الزوار الفريدون (بـ sessionId)
  const uniqueSessions = new Set(views.map(e => e.sessionId).filter(Boolean));
  const uniqueClickers = new Set(clicks.map(e => e.sessionId).filter(Boolean));

  // متوسط مدة المشاهدة
  const durationsMs = views.map(e => e.viewDuration).filter((d): d is number => d != null && d > 0);
  const avgDuration = durationsMs.length > 0
    ? Math.round(durationsMs.reduce((a, b) => a + b, 0) / durationsMs.length)
    : 0;

  // إجمالي مشاهدات الفترة بالكامل (بدون date filter) للـ campaign summary
  const [totalRow] = await db
    .select({ total: count() })
    .from(adEventsTable)
    .where(and(eq(adEventsTable.adId, id), eq(adEventsTable.eventType, "view")));
  const [totalClicks] = await db
    .select({ total: count() })
    .from(adEventsTable)
    .where(and(eq(adEventsTable.adId, id), eq(adEventsTable.eventType, "click")));

  // ─── تجميع حسب فئات ────────────────────────────────────────────────────

  function groupBy<T>(arr: T[], key: keyof T): Record<string, number> {
    const result: Record<string, number> = {};
    for (const item of arr) {
      const k = String(item[key] ?? "Unknown");
      result[k] = (result[k] ?? 0) + 1;
    }
    return result;
  }

  const deviceBreakdown    = groupBy(views, "deviceType");
  const browserBreakdown   = groupBy(views, "browser");
  const osBreakdown        = groupBy(views, "os");
  const languageBreakdown  = groupBy(views, "language");
  const referrerTypeBreakdown = groupBy(views, "referrerType");
  const referrerPageBreakdown = groupBy(views, "referrerPage");

  // أحجام الشاشات
  const screenSizeMap: Record<string, number> = {};
  for (const e of views) {
    if (e.screenWidth && e.screenHeight) {
      const key = `${e.screenWidth}×${e.screenHeight}`;
      screenSizeMap[key] = (screenSizeMap[key] ?? 0) + 1;
    }
  }

  // ─── المخطط الزمني (يومي) ───────────────────────────────────────────────

  const timelineMap: Record<string, { views: number; clicks: number }> = {};
  const toISO = (d: Date) => d.toISOString().slice(0, 10);

  for (const e of allEvents) {
    const day = toISO(e.createdAt);
    if (!timelineMap[day]) timelineMap[day] = { views: 0, clicks: 0 };
    if (e.eventType === "view")  timelineMap[day].views++;
    if (e.eventType === "click") timelineMap[day].clicks++;
  }

  // إملاء الأيام الفارغة بين fromDate و toDate
  const timeline: Array<{ date: string; views: number; clicks: number; ctr: number }> = [];
  const cursor = new Date(fromDate);
  cursor.setHours(0, 0, 0, 0);
  while (cursor <= toDate) {
    const day  = toISO(cursor);
    const v    = timelineMap[day]?.views  ?? 0;
    const c    = timelineMap[day]?.clicks ?? 0;
    timeline.push({ date: day, views: v, clicks: c, ctr: v > 0 ? +(c / v * 100).toFixed(1) : 0 });
    cursor.setDate(cursor.getDate() + 1);
  }

  // ─── المخطط الساعي (0–23) ───────────────────────────────────────────────

  const hourlyMap: number[] = Array(24).fill(0);
  for (const e of views) {
    hourlyMap[e.createdAt.getHours()]++;
  }

  // ─── أيام الأسبوع (0=الأحد) ─────────────────────────────────────────────

  const weekdayMap: number[] = Array(7).fill(0);
  for (const e of views) {
    weekdayMap[e.createdAt.getDay()]++;
  }

  // ─── heatmap النقرات ────────────────────────────────────────────────────

  const clickHeatmap = clicks
    .filter(e => e.clickX != null && e.clickY != null)
    .map(e => ({ x: e.clickX!, y: e.clickY! }));

  // ─── الزوار اليوم / 7 أيام / 30 يوماً ─────────────────────────────────

  const now    = new Date();
  const day1   = new Date(now); day1.setHours(0, 0, 0, 0);
  const day7   = new Date(now); day7.setDate(now.getDate() - 7);
  const day30  = new Date(now); day30.setDate(now.getDate() - 30);

  const allViewsEver = await db
    .select()
    .from(adEventsTable)
    .where(and(eq(adEventsTable.adId, id), eq(adEventsTable.eventType, "view")));

  const visitorsToday = new Set(allViewsEver.filter(e => e.createdAt >= day1).map(e => e.sessionId)).size;
  const visitors7d    = new Set(allViewsEver.filter(e => e.createdAt >= day7).map(e => e.sessionId)).size;
  const visitors30d   = new Set(allViewsEver.filter(e => e.createdAt >= day30).map(e => e.sessionId)).size;
  const visitorsAll   = new Set(allViewsEver.map(e => e.sessionId)).size;

  // ─── الرد ──────────────────────────────────────────────────────────────

  const totalViews  = totalRow?.total   ?? 0;
  const totalClk    = totalClicks?.total ?? 0;

  res.json({
    overview: {
      totalViews:       Number(totalViews),
      totalClicks:      Number(totalClk),
      ctr:              Number(totalViews) > 0 ? +(Number(totalClk) / Number(totalViews) * 100).toFixed(2) : 0,
      uniqueVisitors:   uniqueSessions.size,
      uniqueClickers:   uniqueClickers.size,
      avgViewDuration:  avgDuration,
      periodViews:      views.length,
      periodClicks:     clicks.length,
    },
    visitors: { today: visitorsToday, last7d: visitors7d, last30d: visitors30d, all: visitorsAll },
    devices:    deviceBreakdown,
    browsers:   browserBreakdown,
    os:         osBreakdown,
    languages:  languageBreakdown,
    referrerTypes: referrerTypeBreakdown,
    referrerPages: referrerPageBreakdown,
    screenSizes: screenSizeMap,
    timeline,
    peakHours:  hourlyMap,
    weekdays:   weekdayMap,
    clickHeatmap,
    period: { from: fromDate.toISOString(), to: toDate.toISOString() },
  });
});

export default router;
