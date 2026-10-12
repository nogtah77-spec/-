import { useEffect, useMemo, useState } from "react";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Building2, Eye, MapPin, Users, Radio, CalendarDays, CalendarRange,
  CalendarClock, LineChart, ShieldAlert, TrendingUp, Sparkles, Trophy,
  DollarSign, ArrowUpRight, CheckCircle2, Flame, PieChart as PieIcon,
  BarChart3, Activity, Compass, Layers, Sliders
} from "lucide-react";
import { useData } from "@/context/DataContext";
import { useAuth } from "@/context/AuthContext";
import { RollingNumber } from "@/components/ui/RollingNumber";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { checkUserPermission } from "@/lib/permissions";
import { formatNumber, cn } from "@/lib/utils";
import { parsePropertyImages } from "@/lib/supabaseService";
import { getCardImageUrl } from "@/lib/cloudinaryService";
import { Link } from "wouter";
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
} from "recharts";

const LUXURY_PALETTE = [
  "#A9927D", // Warm Sand Taupe
  "#2563eb", // Royal Blue
  "#10b981", // Emerald Green
  "#8b5cf6", // Purple
  "#f59e0b", // Amber
  "#06b6d4", // Cyan
  "#ec4899", // Rose
  "#64748b", // Slate
];

const CATEGORY_LABELS: Record<string, string> = {
  sale: "للبيع",
  rent: "للإيجار",
  furnished: "مفروش",
  administrative: "إداري",
  medical: "طبي",
  commercial: "تجاري",
  residential: "سكني",
};

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  active: { label: "نشط", color: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30" },
  listed: { label: "معروض", color: "bg-blue-500/15 text-blue-600 dark:text-blue-400 border-blue-500/30" },
  reserved: { label: "محجوز", color: "bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30" },
  sold: { label: "مباع", color: "bg-purple-500/15 text-purple-600 dark:text-purple-400 border-purple-500/30" },
  rented: { label: "مؤجر", color: "bg-cyan-500/15 text-cyan-600 dark:text-cyan-400 border-cyan-500/30" },
  draft: { label: "مسودة", color: "bg-slate-500/15 text-slate-600 dark:text-slate-400 border-slate-500/30" },
};

function ChartEmpty({ label }: { label: string }) {
  return (
    <div className="h-[260px] w-full flex flex-col items-center justify-center bg-muted/10 rounded-xl border border-dashed border-border/60 p-6 text-center">
      <Compass className="h-8 w-8 text-muted-foreground/40 mb-2 animate-pulse" />
      <p className="text-muted-foreground text-sm font-medium">{label}</p>
    </div>
  );
}

export default function Analytics() {
  const {
    properties,
    regions,
    propertyTypes,
    inquiries,
    finishingRequests,
    propertyRequests,
    customerPropertyRequests,
    visitorStats,
    refreshVisitorStats,
  } = useData();

  const { currentUser } = useAuth();
  const isAdmin = currentUser?.role === "admin";
  const canViewAnalytics = isAdmin || checkUserPermission(currentUser, "التقارير-عرض التحليلات");



  useEffect(() => {
    refreshVisitorStats();
    const interval = setInterval(refreshVisitorStats, 12_000);
    return () => clearInterval(interval);
  }, [refreshVisitorStats]);

  // Exclude system stores from real calculations
  const cleanProperties = useMemo(() => {
    return properties.filter(
      (p) => !p.id?.startsWith("__") && !p.code?.startsWith("__")
    );
  }, [properties]);

  // Published properties (exclude drafts from public market & price tier calculations)
  const publishedProperties = useMemo(() => {
    return cleanProperties.filter((p) => p.status !== "draft");
  }, [cleanProperties]);

  // Visitor cards data
  const visitorCards = [
    { key: "online", title: "متواجدون الآن", sub: "تتبع لحظي للزوار", value: visitorStats.online, icon: Radio, live: true },
    { key: "today", title: "زوار اليوم", sub: "يتصفر يومياً 12 ص", value: visitorStats.today, icon: CalendarDays, live: false },
    { key: "week", title: "زوار هذا الأسبوع", sub: "يتصفر كل سبت", value: visitorStats.week, icon: CalendarRange, live: false },
    { key: "month", title: "زوار هذا الشهر", sub: "يتصفر أول كل شهر", value: visitorStats.month, icon: CalendarClock, live: false },
  ];

  // Key Totals
  const totalViews = useMemo(
    () => cleanProperties.reduce((sum, p) => sum + (p.views ?? 0), 0),
    [cleanProperties]
  );

  const activeProperties = useMemo(
    () => cleanProperties.filter((p) => p.status === "active" || p.status === "listed").length,
    [cleanProperties]
  );

  const totalLeads = useMemo(
    () => inquiries.length + finishingRequests.length + propertyRequests.length + (customerPropertyRequests?.length || 0),
    [inquiries, finishingRequests, propertyRequests, customerPropertyRequests]
  );

  // 1. Region Views & Demand Leaderboard
  const regionLeaderboard = useMemo(() => {
    const map = new Map<string, number>();
    for (const p of publishedProperties) {
      map.set(p.regionId, (map.get(p.regionId) ?? 0) + (p.views ?? 0));
    }
    const list = regions
      .map((r) => ({
        id: r.id,
        name: r.name,
        views: map.get(r.id) ?? 0,
        count: publishedProperties.filter((p) => p.regionId === r.id).length,
      }))
      .filter((d) => d.count > 0 || d.views > 0)
      .sort((a, b) => b.views - a.views);

    const maxViews = Math.max(...list.map((r) => r.views), 1);
    return list.map((item, idx) => ({
      ...item,
      rank: idx + 1,
      percentage: totalViews > 0 ? Math.round((item.views / totalViews) * 100) : 0,
      barWidth: Math.max(Math.round((item.views / maxViews) * 100), 8),
    }));
  }, [publishedProperties, regions, totalViews]);

  // 2. Type Distribution (Donut & Progress Bars)
  const typeDistribution = useMemo(() => {
    const map = new Map<string, number>();
    for (const p of publishedProperties) {
      map.set(p.typeId, (map.get(p.typeId) ?? 0) + 1);
    }
    const total = publishedProperties.length || 1;
    return propertyTypes
      .map((t, idx) => {
        const count = map.get(t.id) ?? 0;
        return {
          id: t.id,
          name: t.name,
          value: count,
          percentage: Math.round((count / total) * 100),
          color: LUXURY_PALETTE[idx % LUXURY_PALETTE.length],
        };
      })
      .filter((d) => d.value > 0)
      .sort((a, b) => b.value - a.value);
  }, [publishedProperties, propertyTypes]);

  // 3. Top Trending / Most Viewed Properties
  const topTrendingProperties = useMemo(() => {
    return [...publishedProperties]
      .sort((a, b) => (b.views ?? 0) - (a.views ?? 0))
      .slice(0, 4);
  }, [publishedProperties]);

  // 4. Price Spectrum & Portfolio Distribution
  const priceSpectrum = useMemo(() => {
    const ranges = [
      { id: "tier1", label: "أقل من 3 مليون ج.م", min: 0, max: 3_000_000, color: "from-blue-500 to-cyan-400", bgBadge: "bg-blue-500/10 text-blue-600 dark:text-blue-400" },
      { id: "tier2", label: "3 إلى 6 مليون ج.م", min: 3_000_000, max: 6_000_000, color: "from-emerald-500 to-teal-400", bgBadge: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" },
      { id: "tier3", label: "6 إلى 10 مليون ج.م", min: 6_000_000, max: 10_000_000, color: "from-amber-500 to-yellow-400", bgBadge: "bg-amber-500/10 text-amber-600 dark:text-amber-400" },
      { id: "tier4", label: "أكثر من 10 مليون (فاخر)", min: 10_000_000, max: Infinity, color: "from-amber-600 to-accent", bgBadge: "bg-accent/15 text-accent" },
    ];

    const total = publishedProperties.length || 1;
    return ranges.map((r) => {
      const matching = publishedProperties.filter((p) => (p.price || 0) >= r.min && (p.price || 0) < r.max);
      const count = matching.length;
      const percentage = publishedProperties.length > 0 ? Math.round((count / total) * 100) : 0;
      const totalPrice = matching.reduce((sum, p) => sum + (p.price || 0), 0);
      return {
        ...r,
        count,
        percentage,
        totalPrice,
      };
    });
  }, [publishedProperties]);

  // 5. Engagement & Conversion Funnel (100% Real Data - No synthetic multipliers or fake fallback percentages)
  const funnelSteps = useMemo(() => {
    const allTimeVisitors = visitorStats.allTime || 0;
    const baseTraffic = Math.max(allTimeVisitors + totalViews, totalViews);
    const viewsCount = totalViews;
    const directLeads = inquiries.length + (customerPropertyRequests?.length || 0);
    const specializedLeads = finishingRequests.length + propertyRequests.length;

    const viewsPct = baseTraffic > 0 ? Math.min(Math.round((viewsCount / baseTraffic) * 100), 100) : 0;
    const directLeadsPct = viewsCount > 0 ? Math.min(Math.round((directLeads / viewsCount) * 100), 100) : 0;
    const specializedPct = viewsCount > 0 ? Math.min(Math.round((specializedLeads / viewsCount) * 100), 100) : 0;

    return [
      {
        title: "إجمالي الزيارات والاهتمام",
        value: baseTraffic,
        subtitle: "الزوار التراكميون والمشاهدات منذ تأسيس المنصة",
        pct: baseTraffic > 0 ? 100 : 0,
        color: "bg-blue-500",
      },
      {
        title: "مشاهدات تفاصيل العقارات",
        value: viewsCount,
        subtitle: "تفاعل الزوار الفعلي مع صفحات الوحدات",
        pct: viewsPct,
        color: "bg-amber-500",
      },
      {
        title: "استفسارات وتواصل مباشر",
        value: directLeads,
        subtitle: "رسائل واستفسارات وطلبات شراء أو إيجار",
        pct: directLeadsPct,
        color: "bg-emerald-500",
      },
      {
        title: "طلبات تشطيب ومعاينات جادة",
        value: specializedLeads,
        subtitle: "طلبات خدمات التشطيب وعرض العقارات",
        pct: specializedPct,
        color: "bg-purple-500",
      },
    ];
  }, [visitorStats.allTime, totalViews, inquiries, finishingRequests, propertyRequests, customerPropertyRequests]);

  // 6. Listing Type & Category Breakdown
  const listingTypeData = useMemo(() => {
    const map = new Map<string, number>();
    for (const p of publishedProperties) {
      const lt = p.listingType || "sale";
      map.set(lt, (map.get(lt) ?? 0) + 1);
    }
    const total = publishedProperties.length || 1;
    return Array.from(map.entries())
      .map(([key, value]) => ({
        key,
        name: CATEGORY_LABELS[key] ?? key,
        value,
        percentage: publishedProperties.length > 0 ? Math.round((value / total) * 100) : 0,
      }))
      .sort((a, b) => b.value - a.value);
  }, [publishedProperties]);

  const categoryData = useMemo(() => {
    const map = new Map<string, number>();
    for (const p of publishedProperties) {
      map.set(p.category || "residential", (map.get(p.category || "residential") ?? 0) + 1);
    }
    const total = publishedProperties.length || 1;
    return Array.from(map.entries())
      .map(([key, value]) => ({
        key,
        name: CATEGORY_LABELS[key] ?? key,
        value,
        percentage: publishedProperties.length > 0 ? Math.round((value / total) * 100) : 0,
      }))
      .sort((a, b) => b.value - a.value);
  }, [publishedProperties]);

  // 7. Status Breakdown (includes all statuses including drafts)
  const statusData = useMemo(() => {
    const map = new Map<string, number>();
    for (const p of cleanProperties) {
      map.set(p.status || "active", (map.get(p.status || "active") ?? 0) + 1);
    }
    const total = cleanProperties.length || 1;
    return Array.from(map.entries()).map(([key, count]) => ({
      key,
      info: STATUS_LABELS[key] || { label: key, color: "bg-muted text-muted-foreground" },
      count,
      percentage: Math.round((count / total) * 100),
    }));
  }, [cleanProperties]);

  if (!canViewAnalytics) {
    return (
      <AdminLayout>
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-6 space-y-4">
          <div className="w-16 h-16 rounded-full bg-destructive/10 text-destructive flex items-center justify-center">
            <ShieldAlert className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold text-foreground">غير مصرح لك بالوصول</h2>
          <p className="text-sm text-muted-foreground max-w-md">
            ليس لديك صلاحية عرض تحليلات وإحصائيات المنصة. يرجى مراجعة مدير النظام للحصول على الصلاحيات المطلوبة.
          </p>
          <Button asChild className="mt-4 bg-accent text-accent-foreground">
            <Link href="/admin">العودة للوحة التحكم</Link>
          </Button>
        </div>
      </AdminLayout>
    );
  }

  const kpis = [
    { title: "إجمالي العقارات المتاحة", value: cleanProperties.length, icon: Building2, sub: "مخزون المنصة الحالي" },
    { title: "إجمالي المشاهدات والتفاعل", value: totalViews, icon: Eye, sub: "مشاهدات صفحات العقارات" },
    { title: "عقارات نشطة ومعروضة", value: activeProperties, icon: CheckCircle2, sub: "متاحة للحجز والتسويق" },
    { title: "إجمالي طلبات العملاء", value: totalLeads, icon: Users, sub: "استفسارات وتشطيبات" },
  ];

  return (
    <AdminLayout>
      <div className="space-y-8 pb-12">
        {/* Header */}
        <AdminPageHeader
          title="التحليلات والمؤشرات الاستراتيجية"
          subtitle="لوحة تحليلات تفصيلية لقياس أداء العقارات، تفاعل المناطق، وقمع تحويل العملاء"
          eyebrow="ذكاء الأعمال والبيانات"
          icon={LineChart}
        />



        {/* Live Visitor Stats Cards */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold tracking-wider text-muted-foreground uppercase flex items-center gap-2">
              <Activity className="h-4 w-4 text-accent" />
              حركة الزوار المباشرة
            </h2>
            <Badge variant="outline" className="border-accent/30 text-accent text-[11px] gap-1.5 py-0.5">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-500 opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
              </span>
              تحديث تلقائي
            </Badge>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            {visitorCards.map((c) => (
              <Card key={c.key} className="card-luxury relative overflow-hidden group hover:border-accent/40 transition-all duration-300 p-3 sm:p-5">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs sm:text-sm font-semibold text-muted-foreground flex items-center gap-1.5 truncate">
                    {c.live && (
                      <span className="relative flex h-2 w-2 shrink-0">
                        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-500 opacity-75" />
                        <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
                      </span>
                    )}
                    <span className="truncate">{c.title}</span>
                  </span>
                  <div className="p-1.5 sm:p-2 bg-background/80 rounded-lg shadow-xs border border-border/40 shrink-0 group-hover:scale-105 transition-transform">
                    <c.icon className={`h-3.5 w-3.5 sm:h-4 sm:w-4 ${c.live ? "text-emerald-500" : "text-accent"}`} />
                  </div>
                </div>
                <div className="flex justify-start text-xl sm:text-2xl lg:text-3xl font-black text-foreground tracking-tight" dir="ltr">
                  <RollingNumber value={c.value} />
                </div>
                <p className="text-[10px] sm:text-[11px] text-muted-foreground mt-1 truncate">{c.sub}</p>
              </Card>
            ))}
          </div>
        </div>

        {/* Primary Platform KPIs */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {kpis.map((s, i) => (
            <Card key={i} className="card-luxury relative overflow-hidden group hover:border-accent/40 transition-all duration-300 p-3 sm:p-5">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs sm:text-sm font-semibold text-muted-foreground truncate">{s.title}</span>
                <div className="p-1.5 sm:p-2 bg-background/80 rounded-lg shadow-xs border border-border/40 shrink-0 group-hover:scale-105 transition-transform">
                  <s.icon className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-accent" />
                </div>
              </div>
              <div className="text-xl sm:text-2xl lg:text-3xl font-black text-foreground tracking-tight" dir="ltr">
                {s.value.toLocaleString("en-US")}
              </div>
              <p className="text-[10px] sm:text-[11px] text-muted-foreground mt-1 truncate">{s.sub}</p>
            </Card>
          ))}
        </div>

        {/* Grid 1: Donut Type Distribution + Region Leaderboard */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Box 1: Luxury Donut for Property Types (5 cols) */}
          <Card className="card-luxury lg:col-span-5 flex flex-col justify-between overflow-hidden">
            <CardHeader className="pb-3 border-b border-border/40">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-base font-bold text-foreground flex items-center gap-2">
                    <PieIcon className="h-4 w-4 text-accent" />
                    توزيع العقارات حسب النوع
                  </CardTitle>
                  <CardDescription className="text-xs text-muted-foreground mt-0.5">
                    النسبة المئوية لكل فئة من العقارات المنشورة في المنصة
                  </CardDescription>
                </div>
                <Badge variant="secondary" className="font-semibold text-[11px]">
                  {publishedProperties.length} عقار
                </Badge>
              </div>
            </CardHeader>

            <CardContent className="pt-4 flex-1 flex flex-col justify-between">
              {typeDistribution.length === 0 ? (
                <ChartEmpty label="لا توجد بيانات عقارات متاحة حالياً" />
              ) : (
                <div className="space-y-5">
                  {/* Central Donut Chart */}
                  <div className="relative h-[200px] w-full flex items-center justify-center">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={typeDistribution}
                          dataKey="value"
                          nameKey="name"
                          cx="50%"
                          cy="50%"
                          innerRadius={62}
                          outerRadius={88}
                          paddingAngle={3}
                          stroke="transparent"
                        >
                          {typeDistribution.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip
                          content={({ active, payload }) => {
                            if (active && payload && payload.length) {
                              const data = payload[0].payload;
                              return (
                                <div className="bg-popover/95 backdrop-blur-md border border-border px-3 py-2 rounded-lg shadow-xl text-xs font-medium text-popover-foreground">
                                  <p className="font-bold">{data.name}</p>
                                  <p className="text-accent mt-0.5">{data.value} عقار ({data.percentage}%)</p>
                                </div>
                              );
                            }
                            return null;
                          }}
                        />
                      </PieChart>
                    </ResponsiveContainer>

                    {/* Centered Total Counter */}
                    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                      <span className="text-2xl font-black text-foreground tracking-tight">
                        {publishedProperties.length}
                      </span>
                      <span className="text-[11px] font-medium text-muted-foreground uppercase">
                        إجمالي الوحدات
                      </span>
                    </div>
                  </div>

                  {/* Horizontal Segmented Progress List */}
                  <div className="space-y-2.5 max-h-[220px] overflow-y-auto pr-1">
                    {typeDistribution.map((item) => (
                      <div key={item.id} className="space-y-1 group">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-semibold text-foreground flex items-center gap-2">
                            <span className="h-2.5 w-2.5 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                            {item.name}
                          </span>
                          <span className="text-muted-foreground font-mono text-[11px]">
                            <strong className="text-foreground">{item.value}</strong> ({item.percentage}%)
                          </span>
                        </div>
                        <div className="h-1.5 w-full bg-muted/40 rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all duration-500 group-hover:brightness-110"
                            style={{
                              width: `${Math.max(item.percentage, 3)}%`,
                              backgroundColor: item.color,
                            }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Box 2: Ranked Region Leaderboard (7 cols) */}
          <Card className="card-luxury lg:col-span-7 flex flex-col justify-between overflow-hidden">
            <CardHeader className="pb-3 border-b border-border/40">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-base font-bold text-foreground flex items-center gap-2">
                    <Trophy className="h-4 w-4 text-accent" />
                    ترتيب المناطق حسب المشاهدات والطلب
                  </CardTitle>
                  <CardDescription className="text-xs text-muted-foreground mt-0.5">
                    قياس حجم التفاعل والزيارات الفعلية لكل منطقة جغرافية
                  </CardDescription>
                </div>
                <Badge variant="outline" className="border-accent/30 text-accent font-semibold text-[11px] gap-1">
                  <Flame className="h-3 w-3 text-amber-500 fill-amber-500" />
                  الأعلى طلباً
                </Badge>
              </div>
            </CardHeader>

            <CardContent className="pt-4 flex-1">
              {regionLeaderboard.length === 0 ? (
                <ChartEmpty label="لا توجد بيانات مشاهدات للمناطق حتى الآن" />
              ) : (
                <div className="space-y-3.5">
                  {regionLeaderboard.map((reg) => (
                    <div
                      key={reg.id}
                      className="p-3 rounded-xl border border-border/40 bg-background/50 hover:bg-muted/30 transition-all duration-200 space-y-2 group"
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-2.5 min-w-0">
                          {/* Rank Badge */}
                          <span
                            className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-lg text-xs font-bold ${
                              reg.rank === 1
                                ? "bg-amber-500 text-black shadow-md shadow-amber-500/20"
                                : reg.rank === 2
                                ? "bg-slate-300 text-slate-900 dark:bg-slate-700 dark:text-slate-100"
                                : reg.rank === 3
                                ? "bg-amber-700/60 text-white"
                                : "bg-muted text-muted-foreground"
                            }`}
                          >
                            {reg.rank}
                          </span>
                          <span className="font-bold text-foreground text-sm truncate">
                            {reg.name}
                          </span>
                          {reg.rank === 1 && (
                            <Badge className="bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30 text-[10px] py-0 px-1.5 hidden sm:inline-flex">
                              المتصدرة 🔥
                            </Badge>
                          )}
                        </div>

                        <div className="flex items-center gap-3 text-xs shrink-0">
                          <span className="text-muted-foreground">
                            <strong className="text-foreground font-mono">{reg.count}</strong> عقار
                          </span>
                          <div className="flex items-center gap-1 font-bold text-foreground font-mono bg-accent/10 px-2 py-0.5 rounded-md border border-accent/20">
                            <Eye className="h-3.5 w-3.5 text-accent" />
                            {reg.views.toLocaleString("en-US")}
                          </div>
                        </div>
                      </div>

                      {/* Smooth Progress Bar with Percentage */}
                      <div className="relative flex items-center gap-3">
                        <div className="h-2 w-full bg-muted/40 rounded-full overflow-hidden flex-1">
                          <div
                            className={`h-full rounded-full transition-all duration-500 ${
                              reg.rank === 1
                                ? "bg-gradient-to-r from-amber-500 to-accent"
                                : "bg-gradient-to-r from-accent/70 to-accent"
                            }`}
                            style={{ width: `${reg.barWidth}%` }}
                          />
                        </div>
                        <span className="text-[11px] font-mono text-muted-foreground w-9 text-left">
                          {reg.percentage}%
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Grid 2: Top Trending Properties + Price Spectrum */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Box 3: Top Trending Properties (7 cols) */}
          <Card className="card-luxury lg:col-span-7 flex flex-col justify-between overflow-hidden">
            <CardHeader className="pb-3 border-b border-border/40">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-base font-bold text-foreground flex items-center gap-2">
                    <Flame className="h-4 w-4 text-amber-500" />
                    العقارات الأكثر رواجاً ومشاهدة
                  </CardTitle>
                  <CardDescription className="text-xs text-muted-foreground mt-0.5">
                    الوحدات التي حصدت أعلى معدلات الاهتمام والزيارات في المنصة
                  </CardDescription>
                </div>
                <Button asChild variant="ghost" size="sm" className="text-xs text-accent hover:text-accent gap-1">
                  <Link href="/admin/properties">
                    جميع العقارات <ArrowUpRight className="h-3.5 w-3.5" />
                  </Link>
                </Button>
              </div>
            </CardHeader>

            <CardContent className="pt-4 flex-1">
              {topTrendingProperties.length === 0 ? (
                <ChartEmpty label="لا توجد عقارات مضافة بعد" />
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  {topTrendingProperties.map((p) => {
                    const regionName = regions.find((r) => r.id === p.regionId)?.name || "المنطقة";
                    const typeName = propertyTypes.find((t) => t.id === p.typeId)?.name || "عقار";
                    const parsedImgs = parsePropertyImages(p.images);
                    const rawThumb = parsedImgs[0] || "";
                    const thumbnail = rawThumb ? getCardImageUrl(rawThumb) : "https://images.unsplash.com/photo-1613977257363-707ba9348227?w=600&q=80";

                    return (
                      <div
                        key={p.id}
                        className="group relative flex flex-col justify-between rounded-xl border border-border/50 bg-background/60 p-3 hover:border-accent/50 hover:shadow-md transition-all duration-300"
                      >
                        <div className="flex gap-3 items-start">
                          <div className="relative h-16 w-16 shrink-0 rounded-lg overflow-hidden border border-border/60 bg-muted">
                            <img
                              src={thumbnail}
                              alt={p.title || p.code}
                              className="h-full w-full object-cover group-hover:scale-110 transition-transform duration-300"
                              loading="lazy"
                              onError={(e) => {
                                const target = e.currentTarget;
                                if (rawThumb && target.src !== rawThumb) {
                                  target.src = rawThumb;
                                } else {
                                  target.src = "https://images.unsplash.com/photo-1613977257363-707ba9348227?w=600&q=80";
                                }
                              }}
                            />
                            <div className="absolute top-1 right-1 bg-black/70 backdrop-blur-xs px-1.5 py-0.5 rounded text-[9px] font-mono text-white">
                              {p.code}
                            </div>
                          </div>

                          <div className="flex-1 min-w-0">
                            <h4 className="font-bold text-xs text-foreground truncate group-hover:text-accent transition-colors">
                              {p.title || p.code}
                            </h4>
                            <div className="flex items-center gap-1 text-[11px] text-muted-foreground mt-1">
                              <MapPin className="h-3 w-3 text-accent shrink-0" />
                              <span className="truncate">{regionName} • {typeName}</span>
                            </div>
                            <div className="text-xs font-bold text-foreground mt-1.5 font-mono">
                              {formatNumber(p.price)} <span className="text-[10px] text-muted-foreground font-normal">ج.م</span>
                            </div>
                          </div>
                        </div>

                        <div className="mt-3 pt-2 border-t border-border/30 flex items-center justify-between text-[11px]">
                          <span className="text-muted-foreground flex items-center gap-1">
                            <Eye className="h-3.5 w-3.5 text-accent" />
                            <strong className="text-foreground font-mono">{p.views ?? 0}</strong> مشاهدة
                          </span>
                          <Link
                            href={`/property/${p.id}`}
                            className="inline-flex items-center gap-0.5 text-accent font-semibold hover:underline"
                            target="_blank"
                          >
                            معاينة <ArrowUpRight className="h-3 w-3" />
                          </Link>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Box 4: Price Spectrum (5 cols) */}
          <Card className="card-luxury lg:col-span-5 flex flex-col justify-between overflow-hidden">
            <CardHeader className="pb-3 border-b border-border/40">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-base font-bold text-foreground flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-accent" />
                    توزيع النطاقات السعرية
                  </CardTitle>
                  <CardDescription className="text-xs text-muted-foreground mt-0.5">
                    توزيع المحفظة العقارية حسب الشرائح السعرية
                  </CardDescription>
                </div>
                <Badge variant="outline" className="border-accent/30 text-accent text-[11px]">
                  قيمة المحفظة
                </Badge>
              </div>
            </CardHeader>

            <CardContent className="pt-4 flex-1">
              <div className="space-y-4">
                {priceSpectrum.map((tier) => (
                  <div key={tier.id} className="space-y-1.5 group">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-foreground flex items-center gap-1.5">
                        {tier.label}
                      </span>
                      <span className="font-mono text-xs">
                        <strong className="text-foreground">{tier.count}</strong> عقار ({tier.percentage}%)
                      </span>
                    </div>

                    <div className="h-2 w-full bg-muted/40 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full bg-gradient-to-r ${tier.color} transition-all duration-500`}
                        style={{ width: `${Math.max(tier.percentage, 4)}%` }}
                      />
                    </div>

                    <div className="flex justify-between text-[10px] text-muted-foreground font-mono">
                      <span>إجمالي القيمة:</span>
                      <span>{formatNumber(tier.totalPrice)} ج.م</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Grid 3: Conversion Funnel + Market Matrix */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Box 5: Leads & Conversion Funnel (6 cols) */}
          <Card className="card-luxury lg:col-span-6 flex flex-col justify-between overflow-hidden">
            <CardHeader className="pb-3 border-b border-border/40">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-base font-bold text-foreground flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-accent" />
                    قمع تفاعل وتحويل العملاء
                  </CardTitle>
                  <CardDescription className="text-xs text-muted-foreground mt-0.5">
                    مراحل تفاعل الزوار الفعلية من التصفح وحتى طلبات الشراء والتشطيب
                  </CardDescription>
                </div>
                <Badge variant="secondary" className="text-[11px] font-semibold">
                  مسار العملاء
                </Badge>
              </div>
            </CardHeader>

            <CardContent className="pt-4 flex-1">
              <div className="space-y-3">
                {funnelSteps.map((step, idx) => (
                  <div
                    key={step.title}
                    className="p-3 rounded-xl border border-border/40 bg-background/50 relative overflow-hidden"
                  >
                    <div className="flex items-center justify-between gap-3 relative z-10">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="h-5 w-5 rounded-full bg-accent/15 text-accent text-[11px] font-bold flex items-center justify-center">
                            {idx + 1}
                          </span>
                          <span className="font-bold text-xs text-foreground">{step.title}</span>
                        </div>
                        <p className="text-[11px] text-muted-foreground mt-0.5 pr-7">{step.subtitle}</p>
                      </div>

                      <div className="text-left font-mono shrink-0">
                        <span className="text-base font-black text-foreground">
                          {step.value.toLocaleString("en-US")}
                        </span>
                        <span className="text-[10px] text-muted-foreground block">
                          نسبة التفاعل {step.pct}%
                        </span>
                      </div>
                    </div>

                    {/* Background indicator line */}
                    <div className="mt-2 h-1 w-full bg-muted/40 rounded-full overflow-hidden">
                      <div
                        className={`h-full ${step.color} rounded-full transition-all duration-500`}
                        style={{ width: `${Math.max(step.pct, 4)}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Box 6: Category & Market Status Matrix (6 cols) */}
          <Card className="card-luxury lg:col-span-6 flex flex-col justify-between overflow-hidden">
            <CardHeader className="pb-3 border-b border-border/40">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-base font-bold text-foreground flex items-center gap-2">
                    <Layers className="h-4 w-4 text-accent" />
                    توزيع فئات العرض وحالة السوق
                  </CardTitle>
                  <CardDescription className="text-xs text-muted-foreground mt-0.5">
                    توزيع الوحدات حسب نوع العرض، الفئة، والحالة التشغيلية الحالية
                  </CardDescription>
                </div>
                <Badge variant="outline" className="border-accent/30 text-accent text-[11px]">
                  حالة المحفظة
                </Badge>
              </div>
            </CardHeader>

            <CardContent className="pt-4 flex-1 space-y-4">
              {/* Listing Type Breakdown */}
              <div className="space-y-2">
                <span className="text-xs font-semibold text-muted-foreground block">
                  1. نوع العرض (للبيع / للإيجار / مفروش)
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {listingTypeData.map((lt) => (
                    <div
                      key={lt.key}
                      className="p-2.5 rounded-lg border border-border/40 bg-background/50 text-center"
                    >
                      <span className="text-xs font-bold text-foreground block">{lt.name}</span>
                      <span className="text-xs font-mono font-bold text-accent mt-0.5 block">
                        {lt.value} <span className="text-[10px] text-muted-foreground font-normal">({lt.percentage}%)</span>
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Category Breakdown */}
              <div className="space-y-2 pt-2 border-t border-border/30">
                <span className="text-xs font-semibold text-muted-foreground block">
                  2. التصنيف العقاري (سكني / تجاري / إداري / طبي)
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {categoryData.map((cat) => (
                    <div
                      key={cat.key}
                      className="p-2.5 rounded-lg border border-border/40 bg-background/50 text-center"
                    >
                      <span className="text-xs font-bold text-foreground block">{cat.name}</span>
                      <span className="text-xs font-mono font-bold text-accent mt-0.5 block">
                        {cat.value} <span className="text-[10px] text-muted-foreground font-normal">({cat.percentage}%)</span>
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Status Breakdown */}
              <div className="space-y-2 pt-2 border-t border-border/30">
                <span className="text-xs font-semibold text-muted-foreground block">
                  3. الحالة التشغيلية للعقارات
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {statusData.map((st) => (
                    <div
                      key={st.key}
                      className={`p-2.5 rounded-lg border text-center ${st.info.color}`}
                    >
                      <span className="text-xs font-bold block">{st.info.label}</span>
                      <span className="text-xs font-mono font-black mt-0.5 block">
                        {st.count} <span className="text-[10px] opacity-80 font-normal">({st.percentage}%)</span>
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
}
