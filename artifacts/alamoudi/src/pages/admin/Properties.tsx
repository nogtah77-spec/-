import { useState } from "react";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Search, Plus, Pencil, Trash2, Home as HomeIcon } from "lucide-react";
import { Link } from "wouter";
import { useData, Property, PropertyStatus } from "@/context/DataContext";
import { useToast } from "@/hooks/use-toast";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
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
  const { properties, regions, propertyTypes, deleteProperty, updateProperty, bulkDeleteProperties, bulkUpdateProperties } = useData();
  const [search, setSearch] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<Property | null>(null);
  const [showBulkDeleteDialog, setShowBulkDeleteDialog] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [bulkStatus, setBulkStatus] = useState<PropertyStatus | "">("");
  const { toast } = useToast();

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

  const allSelected = filteredProperties.length > 0 && filteredProperties.every(p => selectedIds.has(p.id));
  const someSelected = filteredProperties.some(p => selectedIds.has(p.id));

  const toggleSelectAll = () => {
    if (allSelected) {
      setSelectedIds(prev => {
        const next = new Set(prev);
        filteredProperties.forEach(p => next.delete(p.id));
        return next;
      });
    } else {
      setSelectedIds(prev => {
        const next = new Set(prev);
        filteredProperties.forEach(p => next.add(p.id));
        return next;
      });
    }
  };

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const clearSelection = () => setSelectedIds(new Set());

  const handleDelete = () => {
    if (!deleteTarget) return;
    deleteProperty(deleteTarget.id);
    setSelectedIds(prev => { const n = new Set(prev); n.delete(deleteTarget.id); return n; });
    setDeleteTarget(null);
    toast({ title: "تم بنجاح", description: "تم حذف العقار بنجاح" });
  };

  const handleStatusChange = (id: string, status: PropertyStatus) => {
    updateProperty(id, { status });
    toast({ title: "تم بنجاح", description: "تم تحديث حالة العقار" });
  };

  const handleBulkDelete = () => {
    const ids = Array.from(selectedIds);
    bulkDeleteProperties(ids);
    clearSelection();
    setShowBulkDeleteDialog(false);
    toast({ title: "تم الحذف", description: `تم حذف ${ids.length} عقار بنجاح` });
  };

  const handleBulkStatusChange = () => {
    if (!bulkStatus) return;
    const ids = Array.from(selectedIds);
    bulkUpdateProperties(ids, { status: bulkStatus as PropertyStatus });
    clearSelection();
    setBulkStatus("");
    toast({ title: "تم التحديث", description: `تم تغيير حالة ${ids.length} عقار إلى "${statusLabels[bulkStatus as PropertyStatus]}"` });
  };

  const selectedCount = selectedIds.size;

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
              placeholder="بحث بالعنوان، الكود، المنطقة، أو النوع..."
              className="pr-9"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        {/* Bulk Action Bar */}
        {selectedCount > 0 && (
          <div className="flex flex-wrap items-center gap-3 bg-accent/10 border border-accent/30 rounded-lg px-4 py-3">
            <span className="text-sm font-semibold text-accent">
              تم تحديد {selectedCount} عقار
            </span>
            <div className="flex items-center gap-2 mr-auto flex-wrap">
              <Select value={bulkStatus} onValueChange={(v) => setBulkStatus(v as PropertyStatus)}>
                <SelectTrigger className="w-[140px] h-8 text-xs">
                  <SelectValue placeholder="تغيير الحالة إلى..." />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(statusLabels).map(([key, label]) => (
                    <SelectItem key={key} value={key}>{label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button
                size="sm"
                variant="outline"
                className="h-8 text-xs"
                disabled={!bulkStatus}
                onClick={handleBulkStatusChange}
              >
                تطبيق
              </Button>
              <Button
                size="sm"
                variant="destructive"
                className="h-8 text-xs"
                onClick={() => setShowBulkDeleteDialog(true)}
              >
                <Trash2 className="h-3 w-3 ml-1" />
                حذف المحددة
              </Button>
              <Button
                size="sm"
                variant="ghost"
                className="h-8 text-xs text-muted-foreground"
                onClick={clearSelection}
              >
                إلغاء التحديد
              </Button>
            </div>
          </div>
        )}

        <div className="border rounded-md bg-card overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-10 pr-4">
                  <Checkbox
                    checked={allSelected}
                    onCheckedChange={toggleSelectAll}
                    aria-label="تحديد الكل"
                    className={someSelected && !allSelected ? "opacity-50" : ""}
                  />
                </TableHead>
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
                <TableRow
                  key={property.id}
                  className={selectedIds.has(property.id) ? "bg-accent/5" : ""}
                >
                  <TableCell className="pr-4">
                    <Checkbox
                      checked={selectedIds.has(property.id)}
                      onCheckedChange={() => toggleSelect(property.id)}
                      aria-label={`تحديد ${property.code}`}
                    />
                  </TableCell>
                  <TableCell>
                    <span className="font-mono text-xs font-semibold text-accent bg-accent/10 border border-accent/25 px-2 py-0.5 rounded tracking-wide whitespace-nowrap">
                      {property.code}
                    </span>
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
                      <Button
                        variant="ghost" size="icon"
                        className="text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950"
                        onClick={() => setDeleteTarget(property)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {filteredProperties.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} className="p-0">
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

        {filteredProperties.length > 0 && (
          <p className="text-xs text-muted-foreground text-center">
            {filteredProperties.length} عقار{selectedCount > 0 ? ` — محدد ${selectedCount}` : ""}
          </p>
        )}
      </div>

      {/* Single Delete Dialog */}
      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>هل أنت متأكد من الحذف؟</AlertDialogTitle>
            <AlertDialogDescription>
              سيتم حذف العقار <strong>{deleteTarget?.code}</strong> نهائياً ولا يمكن التراجع.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>إلغاء</AlertDialogCancel>
            <AlertDialogAction className="bg-red-500 hover:bg-red-600 text-white" onClick={handleDelete}>حذف</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Bulk Delete Dialog */}
      <AlertDialog open={showBulkDeleteDialog} onOpenChange={setShowBulkDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>حذف {selectedCount} عقار؟</AlertDialogTitle>
            <AlertDialogDescription>
              سيتم حذف {selectedCount} عقار نهائياً. هذا الإجراء لا يمكن التراجع عنه.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>إلغاء</AlertDialogCancel>
            <AlertDialogAction className="bg-red-500 hover:bg-red-600 text-white" onClick={handleBulkDelete}>
              حذف الكل
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AdminLayout>
  );
}
