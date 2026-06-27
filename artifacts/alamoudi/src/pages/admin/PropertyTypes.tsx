import { AdminLayout } from "@/components/layout/AdminLayout";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus } from "lucide-react";

export default function PropertyTypes() {
  const propertyTypes = [
    "شقة",
    "دوبلكس",
    "بنتهاوس",
    "فيلا",
    "تاون هاوس",
    "توين هاوس",
    "استوديو",
    "محل",
    "مكتب إداري",
    "عيادة",
    "مركز طبي",
    "مطعم",
    "كافيه",
    "أرض"
  ];

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-foreground">أنواع العقارات</h1>
            <p className="text-muted-foreground mt-1">إدارة تصنيفات وأنواع العقارات المتاحة</p>
          </div>
          <Button className="bg-accent text-accent-foreground hover:bg-accent/90">
            <Plus className="ml-2 h-4 w-4" />
            إضافة نوع
          </Button>
        </div>

        <div className="border rounded-md bg-card overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>اسم النوع</TableHead>
                <TableHead>عدد العقارات</TableHead>
                <TableHead>الحالة</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {propertyTypes.map((type, i) => (
                <TableRow key={i}>
                  <TableCell className="font-medium">{type}</TableCell>
                  <TableCell className="text-muted-foreground">—</TableCell>
                  <TableCell><span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold bg-primary/10 text-primary">نشط</span></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </AdminLayout>
  );
}
