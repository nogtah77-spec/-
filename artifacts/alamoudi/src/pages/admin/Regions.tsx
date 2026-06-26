import { AdminLayout } from "@/components/layout/AdminLayout";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus } from "lucide-react";
import { EmptyState } from "@/components/ui/EmptyState";
import { MapPin } from "lucide-react";

export default function Regions() {
  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-foreground">إدارة المناطق</h1>
            <p className="text-muted-foreground mt-1">تحديد وإدارة المناطق والمدن التي تغطيها المنصة</p>
          </div>
          <Button className="bg-accent text-accent-foreground hover:bg-accent/90">
            <Plus className="ml-2 h-4 w-4" />
            إضافة منطقة
          </Button>
        </div>

        <div className="border rounded-md bg-card overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>اسم المنطقة</TableHead>
                <TableHead>المدينة</TableHead>
                <TableHead>عدد العقارات</TableHead>
                <TableHead>الحالة</TableHead>
                <TableHead className="text-left">الإجراءات</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell colSpan={5} className="p-0">
                  <EmptyState 
                    icon={<MapPin className="h-8 w-8" />}
                    title="لا توجد مناطق مضافة"
                    description="لم يتم إضافة أي مناطق حتى الآن. انقر على إضافة منطقة للبدء."
                    className="border-none py-12 rounded-none"
                  />
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>
      </div>
    </AdminLayout>
  );
}
