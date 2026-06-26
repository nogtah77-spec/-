import { AdminLayout } from "@/components/layout/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Building2, Users, Heart, Scale } from "lucide-react";
import { EmptyState } from "@/components/ui/EmptyState";
import { Skeleton } from "@/components/ui/skeleton";
import { BarChart, Bar, LineChart, Line, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";

export default function Dashboard() {
  const kpis = [
    { title: "إجمالي العقارات", value: "0", icon: Building2, trend: "+0% من الشهر الماضي" },
    { title: "المستخدمين النشطين", value: "0", icon: Users, trend: "+0% من الشهر الماضي" },
    { title: "العقارات المفضلة", value: "0", icon: Heart, trend: "+0% من الشهر الماضي" },
    { title: "عمليات المقارنة", value: "0", icon: Scale, trend: "+0% من الشهر الماضي" },
  ];

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">لوحة التحكم</h1>
          <p className="text-muted-foreground mt-1">نظرة عامة على أداء المنصة</p>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {kpis.map((kpi, i) => (
            <Card key={i}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">{kpi.title}</CardTitle>
                <kpi.icon className="h-4 w-4 text-accent" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-foreground">{kpi.value}</div>
                <p className="text-xs text-muted-foreground mt-1">{kpi.trend}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Charts area */}
          <Card className="col-span-1">
            <CardHeader>
              <CardTitle>الزيارات والمشاهدات</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[300px] w-full flex items-center justify-center bg-muted/20 rounded-md border border-dashed">
                <div className="text-center text-muted-foreground">
                  <BarChart3 className="h-10 w-10 mx-auto mb-2 opacity-50" />
                  <p>لا توجد بيانات كافية للرسم البياني</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="col-span-1">
            <CardHeader>
              <CardTitle>أحدث النشاطات</CardTitle>
            </CardHeader>
            <CardContent>
              <EmptyState 
                icon={<Activity className="h-6 w-6" />}
                title="لا توجد نشاطات حديثة"
                description="لم يتم تسجيل أي نشاطات على المنصة حتى الآن."
                className="py-12 border-none bg-transparent"
              />
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
}

// Temporary imports for the mockup
import { BarChart3, Activity } from "lucide-react";
