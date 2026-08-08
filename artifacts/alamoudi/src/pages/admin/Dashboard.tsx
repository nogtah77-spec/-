import { AdminLayout } from "@/components/layout/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Building2, Users as UsersIcon, Heart, Clock, Activity, ArrowLeft, CalendarDays, Inbox } from "lucide-react";
import { EmptyState } from "@/components/ui/EmptyState";
import { useData } from "@/context/DataContext";
import { ActivityItem } from "@/components/admin/ActivityItem";
import { Link } from "wouter";

export default function Dashboard() {
  const { properties, regions, users, activityLogs, inquiries, propertyRequests, finishingRequests, aiLeads, propertyTypes } = useData();
  const recentActivity = activityLogs.slice(0, 6);
  const recentProperties = properties
    .filter((property) => {
      const createdAt = new Date(property.createdAt).getTime();
      return Number.isFinite(createdAt) && Date.now() - createdAt <= 7 * 24 * 60 * 60 * 1000;
    })
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 6);
  const newRequests = [
    ...inquiries,
    ...propertyRequests,
    ...finishingRequests,
    ...aiLeads,
  ].filter((request) => request.status === "new").length;
  
  const totalProperties = properties.length;
  const activeProperties = properties.filter(p => p.status === "active" || p.status === "listed").length;
  const totalRegions = regions.filter(r => r.active).length;
  const totalUsers = users.length;

  const kpis = [
    { title: "إجمالي العقارات المتاحة", value: totalProperties, icon: Building2 },
    { title: "المناطق النشطة", value: totalRegions, icon: Clock },
    { title: "المستخدمون", value: totalUsers, icon: UsersIcon },
    { title: "عقارات نشطة", value: activeProperties, icon: Heart },
  ];

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">لوحة التحكم</h1>
          <p className="text-muted-foreground mt-1">نظرة عامة على أداء المنصة</p>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {kpis.map((kpi, i) => (
            <Card key={i} className="card-luxury relative overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent z-0 pointer-events-none" />
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
                <CardTitle className="text-sm font-medium text-muted-foreground">{kpi.title}</CardTitle>
                <div className="p-2 bg-background rounded-md shadow-sm">
                  <kpi.icon className="h-5 w-5 text-accent" />
                </div>
              </CardHeader>
              <CardContent className="relative z-10 pt-4">
                <div className="text-3xl font-bold text-foreground text-center">{kpi.value}</div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1.15fr_.85fr]">
          <Card className="card-luxury">
            <CardHeader className="flex flex-row items-start justify-between gap-3">
              <div>
                <CardTitle>أضيفت خلال آخر 7 أيام</CardTitle>
                <p className="mt-1 text-xs text-muted-foreground">العقارات الجديدة التي تحتاج أن يعرف بها فريق العمل</p>
              </div>
              <Link href="/admin/properties" className="flex items-center gap-1 text-xs font-medium text-accent hover:underline">
                كل العقارات <ArrowLeft className="h-3.5 w-3.5" />
              </Link>
            </CardHeader>
            <CardContent>
              {recentProperties.length === 0 ? (
                <EmptyState
                  icon={<Building2 className="h-6 w-6" />}
                  title="لا توجد إضافات جديدة"
                  description="ستظهر هنا العقارات التي تمت إضافتها خلال آخر سبعة أيام."
                  className="border-none bg-transparent py-10"
                />
              ) : (
                <div className="divide-y divide-border/50">
                  {recentProperties.map((property) => {
                    const region = regions.find((item) => item.id === property.regionId)?.name;
                    const type = propertyTypes.find((item) => item.id === property.typeId)?.name;
                    return (
                      <Link key={property.id} href={`/admin/properties/${property.id}/edit`} className="flex items-center gap-3 py-3 transition-colors first:pt-0 last:pb-0 hover:bg-muted/30">
                        <div className="h-14 w-16 shrink-0 overflow-hidden rounded-lg bg-muted">
                          {property.images?.[0] ? <img src={property.images[0]} alt="" className="h-full w-full object-cover" /> : <div className="flex h-full items-center justify-center"><Building2 className="h-5 w-5 text-muted-foreground/50" /></div>}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-foreground">{property.code || "بدون كود"}</span>
                            <span className="truncate text-sm text-muted-foreground">{property.title}</span>
                          </div>
                          <p className="mt-1 truncate text-xs text-muted-foreground">{[region, type, property.price ? `${property.price.toLocaleString("ar-EG")} جنيه` : ""].filter(Boolean).join(" · ") || "تفاصيل العقار قيد الإضافة"}</p>
                        </div>
                        <div className="hidden shrink-0 items-center gap-1 text-[11px] text-muted-foreground sm:flex">
                          <CalendarDays className="h-3.5 w-3.5" />
                          {new Date(property.createdAt).toLocaleDateString("ar-EG", { day: "numeric", month: "short" })}
                        </div>
                      </Link>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="card-luxury">
            <CardHeader className="flex flex-row items-start justify-between gap-3">
              <div>
                <CardTitle>متابعة الطلبات</CardTitle>
                <p className="mt-1 text-xs text-muted-foreground">طلبات جديدة تنتظر متابعة فريق العمل</p>
              </div>
              <Inbox className="h-5 w-5 text-accent" />
            </CardHeader>
            <CardContent>
              <div className="flex items-end justify-between gap-4 rounded-xl bg-accent/10 p-4">
                <div>
                  <p className="text-xs text-muted-foreground">طلبات جديدة الآن</p>
                  <p className="mt-1 text-3xl font-bold text-foreground">{newRequests}</p>
                </div>
                <Link href="/admin/requests" className="flex items-center gap-1 text-sm font-medium text-accent hover:underline">
                  فتح المركز <ArrowLeft className="h-4 w-4" />
                </Link>
              </div>
              <div className="mt-4 grid grid-cols-2 gap-2 text-center text-xs">
                <div className="rounded-lg border border-border p-3">
                  <p className="text-muted-foreground">إضافات جديدة</p>
                  <p className="mt-1 text-lg font-bold text-foreground">{recentProperties.length}</p>
                </div>
                <div className="rounded-lg border border-border p-3">
                  <p className="text-muted-foreground">آخر نشاط</p>
                  <p className="mt-1 text-lg font-bold text-foreground">{activityLogs.length ? "متاح" : "—"}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 gap-6">
          <Card className="card-luxury">
            <CardHeader>
              <CardTitle>أحدث النشاطات</CardTitle>
            </CardHeader>
            <CardContent>
              {recentActivity.length === 0 ? (
                <EmptyState 
                  icon={<Activity className="h-6 w-6" />}
                  title="لا توجد نشاطات حديثة"
                  description="لم يتم تسجيل أي نشاطات على المنصة حتى الآن."
                  className="py-16 border-none bg-transparent"
                />
              ) : (
                <div className="divide-y divide-border/50">
                  {recentActivity.map((log) => (
                    <ActivityItem key={log.id} log={log} />
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
}
