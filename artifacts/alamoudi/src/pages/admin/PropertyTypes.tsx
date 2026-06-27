import { useState } from "react";
import { useData, PropertyType } from "@/context/DataContext";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Pencil, Trash2, Eye, EyeOff, Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function PropertyTypes() {
  const { propertyTypes, addPropertyType, updatePropertyType, deletePropertyType, togglePropertyType } = useData();
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [editTarget, setEditTarget] = useState<PropertyType | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<PropertyType | null>(null);
  const [newName, setNewName] = useState("");
  const { toast } = useToast();

  const handleAdd = () => {
    if (!newName.trim()) return;
    addPropertyType(newName.trim());
    setNewName("");
    setShowAddDialog(false);
    toast({ title: "تم بنجاح", description: "تمت العملية بنجاح" });
  };

  const handleEdit = () => {
    if (!editTarget || !newName.trim()) return;
    updatePropertyType(editTarget.id, newName.trim());
    setEditTarget(null);
    setNewName("");
    toast({ title: "تم بنجاح", description: "تمت العملية بنجاح" });
  };

  const handleDelete = () => {
    if (!deleteTarget) return;
    deletePropertyType(deleteTarget.id);
    setDeleteTarget(null);
    toast({ title: "تم بنجاح", description: "تمت العملية بنجاح" });
  };

  const handleToggle = (id: string) => {
    togglePropertyType(id);
    toast({ title: "تم بنجاح", description: "تمت العملية بنجاح" });
  };

  const openEdit = (t: PropertyType) => {
    setEditTarget(t);
    setNewName(t.name);
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-foreground">أنواع العقارات</h1>
            <p className="text-muted-foreground mt-1">إدارة تصنيفات وأنواع العقارات المتاحة</p>
          </div>
          <Button className="bg-accent text-accent-foreground hover:bg-accent/90" onClick={() => { setNewName(""); setShowAddDialog(true); }}>
            <Plus className="ml-2 h-4 w-4" />
            إضافة نوع
          </Button>
        </div>

        <div className="border rounded-md bg-card overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>اسم النوع</TableHead>
                <TableHead>حالة التفعيل</TableHead>
                <TableHead>الإجراءات</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {propertyTypes.map((type) => (
                <TableRow key={type.id}>
                  <TableCell className="font-medium">{type.name}</TableCell>
                  <TableCell>
                    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${type.active ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200" : "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200"}`}>
                      {type.active ? "نشط" : "غير نشط"}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button variant="ghost" size="icon" onClick={() => openEdit(type)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleToggle(type.id)}>
                        {type.active ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                      <Button variant="ghost" size="icon" className="text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950" onClick={() => setDeleteTarget(type)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {propertyTypes.length === 0 && (
                <TableRow>
                  <TableCell colSpan={3} className="text-center py-8 text-muted-foreground">لا توجد أنواع مضافة بعد.</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Add Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>إضافة نوع جديد</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>اسم النوع</Label>
              <Input value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="مثال: شقة" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddDialog(false)}>إلغاء</Button>
            <Button onClick={handleAdd}>حفظ</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={!!editTarget} onOpenChange={(open) => !open && setEditTarget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>تعديل النوع</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>اسم النوع</Label>
              <Input value={newName} onChange={(e) => setNewName(e.target.value)} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditTarget(null)}>إلغاء</Button>
            <Button onClick={handleEdit}>حفظ</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>هل أنت متأكد من الحذف؟</AlertDialogTitle>
            <AlertDialogDescription>
              هذا الإجراء لا يمكن التراجع عنه. سيتم حذف النوع نهائياً.
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
