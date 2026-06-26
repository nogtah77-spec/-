import { AdminLayout } from "@/components/layout/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar } from "lucide-react";
import { BarChart3 } from "lucide-react";

export default function Analytics() {
  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">التحليلات والتقارير</h1>
            <p className="text-muted-foreground mt-1">إحصائيات تفصيلية لأداء العقارات والمبيعات</p>
          </div>
          <Button variant="outline">
            <Calendar className="ml-2 h-4 w-4" />
            آخر 30 يوماً
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="col-span-1">
            <CardHeader>
              <CardTitle>المشاهدات حسب المنطقة</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[300px] w-full flex items-center justify-center bg-muted/20 rounded-md border border-dashed">
                <div className="text-center text-muted-foreground">
                  <BarChart3 className="h-10 w-10 mx-auto mb-2 opacity-50" />
                  <p>البيانات قيد التجميع</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="col-span-1">
            <CardHeader>
              <CardTitle>توزيع العقارات (أنواع)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[300px] w-full flex items-center justify-center bg-muted/20 rounded-md border border-dashed">
                <div className="text-center text-muted-foreground">
                  <div className="h-24 w-24 rounded-full border-4 border-dashed border-muted-foreground/30 mx-auto mb-4" />
                  <p>لا توجد بيانات متاحة</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
}
