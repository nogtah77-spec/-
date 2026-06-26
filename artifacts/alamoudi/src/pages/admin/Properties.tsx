import { AdminLayout } from "@/components/layout/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Search, Plus, Filter } from "lucide-react";
import { Link } from "wouter";

export default function Properties() {
  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">إدارة العقارات</h1>
            <p className="text-muted-foreground mt-1">عرض وإدارة جميع العقارات في المنصة</p>
          </div>
          <Button asChild className="bg-accent text-accent-foreground hover:bg-accent/90">
            <Link href="/admin/properties/new">
              <Plus className="ml-2 h-4 w-4" />
              إضافة عقار جديد
            </Link>
          </Button>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute right-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input placeholder="بحث بالعنوان، المنطقة..." className="pr-9" />
          </div>
          <Button variant="outline" className="sm:w-auto">
            <Filter className="ml-2 h-4 w-4" />
            تصفية
          </Button>
        </div>

        <div className="border rounded-md bg-card overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[80px]">الصورة</TableHead>
                <TableHead>العنوان</TableHead>
                <TableHead>النوع</TableHead>
                <TableHead>المنطقة</TableHead>
                <TableHead>السعر</TableHead>
                <TableHead>الحالة</TableHead>
                <TableHead className="text-left">الإجراءات</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell colSpan={7} className="h-32 text-center text-muted-foreground">
                  لا توجد عقارات مضافة بعد. انقر على "إضافة عقار جديد" للبدء.
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>
      </div>
    </AdminLayout>
  );
}
