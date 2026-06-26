import { AdminLayout } from "@/components/layout/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Search, Users as UsersIcon } from "lucide-react";
import { EmptyState } from "@/components/ui/EmptyState";

export default function Users() {
  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">إدارة المستخدمين</h1>
            <p className="text-muted-foreground mt-1">عرض وإدارة حسابات المستخدمين وصلاحياتهم</p>
          </div>
          <Button className="bg-accent text-accent-foreground hover:bg-accent/90">
            <Plus className="ml-2 h-4 w-4" />
            مستخدم جديد
          </Button>
        </div>

        <div className="relative max-w-md">
          <Search className="absolute right-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input placeholder="بحث بالاسم أو البريد الإلكتروني..." className="pr-9" />
        </div>

        <div className="border rounded-md bg-card overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>المستخدم</TableHead>
                <TableHead>البريد الإلكتروني</TableHead>
                <TableHead>الدور</TableHead>
                <TableHead>تاريخ الانضمام</TableHead>
                <TableHead>الحالة</TableHead>
                <TableHead className="text-left">الإجراءات</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell colSpan={6} className="p-0">
                  <EmptyState 
                    icon={<UsersIcon className="h-8 w-8" />}
                    title="لا يوجد مستخدمين"
                    description="لم يتم العثور على أي مستخدمين مسجلين في المنصة."
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
