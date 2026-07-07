import { useState, useEffect } from "react";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Plus, Pencil, Trash2, Image, Play, Eye, EyeOff, GripVertical } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { api } from "@/lib/api";
import { getVideoThumbnailUrl, hasVideo } from "@/lib/videoThumbnail";
import { cn } from "@/lib/utils";

interface GalleryItem {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  videoUrl: string;
  displayOrder: number;
  active: boolean;
  createdAt: string;
}

const emptyForm = { title: "", description: "", imageUrl: "", videoUrl: "", displayOrder: 0, active: true };

export default function FinishingGallery() {
  const { toast } = useToast();
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<GalleryItem | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<GalleryItem | null>(null);
  const [thumbErrors, setThumbErrors] = useState<Record<string, boolean>>({});

  const fetchItems = async () => {
    try {
      const data = await api.get<GalleryItem[]>("/finishing-gallery");
      setItems(data);
    } catch {
      toast({ title: "فشل تحميل المعرض", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { void fetchItems(); }, []);

  const openAdd = () => {
    setEditing(null);
    setForm({ ...emptyForm, displayOrder: items.length });
    setDialogOpen(true);
  };

  const openEdit = (item: GalleryItem) => {
    setEditing(item);
    setForm({ title: item.title, description: item.description, imageUrl: item.imageUrl, videoUrl: item.videoUrl, displayOrder: item.displayOrder, active: item.active });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!form.imageUrl && !form.videoUrl) {
      toast({ title: "يجب إدخال صورة أو رابط فيديو على الأقل", variant: "destructive" });
      return;
    }
    setSaving(true);
    try {
      if (editing) {
        const updated = await api.patch<GalleryItem>(`/finishing-gallery/${editing.id}`, form);
        setItems(prev => prev.map(i => i.id === editing.id ? { ...i, ...updated } : i));
        toast({ title: "تم تحديث العنصر" });
      } else {
        const created = await api.post<GalleryItem>("/finishing-gallery", form);
        setItems(prev => [...prev, created]);
        toast({ title: "تم إضافة العنصر" });
      }
      setDialogOpen(false);
    } catch {
      toast({ title: "فشل الحفظ", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await api.del(`/finishing-gallery/${deleteTarget.id}`);
      setItems(prev => prev.filter(i => i.id !== deleteTarget.id));
      toast({ title: "تم حذف العنصر" });
    } catch {
      toast({ title: "فشل الحذف", variant: "destructive" });
    } finally {
      setDeleteTarget(null);
    }
  };

  const toggleActive = async (item: GalleryItem) => {
    try {
      await api.patch(`/finishing-gallery/${item.id}`, { active: !item.active });
      setItems(prev => prev.map(i => i.id === item.id ? { ...i, active: !i.active } : i));
    } catch {
      toast({ title: "فشل التحديث", variant: "destructive" });
    }
  };

  const videoThumb = (url: string, id: string) =>
    !thumbErrors[id] ? getVideoThumbnailUrl(url) : null;

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">معرض أعمال التشطيبات</h1>
            <p className="text-sm text-muted-foreground mt-1">أضف صور وفيديوهات أعمالك السابقة لتظهر في صفحة خدمات التشطيبات</p>
          </div>
          <Button onClick={openAdd} className="bg-accent text-white hover:bg-accent/90 gap-2">
            <Plus className="h-4 w-4" />إضافة عنصر
          </Button>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="aspect-square bg-muted animate-pulse rounded-xl" />
            ))}
          </div>
        ) : items.length === 0 ? (
          <Card className="card-luxury border-none">
            <CardContent className="py-16 text-center">
              <Image className="h-10 w-10 mx-auto text-muted-foreground/30 mb-3" />
              <p className="text-muted-foreground">لا توجد عناصر بعد — أضف صور وفيديوهات أعمالك</p>
              <Button onClick={openAdd} className="mt-4 bg-accent text-white hover:bg-accent/90 gap-2">
                <Plus className="h-4 w-4" />أضف أول عنصر
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {items.map(item => {
              const thumb = item.videoUrl && hasVideo(item.videoUrl)
                ? videoThumb(item.videoUrl, item.id)
                : null;
              const coverSrc = item.imageUrl || thumb;
              const isVideo = !!item.videoUrl && hasVideo(item.videoUrl);

              return (
                <div key={item.id} className={cn("group relative rounded-xl overflow-hidden border border-border aspect-square bg-muted", !item.active && "opacity-50")}>
                  {coverSrc ? (
                    <img
                      src={coverSrc}
                      alt={item.title}
                      className="w-full h-full object-cover"
                      onError={() => setThumbErrors(p => ({ ...p, [item.id]: true }))}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-muted">
                      <Image className="h-8 w-8 text-muted-foreground/30" />
                    </div>
                  )}

                  {isVideo && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="w-10 h-10 rounded-full bg-black/50 flex items-center justify-center">
                        <Play className="h-4 w-4 text-white fill-white translate-x-px" />
                      </span>
                    </div>
                  )}

                  {item.title && (
                    <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/70 to-transparent px-2 pt-4 pb-2">
                      <p className="text-white text-xs font-medium line-clamp-1">{item.title}</p>
                    </div>
                  )}

                  <div className="absolute top-2 left-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => openEdit(item)} className="w-7 h-7 rounded-full bg-white/90 flex items-center justify-center shadow hover:bg-white" title="تعديل">
                      <Pencil className="h-3.5 w-3.5 text-foreground" />
                    </button>
                    <button onClick={() => setDeleteTarget(item)} className="w-7 h-7 rounded-full bg-red-500/90 flex items-center justify-center shadow hover:bg-red-500" title="حذف">
                      <Trash2 className="h-3.5 w-3.5 text-white" />
                    </button>
                    <button onClick={() => toggleActive(item)} className="w-7 h-7 rounded-full bg-white/90 flex items-center justify-center shadow hover:bg-white" title={item.active ? "إخفاء" : "إظهار"}>
                      {item.active ? <Eye className="h-3.5 w-3.5 text-foreground" /> : <EyeOff className="h-3.5 w-3.5 text-muted-foreground" />}
                    </button>
                  </div>

                  <div className="absolute top-2 right-2 flex gap-1">
                    {isVideo && (
                      <span className="bg-black/60 text-white text-[9px] px-1.5 py-0.5 rounded-full flex items-center gap-0.5 backdrop-blur-sm">
                        <Play className="h-2.5 w-2.5 fill-white" />فيديو
                      </span>
                    )}
                    {!item.active && (
                      <span className="bg-black/60 text-white text-[9px] px-1.5 py-0.5 rounded-full backdrop-blur-sm">مخفي</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg" dir="rtl">
          <DialogHeader>
            <DialogTitle>{editing ? "تعديل عنصر" : "إضافة عنصر جديد"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>رابط الصورة</Label>
              <Input
                value={form.imageUrl}
                onChange={e => setForm(p => ({ ...p, imageUrl: e.target.value }))}
                placeholder="https://example.com/image.jpg"
                dir="ltr"
              />
              <p className="text-xs text-muted-foreground">الصق رابط صورة مباشر (jpg، png، webp...)</p>
            </div>
            <div className="space-y-2">
              <Label>رابط الفيديو (اختياري)</Label>
              <Input
                value={form.videoUrl}
                onChange={e => setForm(p => ({ ...p, videoUrl: e.target.value }))}
                placeholder="https://www.youtube.com/watch?v=... أو TikTok"
                dir="ltr"
              />
              <p className="text-xs text-muted-foreground">يدعم روابط يوتيوب وتيك توك — سيُفتح داخل المنصة عند الضغط عليه</p>
            </div>
            <div className="space-y-2">
              <Label>العنوان (اختياري)</Label>
              <Input value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} placeholder="مثال: شقة سوبر لوكس - التجمع" />
            </div>
            <div className="space-y-2">
              <Label>وصف (اختياري)</Label>
              <Textarea value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} placeholder="وصف مختصر للعمل..." className="min-h-[70px]" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>ترتيب العرض</Label>
                <Input type="number" value={form.displayOrder} onChange={e => setForm(p => ({ ...p, displayOrder: Number(e.target.value) }))} min={0} />
              </div>
              <div className="flex items-end gap-3 pb-0.5">
                <Switch checked={form.active} onCheckedChange={v => setForm(p => ({ ...p, active: v }))} />
                <Label className="cursor-pointer">{form.active ? "ظاهر" : "مخفي"}</Label>
              </div>
            </div>

            {(form.imageUrl || (form.videoUrl && hasVideo(form.videoUrl))) && (
              <div className="rounded-lg overflow-hidden border border-border aspect-video bg-muted">
                <img
                  src={form.imageUrl || getVideoThumbnailUrl(form.videoUrl) || ""}
                  alt="معاينة"
                  className="w-full h-full object-cover"
                  onError={e => { (e.target as HTMLImageElement).style.display = "none"; }}
                />
              </div>
            )}
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setDialogOpen(false)}>إلغاء</Button>
            <Button onClick={handleSave} disabled={saving} className="bg-accent text-white hover:bg-accent/90">
              {saving ? "جارٍ الحفظ..." : editing ? "تحديث" : "إضافة"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteTarget} onOpenChange={o => !o && setDeleteTarget(null)}>
        <AlertDialogContent dir="rtl">
          <AlertDialogHeader>
            <AlertDialogTitle>تأكيد الحذف</AlertDialogTitle>
            <AlertDialogDescription>هل أنت متأكد من حذف هذا العنصر؟ لا يمكن التراجع.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>إلغاء</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-500 text-white hover:bg-red-600">حذف</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AdminLayout>
  );
}
