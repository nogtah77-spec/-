import { useEffect, useMemo } from "react";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Building2, Eye, MapPin, Users, Radio, CalendarDays, CalendarRange, CalendarClock } from "lucide-react";
import { useData } from "@/context/DataContext";
import { RollingNumber } from "@/components/ui/RollingNumber";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";

const COLORS = ["#b08d57", "#1f2937", "#6366f1", "#10b981", "#f59e0b", "#ef4444", "#06b6d4", "#8b5cf6"];

const CATEGORY_LABELS: Record<string, string> = {
  sale: "للبيع",
  rent: "للإيجار",
  furnished: "مفروش",
  administrative: "إداري",
  medical: "طبي",
  commercial: "تجاري",
};

function ChartEmpty({ label }: { label: string }) {
  return (
    <div className="h-[300px] w-full flex items-center justify-center bg-muted/20 rounded-md border border-dashed">
      <p className="text-muted-foreground text-sm">{label}</p>
    </div>
  );
}

export default function Analytics() {
  const { properties, regions, propertyTypes, inquiries, finishingRequests, propertyRequests, visitorStats, refreshVisitorStats } = useData();

  useEffect(() => {
    refreshVisitorStats();
    const interval = setInterval(refreshVisitorStats, 12_000);
    return () => clearInterval(interval);
  }, [refreshVisitorStats]);

  const visitorCards = [
    { key: "online", title: "متواجدون الآن", value: visitorStats.online, icon: Radio, live: true },
    { key: "today", title: "زوار اليوم", value: visitorStats.today, icon: CalendarDays, live: false },
    { key: "week", title: "زوار آخر أسبوع", value: visitorStats.week, icon: CalendarRange, live: false },
    { key: "month", title: "زوار آخر شهر", value: visitorStats.month, icon: CalendarClock, live: false },
  ];

  const totalViews = useMemo(
    () => properties.reduce((sum, p) => sum + (p.views ?? 0), 0),
    [properties],
  );
  const activeProperties = properties.filter(
    (p) => p.status === "active" || p.status === "listed",
  ).length;
  const totalLeads = inquiries.length + finishingRequests.length + propertyRequests.length;

  const viewsByRegion = useMemo(() => {
    const map = new Map<string, number>();
    for (const p of properties) {
      map.set(p.regionId, (map.get(p.regionId) ?? 0) + (p.views ?? 0));
    }
    return regions
      .map((r) => ({ name: r.name, value: map.get(r.id) ?? 0 }))
      .filter((d) => d.value > 0)
      .sort((a, b) => b.value - a.value)
      .slice(0, 8);
  }, [properties, regions]);

  const typeDistribution = useMemo(() => {
    const map = new Map<string, number>();
    for (const p of properties) {
      map.set(p.typeId, (map.get(p.typeId) ?? 0) + 1);
    }
    return propertyTypes
      .map((t) => ({ name: t.name, value: map.get(t.id) ?? 0 }))
      .filter((d) => d.value > 0)
      .sort((a, b) => b.value - a.value);
  }, [properties, propertyTypes]);

  const categoryData = useMemo(() => {
    const map = new Map<string, number>();
    for (const p of properties) {
      map.set(p.category, (map.get(p.category) ?? 0) + 1);
    }
    return Array.from(map.entries())
      .map(([key, value]) => ({ name: CATEGORY_LABELS[key] ?? key, value }))
      .sort((a, b) => b.value - a.value);
  }, [properties]);

  const stats = [
    { title: "إجمالي العقارات", value: properties.length, icon: Building2 },
    { title: "إجمالي المشاهدات", value: totalViews, icon: Eye },
    { title: "عقارات نشطة", value: activeProperties, icon: MapPin },
    { title: "إجمالي العملاء المحتملين", value: totalLeads, icon: Users },
  ];

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">التحليلات والتقارير</h1>
          <p className="text-muted-foreground mt-1">إحصائيات تفصيلية لأداء العقارات والاهتمام بها</p>
        </div>

        <div className="space-y-3">
          <h2 className="text-lg font-semibold text-foreground">إحصائيات الزوار</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {visitorCards.map((c) => (
              <Card key={c.key} className="card-luxury relative overflow-hidden">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                    {c.live && (
                      <span className="relative flex h-2.5 w-2.5">
                        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-500 opacity-75" />
                        <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-green-500" />
                      </span>
                    )}
                    {c.title}
                  </CardTitle>
                  <div className="p-2 bg-background rounded-md shadow-sm">
                    <c.icon className={`h-5 w-5 ${c.live ? "text-green-600" : "text-accent"}`} />
                  </div>
                </CardHeader>
                <CardContent className="pt-4">
                  <div className="flex justify-center text-3xl font-bold text-foreground" dir="ltr">
                    <RollingNumber value={c.value} />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((s, i) => (
            <Card key={i} className="card-luxury relative overflow-hidden">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">{s.title}</CardTitle>
                <div className="p-2 bg-background rounded-md shadow-sm">
                  <s.icon className="h-5 w-5 text-accent" />
                </div>
              </CardHeader>
              <CardContent className="pt-4">
                <div className="text-3xl font-bold text-foreground text-center" dir="ltr">
                  {s.value.toLocaleString("en-US")}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>المشاهدات حسب المنطقة</CardTitle>
            </CardHeader>
            <CardContent>
              {viewsByRegion.length === 0 ? (
                <ChartEmpty label="لا توجد مشاهدات مسجّلة بعد" />
              ) : (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={viewsByRegion} margin={{ top: 8, right: 8, left: 8, bottom: 8 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="name" tick={{ fontSize: 12 }} interval={0} angle={-15} textAnchor="end" height={60} />
                    <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
                    <Tooltip
                      formatter={(v: number) => [v.toLocaleString("en-US"), "مشاهدات"]}
                      contentStyle={{ direction: "rtl", borderRadius: 8 }}
                    />
                    <Bar dataKey="value" fill="#b08d57" radius={[4, 4, 0, 0]} name="مشاهدات" />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>توزيع العقارات حسب النوع</CardTitle>
            </CardHeader>
            <CardContent>
              {typeDistribution.length === 0 ? (
                <ChartEmpty label="لا توجد بيانات متاحة" />
              ) : (
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={typeDistribution}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={100}
                      label={(e: { name: string; value: number }) => `${e.name}: ${e.value}`}
                    >
                      {typeDistribution.map((_, i) => (
                        <Cell key={i} fill={COLORS[i % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ direction: "rtl", borderRadius: 8 }} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>العقارات حسب الفئة</CardTitle>
          </CardHeader>
          <CardContent>
            {categoryData.length === 0 ? (
              <ChartEmpty label="لا توجد بيانات متاحة" />
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={categoryData} margin={{ top: 8, right: 8, left: 8, bottom: 8 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                  <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
                  <Tooltip
                    formatter={(v: number) => [v.toLocaleString("en-US"), "عقارات"]}
                    contentStyle={{ direction: "rtl", borderRadius: 8 }}
                  />
                  <Bar dataKey="value" fill="#6366f1" radius={[4, 4, 0, 0]} name="عقارات" />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
