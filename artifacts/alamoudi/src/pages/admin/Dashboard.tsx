import { AdminLayout } from "@/components/layout/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Building2, Users as UsersIcon, Heart, Clock, Activity } from "lucide-react";
import { EmptyState } from "@/components/ui/EmptyState";
import { useData } from "@/context/DataContext";
import { ActivityItem } from "@/components/admin/ActivityItem";

export default function Dashboard() {
  const { properties, regions, users, activityLogs } = useData();
  const recentActivity = activityLogs.slice(0, 6);
  
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
