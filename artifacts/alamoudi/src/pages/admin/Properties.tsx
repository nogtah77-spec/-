import { useState } from "react";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Search, Plus, Pencil, Trash2, Home as HomeIcon } from "lucide-react";
import { Link } from "wouter";
import { useData, Property, PropertyStatus } from "@/context/DataContext";
import { useToast } from "@/hooks/use-toast";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { EmptyState } from "@/components/ui/EmptyState";

const statusLabels: Record<PropertyStatus, string> = {
  active: "نشط",
  listed: "معروض",
  draft: "مسودة",
  sold: "مباعة",
  rented: "مؤجر",
  reserved: "محجوز",
};

const statusColors: Record<PropertyStatus, string> = {
  active: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
  listed: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
  draft: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200",
  sold: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
  rented: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200",
  reserved: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
};

export default function Properties() {
  const { properties, regions, propertyTypes, deleteProperty, updateProperty } = useData();
  const [search, setSearch] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<Property | null>(null);
  const { toast } = useToast();

  const handleDelete = () => {
    if (!deleteTarget) return;
    deleteProperty(deleteTarget.id);
    setDeleteTarget(null);
    toast({ title: "تم بنجاح", description: "تم حذف العقار بنجاح" });
  };

  const handleStatusChange = (id: string, status: PropertyStatus) => {
    updateProperty(id, { status });
    toast({ title: "تم بنجاح", description: "تم تحديث حالة العقار" });
  };

  const filteredProperties = properties.filter((p) => {
    if (!search) return true;
    const term = search.toLowerCase();
    const typeName = propertyTypes.find(t => t.id === p.typeId)?.name || "";
    const regionName = regions.find(r => r.id === p.regionId)?.name || "";
    return (
      p.code.toLowerCase().includes(term) ||
      p.title.toLowerCase().includes(term) ||
      (p.description || "").toLowerCase().includes(term) ||
      (p.location || "").toLowerCase().includes(term) ||
      (p.subArea || "").toLowerCase().includes(term) ||
      typeName.toLowerCase().includes(term) ||
      regionName.toLowerCase().includes(term)
    );
  });

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
          <div className="relative flex-1 max-w-md">
            <Search className="absolute right-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="بحث بالعنوان، المنطقة، أو النوع..." 
              className="pr-9"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        <div className="border rounded-md bg-card overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>الكود</TableHead>
                <TableHead>النوع</TableHead>
                <TableHead>المنطقة</TableHead>
                <TableHead>السعر</TableHead>
                <TableHead>الحالة</TableHead>
                <TableHead className="text-left">الإجراءات</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredProperties.map((property) => (
                <TableRow key={property.id}>
                  <TableCell>
                    <span className="font-mono text-xs font-semibold text-accent bg-accent/10 border border-accent/25 px-2 py-0.5 rounded tracking-wide whitespace-nowrap">{property.code}</span>
                  </TableCell>
                  <TableCell>{propertyTypes.find(t => t.id === property.typeId)?.name}</TableCell>
                  <TableCell>{regions.find(r => r.id === property.regionId)?.name}</TableCell>
                  <TableCell>{property.price.toLocaleString("en-US")} EGP</TableCell>
                  <TableCell>
                    <Select 
                      value={property.status} 
                      onValueChange={(val) => handleStatusChange(property.id, val as PropertyStatus)}
                    >
                      <SelectTrigger className={`w-[120px] h-8 text-xs ${statusColors[property.status]} border-none font-semibold`}>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(statusLabels).map(([key, label]) => (
                          <SelectItem key={key} value={key}>{label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button variant="ghost" size="icon" asChild>
                        <Link href={`/admin/properties/${property.id}/edit`}>
                          <Pencil className="h-4 w-4" />
                        </Link>
                      </Button>
                      <Button variant="ghost" size="icon" className="text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950" onClick={() => setDeleteTarget(property)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {filteredProperties.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="p-0">
                    <EmptyState 
                      icon={<HomeIcon className="h-8 w-8" />}
                      title="لا توجد عقارات"
                      description="لم يتم العثور على أي عقارات مسجلة."
                      className="border-none py-12 rounded-none"
                    />
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>هل أنت متأكد من الحذف؟</AlertDialogTitle>
            <AlertDialogDescription>
              هذا الإجراء لا يمكن التراجع عنه. سيتم حذف العقار نهائياً.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>إلغاء</AlertDialogCancel>
            <AlertDialogAction className="bg-red-500 hover:bg-red-600 text-white" onClick={handleDelete}>حذف</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AdminLayout>
  );
}
