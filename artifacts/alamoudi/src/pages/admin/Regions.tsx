import { ChangeEvent, useRef, useState } from "react";
import { useData, Region } from "@/context/DataContext";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Pencil, Trash2, Eye, EyeOff, Plus, Image as ImageIcon, Upload, X, MapPin } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";

export default function Regions() {
  const { regions, addRegion, updateRegion, deleteRegion, toggleRegion } = useData();
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [editTarget, setEditTarget] = useState<Region | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Region | null>(null);
  const [newName, setNewName] = useState("");
  const [heroImage, setHeroImage] = useState("");
  const [saving, setSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleAdd = async () => {
    if (!newName.trim()) return;
    setSaving(true);
    try {
      const saved = await addRegion(newName.trim(), heroImage.trim());
      if (!saved) return;
      setNewName("");
      setHeroImage("");
      setShowAddDialog(false);
      toast({ title: "تم بنجاح", description: "تمت العملية بنجاح" });
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = async () => {
    if (!editTarget || !newName.trim()) return;
    setSaving(true);
    try {
      const saved = await updateRegion(editTarget.id, newName.trim(), heroImage.trim());
      if (!saved) return;
      setEditTarget(null);
      setNewName("");
      setHeroImage("");
      toast({ title: "تم بنجاح", description: "تمت العملية بنجاح" });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    const deleted = await deleteRegion(deleteTarget.id);
    if (!deleted) return;
    setDeleteTarget(null);
    toast({ title: "تم بنجاح", description: "تمت العملية بنجاح" });
  };

  const handleToggle = async (id: string) => {
    const toggled = await toggleRegion(id);
    if (!toggled) return;
    toast({ title: "تم بنجاح", description: "تمت العملية بنجاح" });
  };

  const openEdit = (r: Region) => {
    setEditTarget(r);
    setNewName(r.name);
    setHeroImage(r.heroImage ?? "");
  };

  const handleHeroFile = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast({ title: "ملف غير صالح", description: "اختر ملف صورة فقط.", variant: "destructive" });
      return;
    }
    if (file.size > 4 * 1024 * 1024) {
      toast({ title: "الصورة كبيرة جدًا", description: "يجب ألا يتجاوز حجم الصورة 4 ميجابايت.", variant: "destructive" });
      return;
    }
    const reader = new FileReader();
    reader.onload = () => setHeroImage(String(reader.result ?? ""));
    reader.onerror = () => toast({ title: "تعذر قراءة الصورة", description: "حاول اختيار الصورة مرة أخرى.", variant: "destructive" });
    reader.readAsDataURL(file);
  };

  const clearHeroImage = () => setHeroImage("");

  const removeSavedHeroImage = () => {
    setHeroImage("");
    toast({
      title: "تمت إزالة الصورة من التعديل",
      description: "اضغط «حفظ» لتأكيد حذف صورة الغلاف من المنطقة.",
    });
  };

  const renderHeroEditor = () => (
    <div className="space-y-3">
      <Label>صورة غلاف المدينة</Label>
      {heroImage ? (
        <div className="relative h-32 overflow-hidden rounded-lg border bg-muted">
          <img src={heroImage} alt="معاينة غلاف المدينة" className="h-full w-full object-cover" />
          <Button
            type="button"
            size="icon"
            variant="destructive"
            className="absolute left-2 top-2 h-8 w-8"
            onClick={clearHeroImage}
            aria-label="إزالة صورة الغلاف"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      ) : (
        <div className="flex h-24 items-center justify-center rounded-lg border border-dashed bg-muted/40 text-xs text-muted-foreground">
          لا توجد صورة غلاف
        </div>
      )}
      <input ref={fileInputRef} type="file" accept="image/png,image/jpeg,image/webp" onChange={handleHeroFile} className="hidden" />
      <Button type="button" variant="outline" className="w-full gap-2" onClick={() => fileInputRef.current?.click()}>
        <Upload className="h-4 w-4" />
        {heroImage.startsWith("data:") ? "تغيير الصورة المرفوعة" : "رفع صورة من الجهاز"}
      </Button>
      {editTarget && heroImage && (
        <Button
          type="button"
          variant="outline"
          className="w-full gap-2 border-destructive/40 text-destructive hover:bg-destructive/10"
          onClick={removeSavedHeroImage}
        >
          <Trash2 className="h-4 w-4" />
          حذف صورة الغلاف الحالية
        </Button>
      )}
      <p className="text-[11px] text-muted-foreground">PNG أو JPG أو WEBP — بحد أقصى 4 ميجابايت.</p>
      <div className="space-y-2">
        <Label htmlFor="regionHeroUrl">أو رابط صورة الغلاف</Label>
        <Input
          id="regionHeroUrl"
          value={heroImage.startsWith("data:") ? "" : heroImage}
          onChange={(event) => setHeroImage(event.target.value)}
          placeholder="/city-heroes/city.jpg أو https://..."
          dir="ltr"
        />
      </div>
    </div>
  );

  return (
    <AdminLayout>
      <div className="space-y-6">
        <AdminPageHeader
          title="إدارة المناطق"
          subtitle="تحديد وإدارة المناطق والمدن التي تغطيها المنصة"
          eyebrow="نطاق التغطية"
          icon={MapPin}
          actions={
            <Button className="h-10 gap-2 bg-[#B4986B] text-[#10202D] hover:bg-[#C5A978]" onClick={() => { setNewName(""); setShowAddDialog(true); }}>
              <Plus className="h-4 w-4" />
              إضافة منطقة
            </Button>
          }
        />

        <div className="border rounded-md bg-card overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>اسم المنطقة</TableHead>
              <TableHead>صورة الغلاف</TableHead>
              <TableHead>حالة التفعيل</TableHead>
                <TableHead>الإجراءات</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {regions.map((region) => (
                <TableRow key={region.id}>
                  <TableCell className="font-medium">{region.name}</TableCell>
                  <TableCell>
                    {region.heroImage ? (
                      <img src={region.heroImage} alt="" className="h-10 w-16 rounded-md object-cover border" />
                    ) : (
                      <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                        <ImageIcon className="h-3.5 w-3.5" /> افتراضية
                      </span>
                    )}
                  </TableCell>
                  <TableCell>
                    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${region.active ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200" : "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200"}`}>
                      {region.active ? "نشط" : "غير نشط"}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button variant="ghost" size="icon" onClick={() => openEdit(region)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleToggle(region.id)}>
                        {region.active ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                      <Button variant="ghost" size="icon" className="text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950" onClick={() => setDeleteTarget(region)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {regions.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">لا توجد مناطق مضافة بعد.</TableCell>
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
            <DialogTitle>إضافة منطقة جديدة</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>اسم المنطقة</Label>
              <Input value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="مثال: التجمع الخامس" />
            </div>
            {renderHeroEditor()}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddDialog(false)}>إلغاء</Button>
             <Button onClick={handleAdd} disabled={saving}>{saving ? "جارٍ الحفظ..." : "حفظ"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={!!editTarget} onOpenChange={(open) => !open && setEditTarget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>تعديل المنطقة</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>اسم المنطقة</Label>
              <Input value={newName} onChange={(e) => setNewName(e.target.value)} />
            </div>
            {renderHeroEditor()}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditTarget(null)}>إلغاء</Button>
             <Button onClick={handleEdit} disabled={saving}>{saving ? "جارٍ الحفظ..." : "حفظ"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>هل أنت متأكد من الحذف؟</AlertDialogTitle>
            <AlertDialogDescription>
              هذا الإجراء لا يمكن التراجع عنه. سيتم حذف المنطقة نهائياً.
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
