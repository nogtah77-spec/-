import postgres from "postgres";
const sql = postgres(process.env.DATABASE_URL);
const [row] = await sql`SELECT data FROM settings WHERE id = 'main'`;
const settings = row.data;
// إزالة premium_demo_001 لو موجود قبل كده
settings.ads = (settings.ads || []).filter(a => a.id !== "premium_demo_001");
const premiumAd = {
  id: "premium_demo_001",
  type: "premium",
  title: "بانر Premium تجريبي — فرص استثمارية لا تُفوَّت",
  desktopImageUrl: "https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=1800&h=400&fit=crop&crop=center",
  mobileImageUrl:  "https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=1200&h=400&fit=crop&crop=center",
  linkUrl: "https://example.com/premium",
  active: true, order: 0, duration: 8, views: 0, clicks: 0,
  startDate: "", endDate: "", imageUrl: "",
};
settings.ads = [premiumAd, ...settings.ads];
await sql`UPDATE settings SET data = ${sql.json(settings)} WHERE id = 'main'`;
console.log("Done. Ads:", settings.ads.map(a => `[${a.type}] ${a.title}`).join(" | "));
await sql.end();
