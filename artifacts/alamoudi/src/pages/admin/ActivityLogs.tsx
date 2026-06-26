import { AdminLayout } from "@/components/layout/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { EmptyState } from "@/components/ui/EmptyState";
import { Download, Search, Activity } from "lucide-react";

export default function ActivityLogs() {
  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-foreground">سجلات النشاط</h1>
            <p className="text-muted-foreground mt-1">تتبع التغييرات والإجراءات المتخذة في النظام</p>
          </div>
          <Button variant="outline">
            <Download className="ml-2 h-4 w-4" />
            تصدير السجل
          </Button>
        </div>

        <div className="flex gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute right-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input placeholder="بحث في السجلات..." className="pr-9" />
          </div>
        </div>

        <div className="bg-card border rounded-lg p-6">
          <EmptyState 
            icon={<Activity className="h-8 w-8" />}
            title="لا توجد سجلات بعد"
            description="ستظهر جميع الأنشطة والتغييرات في النظام هنا."
            className="border-none bg-transparent py-12"
          />
        </div>
      </div>
    </AdminLayout>
  );
}
