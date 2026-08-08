import { AdminLayout } from "@/components/layout/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Building2, Users as UsersIcon, Heart, Clock, Activity, ArrowLeft, Inbox } from "lucide-react";
import { EmptyState } from "@/components/ui/EmptyState";
import { useData } from "@/context/DataContext";
import { ActivityItem } from "@/components/admin/ActivityItem";
import { Link } from "wouter";
import { RecentPropertiesPanel } from "@/components/admin/RecentPropertiesPanel";

export default function Dashboard() {
  const { properties, regions, users, activityLogs, customerPropertyRequests, propertyTypes } = useData();
  const recentActivity = activityLogs.slice(0, 6);
  const recentPropertyCount = properties.filter((property) => {
    const createdAt = new Date(property.createdAt).getTime();
    return Number.isFinite(createdAt) && Date.now() - createdAt <= 7 * 24 * 60 * 60 * 1000;
  }).length;
  const newRequests = customerPropertyRequests.filter((request) => request.status === "new").length;
  
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
          <RecentPropertiesPanel properties={properties} regions={regions} propertyTypes={propertyTypes} compact />

          <Card className="card-luxury">
            <CardHeader className="flex flex-row items-start justify-between gap-3">
              <div>
                <CardTitle>الطلبات العقارية للعملاء</CardTitle>
                <p className="mt-1 text-xs text-muted-foreground">احتياجات عقارية جديدة تنتظر متابعة فريق العمل</p>
              </div>
              <Inbox className="h-5 w-5 text-accent" />
            </CardHeader>
            <CardContent>
              <div className="flex items-end justify-between gap-4 rounded-xl bg-accent/10 p-4">
                <div>
                  <p className="text-xs text-muted-foreground">طلبات عقارية جديدة الآن</p>
                  <p className="mt-1 text-3xl font-bold text-foreground">{newRequests}</p>
                </div>
                <Link href="/admin/requests" className="flex items-center gap-1 text-sm font-medium text-accent hover:underline">
                  فتح السجل <ArrowLeft className="h-4 w-4" />
                </Link>
              </div>
              <div className="mt-4 grid grid-cols-2 gap-2 text-center text-xs">
                <div className="rounded-lg border border-border p-3">
                  <p className="text-muted-foreground">إضافات جديدة</p>
                  <p className="mt-1 text-lg font-bold text-foreground">{recentPropertyCount}</p>
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
