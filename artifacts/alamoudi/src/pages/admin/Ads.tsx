import { useState, ChangeEvent, useRef } from "react";
import { useData } from "@/context/DataContext";
import type { Ad } from "@/context/DataContext";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Pencil, Trash2, Plus, Image as ImageIcon, ExternalLink, GripVertical, Eye, EyeOff } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

const EMPTY_AD: Omit<Ad, "id"> = {
  imageUrl: "",
  linkUrl: "",
  title: "",
  order: 0,
  startDate: "",
  endDate: "",
  active: true,
};

function AdForm({
  value,
  onChange,
  onImageFile,
  imageRef,
}: {
  value: Omit<Ad, "id">;
  onChange: (patch: Partial<Omit<Ad, "id">>) => void;
  onImageFile: (file: File) => void;
  imageRef: React.RefObject<HTMLInputElement | null>;
}) {
  return (
    <div className="space-y-4">
      {/* Image */}
      <div className="space-y-1.5">
        <Label>صورة الإعلان <span className="text-destructive">*</span></Label>
        <div className="flex gap-2">
          <Input
            placeholder="https://..."
            value={value.imageUrl}
            onChange={e => onChange({ imageUrl: e.target.value })}
            className="flex-1"
          />
          <Button
            type="button"
            variant="outline"
            size="icon"
            title="رفع صورة"
            onClick={() => imageRef.current?.click()}
          >
            <ImageIcon className="h-4 w-4" />
          </Button>
          <input
            ref={imageRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={e => { const f = e.target.files?.[0]; if (f) onImageFile(f); e.target.value = ""; }}
          />
        </div>
        {value.imageUrl && (
          <img
            src={value.imageUrl}
            alt="معاينة"
            className="mt-2 w-full max-h-32 object-cover rounded-lg border border-border"
          />
        )}
      </div>

      {/* Title (optional) */}
      <div className="space-y-1.5">
        <Label>العنوان <span className="text-muted-foreground text-xs">(اختياري)</span></Label>
        <Input
          placeholder="نص يظهر فوق الإعلان"
          value={value.title ?? ""}
          onChange={e => onChange({ title: e.target.value })}
        />
      </div>

      {/* Link */}
      <div className="space-y-1.5">
        <Label>رابط الإعلان <span className="text-muted-foreground text-xs">(اختياري)</span></Label>
        <div className="flex gap-2">
          <Input
            placeholder="https://..."
            value={value.linkUrl ?? ""}
            onChange={e => onChange({ linkUrl: e.target.value })}
            className="flex-1"
          />
          {value.linkUrl && (
            <Button type="button" variant="outline" size="icon" asChild>
              <a href={value.linkUrl} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="h-4 w-4" />
              </a>
            </Button>
          )}
        </div>
      </div>

      {/* Order */}
      <div className="space-y-1.5">
        <Label>ترتيب الظهور</Label>
        <Input
          type="number"
          min={0}
          value={value.order}
          onChange={e => onChange({ order: Number(e.target.value) })}
          className="w-28"
        />
      </div>

      {/* Dates */}
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label>تاريخ البداية <span className="text-muted-foreground text-xs">(اختياري)</span></Label>
          <Input
            type="date"
            value={value.startDate ?? ""}
            onChange={e => onChange({ startDate: e.target.value })}
          />
        </div>
        <div className="space-y-1.5">
          <Label>تاريخ النهاية <span className="text-muted-foreground text-xs">(اختياري)</span></Label>
          <Input
            type="date"
            value={value.endDate ?? ""}
            onChange={e => onChange({ endDate: e.target.value })}
          />
        </div>
      </div>

      {/* Active toggle */}
      <div className="flex items-center gap-3">
        <Switch
          id="ad-active"
          checked={value.active}
          onCheckedChange={v => onChange({ active: v })}
        />
        <Label htmlFor="ad-active" className="cursor-pointer">
          {value.active ? "مفعّل" : "معطّل"}
        </Label>
      </div>
    </div>
  );
}

export default function Ads() {
  const { settings, addAd, updateAd, deleteAd } = useData();
  const ads = [...(settings.ads ?? [])].sort((a, b) => a.order - b.order);
  const { toast } = useToast();

  const [showAdd, setShowAdd] = useState(false);
  const [editTarget, setEditTarget] = useState<Ad | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Ad | null>(null);
  const [newAd, setNewAd] = useState<Omit<Ad, "id">>({ ...EMPTY_AD });
  const [editAd, setEditAd] = useState<Omit<Ad, "id">>({ ...EMPTY_AD });

  const addImgRef = useRef<HTMLInputElement>(null);
  const editImgRef = useRef<HTMLInputElement>(null);

  const toBase64 = (file: File, cb: (b64: string) => void) => {
    if (file.size > 5 * 1024 * 1024) {
      toast({ title: "الصورة كبيرة جداً (الحد 5MB)", variant: "destructive" });
      return;
    }
    const r = new FileReader();
    r.onload = e => cb(e.target?.result as string);
    r.readAsDataURL(file);
  };

  const handleAdd = () => {
    if (!newAd.imageUrl.trim()) {
      toast({ title: "صورة الإعلان مطلوبة", variant: "destructive" });
      return;
    }
    addAd(newAd);
    setNewAd({ ...EMPTY_AD });
    setShowAdd(false);
    toast({ title: "تم إضافة الإعلان ✓" });
  };

  const openEdit = (ad: Ad) => {
    setEditTarget(ad);
    setEditAd({ imageUrl: ad.imageUrl, linkUrl: ad.linkUrl ?? "", title: ad.title ?? "", order: ad.order, startDate: ad.startDate ?? "", endDate: ad.endDate ?? "", active: ad.active });
  };

  const handleEdit = () => {
    if (!editTarget) return;
    if (!editAd.imageUrl.trim()) {
      toast({ title: "صورة الإعلان مطلوبة", variant: "destructive" });
      return;
    }
    updateAd(editTarget.id, editAd);
    setEditTarget(null);
    toast({ title: "تم تحديث الإعلان ✓" });
  };

  const handleDelete = () => {
    if (!deleteTarget) return;
    deleteAd(deleteTarget.id);
    setDeleteTarget(null);
    toast({ title: "تم حذف الإعلان" });
  };

  const handleToggle = (ad: Ad) => {
    updateAd(ad.id, { active: !ad.active });
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-foreground">إدارة الإعلانات</h1>
            <p className="text-muted-foreground mt-1">تحكم في الإعلانات التي تظهر في الصفحة الرئيسية</p>
          </div>
          <Button className="gap-2 bg-accent text-white hover:bg-accent/90" onClick={() => { setNewAd({ ...EMPTY_AD, order: ads.length }); setShowAdd(true); }}>
            <Plus className="h-4 w-4" /> إضافة إعلان
          </Button>
        </div>

        {/* Info note */}
        <div className="rounded-xl border border-border bg-muted/30 p-4 text-sm text-muted-foreground leading-relaxed" dir="rtl">
          <p>
            الإعلانات تظهر في الصفحة الرئيسية بعد صورة الغلاف مباشرةً.
            عند وجود <strong>3 إعلانات أو أكثر</strong>: يظهر إعلان رئيسي كبير + إعلانان جانبيان على الديسكتوب.
            على الجوال والتابلت: تظهر دائماً كـ Carousel تلقائي.
          </p>
        </div>

        {/* Ads grid */}
        {ads.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-muted/20 py-16 gap-3">
            <ImageIcon className="h-10 w-10 text-muted-foreground/30" />
            <p className="text-muted-foreground font-medium">لا توجد إعلانات بعد</p>
            <Button variant="outline" className="gap-2 mt-1" onClick={() => { setNewAd({ ...EMPTY_AD }); setShowAdd(true); }}>
              <Plus className="h-4 w-4" /> أضف أول إعلان
            </Button>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {ads.map(ad => (
              <div
                key={ad.id}
                className={cn(
                  "relative rounded-2xl border bg-card overflow-hidden shadow-sm transition-all",
                  !ad.active && "opacity-60"
                )}
              >
                {/* Image */}
                <div className="relative aspect-[5/2] bg-muted overflow-hidden">
                  {ad.imageUrl ? (
                    <img
                      src={ad.imageUrl}
                      alt={ad.title || "إعلان"}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-muted-foreground/30">
                      <ImageIcon className="h-8 w-8" />
                    </div>
                  )}
                  {/* Status badge */}
                  <div className={cn(
                    "absolute top-2 right-2 text-xs font-medium px-2 py-0.5 rounded-full",
                    ad.active ? "bg-green-500/90 text-white" : "bg-muted-foreground/60 text-white"
                  )}>
                    {ad.active ? "مفعّل" : "معطّل"}
                  </div>
                </div>

                {/* Info */}
                <div className="p-3 space-y-1.5">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      {ad.title && (
                        <p className="text-sm font-semibold text-foreground truncate">{ad.title}</p>
                      )}
                      {ad.linkUrl && (
                        <a
                          href={ad.linkUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-accent hover:underline flex items-center gap-1 mt-0.5 truncate"
                        >
                          <ExternalLink className="h-3 w-3 flex-shrink-0" />
                          <span className="truncate">{ad.linkUrl}</span>
                        </a>
                      )}
                      <div className="flex items-center gap-3 mt-1.5 text-xs text-muted-foreground">
                        <span>ترتيب: {ad.order}</span>
                        {ad.startDate && <span>من: {ad.startDate}</span>}
                        {ad.endDate && <span>حتى: {ad.endDate}</span>}
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 pt-1 border-t border-border">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 px-2 text-muted-foreground hover:text-foreground gap-1.5 flex-1"
                      onClick={() => handleToggle(ad)}
                      title={ad.active ? "تعطيل" : "تفعيل"}
                    >
                      {ad.active ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                      <span className="text-xs">{ad.active ? "تعطيل" : "تفعيل"}</span>
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 px-2 text-muted-foreground hover:text-foreground gap-1.5 flex-1"
                      onClick={() => openEdit(ad)}
                    >
                      <Pencil className="h-3.5 w-3.5" />
                      <span className="text-xs">تعديل</span>
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 px-2 text-muted-foreground hover:text-destructive gap-1.5 flex-1"
                      onClick={() => setDeleteTarget(ad)}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      <span className="text-xs">حذف</span>
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add dialog */}
      <Dialog open={showAdd} onOpenChange={setShowAdd}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>إضافة إعلان جديد</DialogTitle>
          </DialogHeader>
          <AdForm
            value={newAd}
            onChange={patch => setNewAd(p => ({ ...p, ...patch }))}
            onImageFile={f => toBase64(f, b64 => setNewAd(p => ({ ...p, imageUrl: b64 })))}
            imageRef={addImgRef}
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAdd(false)}>إلغاء</Button>
            <Button className="bg-accent text-white hover:bg-accent/90" onClick={handleAdd}>إضافة</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit dialog */}
      <Dialog open={!!editTarget} onOpenChange={open => { if (!open) setEditTarget(null); }}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>تعديل الإعلان</DialogTitle>
          </DialogHeader>
          <AdForm
            value={editAd}
            onChange={patch => setEditAd(p => ({ ...p, ...patch }))}
            onImageFile={f => toBase64(f, b64 => setEditAd(p => ({ ...p, imageUrl: b64 })))}
            imageRef={editImgRef}
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditTarget(null)}>إلغاء</Button>
            <Button className="bg-accent text-white hover:bg-accent/90" onClick={handleEdit}>حفظ</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete confirm */}
      <AlertDialog open={!!deleteTarget} onOpenChange={open => { if (!open) setDeleteTarget(null); }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>حذف الإعلان</AlertDialogTitle>
            <AlertDialogDescription>هل أنت متأكد من حذف هذا الإعلان؟ لا يمكن التراجع عن هذا الإجراء.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>إلغاء</AlertDialogCancel>
            <AlertDialogAction className="bg-destructive text-white hover:bg-destructive/90" onClick={handleDelete}>حذف</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AdminLayout>
  );
}
