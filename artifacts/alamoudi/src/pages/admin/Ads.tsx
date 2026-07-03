import { useState, useRef } from "react";
import { useData } from "@/context/DataContext";
import type { Ad } from "@/context/DataContext";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { AdImage } from "@/components/ui/AdsBanner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Pencil, Trash2, Plus, Image as ImageIcon, ExternalLink, Eye, EyeOff, Clock, Info, Blend } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

// ─── الإعلان الفارغ الافتراضي ────────────────────────────────────────────────
const EMPTY_AD: Omit<Ad, "id"> = {
  imageUrl: "",
  linkUrl: "",
  title: "",
  order: 1,
  duration: 6,
  startDate: "",
  endDate: "",
  active: true,
};

// ─── نموذج الإعلان ────────────────────────────────────────────────────────────
function AdForm({
  value,
  onChange,
  onImageFile,
  imageRef,
  isFirst,
}: {
  value: Omit<Ad, "id">;
  onChange: (patch: Partial<Omit<Ad, "id">>) => void;
  onImageFile: (file: File) => void;
  imageRef: React.RefObject<HTMLInputElement | null>;
  isFirst?: boolean;
}) {
  return (
    <div className="space-y-4">

      {/* الصورة */}
      <div className="space-y-1.5">
        <Label>
          صورة الإعلان <span className="text-destructive">*</span>
        </Label>
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
            title="رفع صورة من الجهاز"
            onClick={() => imageRef.current?.click()}
          >
            <ImageIcon className="h-4 w-4" />
          </Button>
          <input
            ref={imageRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={e => {
              const f = e.target.files?.[0];
              if (f) onImageFile(f);
              e.target.value = "";
            }}
          />
        </div>

        {/* مواصفات الصورة */}
        <div className="rounded-lg bg-muted/40 border border-border p-2.5 space-y-1 text-xs text-muted-foreground" dir="rtl">
          <p className="font-semibold text-foreground flex items-center gap-1.5">
            <Info className="h-3.5 w-3.5" />
            مواصفات الصورة المناسبة للبانر
          </p>
          <p>📐 المقاس الموصى به: <strong className="text-foreground">1200 × 350 بكسل</strong> (نسبة عرض 3.4:1)</p>
          <p>🎯 ضع النص والشعار في <strong className="text-foreground">وسط الصورة</strong> لأن الحواف قد تُقطع على بعض الشاشات</p>
          <p>🚫 لا تترك هوامش أو مساحات بيضاء حول التصميم — امتلئ كل مساحة الصورة</p>
          <p>📁 الصيغ المقبولة: JPG, PNG, WebP — الحد الأقصى 5MB</p>
        </div>

        {/* معاينة */}
        {value.imageUrl && (
          <div className="mt-2 relative rounded-lg border border-border overflow-hidden bg-muted/30" style={{ height: "90px" }}>
            <img
              src={value.imageUrl}
              alt="معاينة"
              className="w-full h-full object-cover object-center"
            />
            <div className="absolute inset-0 flex items-end justify-start p-1.5 pointer-events-none">
              <span className="text-[10px] bg-black/50 text-white rounded px-1.5 py-0.5">معاينة البانر</span>
            </div>
          </div>
        )}
      </div>

      {/* العنوان */}
      <div className="space-y-1.5">
        <Label>
          العنوان <span className="text-muted-foreground text-xs">(اختياري — يظهر على الصورة)</span>
        </Label>
        <Input
          placeholder="مثال: مجمع سكني فاخر — الساحل الشمالي"
          value={value.title ?? ""}
          onChange={e => onChange({ title: e.target.value })}
        />
      </div>

      {/* رابط الإعلان */}
      <div className="space-y-1.5">
        <Label>
          رابط الإعلان <span className="text-muted-foreground text-xs">(اختياري — الضغط على الإعلان يفتحه)</span>
        </Label>
        <div className="flex gap-2">
          <Input
            placeholder="https://..."
            value={value.linkUrl ?? ""}
            onChange={e => onChange({ linkUrl: e.target.value })}
            className="flex-1"
          />
          {value.linkUrl && (
            <Button type="button" variant="outline" size="icon" asChild>
              <a href={value.linkUrl} target="_blank" rel="noopener noreferrer" title="افتح الرابط">
                <ExternalLink className="h-4 w-4" />
              </a>
            </Button>
          )}
        </div>
      </div>

      {/* مدة الظهور + الترتيب */}
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label className="flex items-center gap-1.5">
            <Clock className="h-3.5 w-3.5 text-muted-foreground" />
            مدة الظهور (ثانية)
          </Label>
          <Input
            type="number"
            min={2}
            max={60}
            step={1}
            value={value.duration ?? 6}
            onChange={e => onChange({ duration: Math.max(2, Number(e.target.value)) })}
          />
          <p className="text-[11px] text-muted-foreground">
            {isFirst
              ? "كم ثانية يظهر هذا الإعلان في اللوحة الرئيسية قبل الانتقال"
              : "كم ثانية يبقى في اللوحة الرئيسية عند دوره"}
          </p>
        </div>
        <div className="space-y-1.5">
          <Label>ترتيب الظهور</Label>
          <Input
            type="number"
            min={1}
            value={value.order}
            onChange={e => onChange({ order: Number(e.target.value) })}
          />
          <p className="text-[11px] text-muted-foreground">
            الترتيب 1 = الإعلان الذي يبدأ أولاً في اللوحة الكبيرة
          </p>
        </div>
      </div>

      {/* تاريخ البداية والنهاية */}
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
          <Label>تاريخ الانتهاء <span className="text-muted-foreground text-xs">(اختياري)</span></Label>
          <Input
            type="date"
            value={value.endDate ?? ""}
            onChange={e => onChange({ endDate: e.target.value })}
          />
        </div>
      </div>

      {/* تفعيل / تعطيل */}
      <div className="flex items-center gap-3 py-1">
        <Switch
          id="ad-active"
          checked={value.active}
          onCheckedChange={v => onChange({ active: v })}
        />
        <Label htmlFor="ad-active" className="cursor-pointer">
          {value.active ? "مفعّل — يظهر للزوار" : "معطّل — مخفي عن الزوار"}
        </Label>
      </div>
    </div>
  );
}

// ─── الصفحة الرئيسية ──────────────────────────────────────────────────────────
export default function Ads() {
  const { settings, updateSettings, addAd, updateAd, deleteAd } = useData();
  const ads = [...(settings.ads ?? [])].sort((a, b) => a.order - b.order);
  const { toast } = useToast();

  // state محلي للمعاينة الفورية — يُحدَّث فوراً مع الـ slider قبل الحفظ
  const [previewBlur, setPreviewBlur] = useState<number>(settings.adsBlurSize ?? 8);

  const [showAdd,      setShowAdd]      = useState(false);
  const [editTarget,   setEditTarget]   = useState<Ad | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Ad | null>(null);
  const [newAd,        setNewAd]        = useState<Omit<Ad, "id">>({ ...EMPTY_AD });
  const [editAd,       setEditAd]       = useState<Omit<Ad, "id">>({ ...EMPTY_AD });

  const addImgRef  = useRef<HTMLInputElement>(null);
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
    setNewAd({ ...EMPTY_AD, order: ads.length + 2 });
    setShowAdd(false);
    toast({ title: "تم إضافة الإعلان ✓" });
  };

  const openEdit = (ad: Ad) => {
    setEditTarget(ad);
    setEditAd({
      imageUrl:  ad.imageUrl,
      linkUrl:   ad.linkUrl   ?? "",
      title:     ad.title     ?? "",
      order:     ad.order,
      duration:  ad.duration  ?? 6,
      startDate: ad.startDate ?? "",
      endDate:   ad.endDate   ?? "",
      active:    ad.active,
    });
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

  const handleToggle = (ad: Ad) => updateAd(ad.id, { active: !ad.active });

  const atMax = ads.length >= 3;

  return (
    <AdminLayout>
      <div className="space-y-6">

        {/* ─── رأس الصفحة ─── */}
        <div className="flex justify-between items-start gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">إدارة الإعلانات</h1>
            <p className="text-muted-foreground mt-1 flex items-center gap-2">
              الإعلانات التي تظهر في الصفحة الرئيسية
              <span className={cn(
                "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold",
                atMax ? "bg-destructive/10 text-destructive" : "bg-muted text-muted-foreground"
              )}>
                {ads.length} / 3
              </span>
            </p>
          </div>
          <Button
            className="gap-2 bg-accent text-white hover:bg-accent/90 disabled:opacity-40 shrink-0"
            disabled={atMax}
            title={atMax ? "وصلت للحد الأقصى — احذف إعلاناً أولاً" : undefined}
            onClick={() => {
              setNewAd({ ...EMPTY_AD, order: ads.length + 1 });
              setShowAdd(true);
            }}
          >
            <Plus className="h-4 w-4" /> إضافة إعلان
          </Button>
        </div>

        {/* ─── بطاقة الشرح ─── */}
        <div className="rounded-xl border border-border bg-muted/20 p-4 space-y-2 text-sm" dir="rtl">
          <p className="font-semibold text-foreground">كيف تعمل الإعلانات؟</p>
          <div className="space-y-1 text-muted-foreground text-[13px] leading-relaxed">
            <p>
              🖥️ <strong className="text-foreground">الديسكتوب مع 3 إعلانات:</strong>{" "}
              الإعلان الأول يأخذ اللوحة الكبيرة (60% من العرض) ويبقى فيها بمدة تحددها أنت،
              ثم يُبدَّل بالثاني ثم الثالث وهكذا. اللوحتان الجانبيتان تعرضان دائماً
              الإعلانات التالية في الترتيب كمعاينة.
            </p>
            <p>
              📱 <strong className="text-foreground">الجوال والتابلت:</strong>{" "}
              إعلان واحد يظهر في كل مرة ويتبدل تلقائياً بحسب مدة كل إعلان.
            </p>
            <p>
              ⏱️ <strong className="text-foreground">مدة الظهور:</strong>{" "}
              تحدد لكل إعلان كم ثانية يبقى ظاهراً في اللوحة الرئيسية قبل الانتقال للتالي.
              الضغط على أحد الإعلانات يوقف التبديل التلقائي مؤقتاً.
            </p>
            <p>
              🗓️ <strong className="text-foreground">مدة العرض بالتواريخ:</strong>{" "}
              يمكنك تحديد تاريخ بداية وانتهاء لكل إعلان — الإعلان لن يظهر خارج هذه المدة.
            </p>
            <p>
              🎨 <strong className="text-foreground">المقاس المثالي للصورة:</strong>{" "}
              <strong>1200 × 350 بكسل</strong> — ضع كل المحتوى المهم في وسط الصورة.
            </p>
          </div>
        </div>

        {/* ─── إعداد حجم Blur على الحواف ─── */}
        <div className="rounded-xl border border-border bg-card p-4 space-y-3" dir="rtl">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Blend className="h-4 w-4 text-muted-foreground" />
              <Label className="text-sm font-semibold">تأثير Blur على حواف الإعلانات</Label>
            </div>
            <span className="text-xs font-mono text-accent bg-accent/10 rounded px-2 py-0.5 min-w-[2.5rem] text-center">
              {previewBlur}
            </span>
          </div>
          <Slider
            min={0}
            max={20}
            step={1}
            value={[previewBlur]}
            onValueChange={([v]) => {
              setPreviewBlur(v);
              updateSettings({ adsBlurSize: v });
            }}
            className="w-full"
          />
          <p className="text-[11px] text-muted-foreground leading-relaxed">
            القيمة <strong>0</strong> بدون إطار — القيمة <strong>20</strong> إطار عريض. المعاينة تظهر فوراً على الإعلانات أدناه.
          </p>
        </div>

        {/* ─── شبكة الإعلانات ─── */}
        {ads.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-muted/20 py-16 gap-3">
            <ImageIcon className="h-10 w-10 text-muted-foreground/30" />
            <p className="text-muted-foreground font-medium">لا توجد إعلانات بعد</p>
            <Button
              variant="outline"
              className="gap-2 mt-1"
              onClick={() => { setNewAd({ ...EMPTY_AD }); setShowAdd(true); }}
            >
              <Plus className="h-4 w-4" /> أضف أول إعلان
            </Button>
          </div>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {ads.map((ad, idx) => (
              <div
                key={ad.id}
                className={cn(
                  "relative rounded-2xl border bg-card overflow-hidden shadow-sm transition-all",
                  !ad.active && "opacity-60"
                )}
              >
                {/* صورة الإعلان — معاينة فورية لتأثير الـ blur */}
                <div className="relative bg-muted overflow-hidden rounded-t-2xl" style={{ height: "120px" }}>
                  {ad.imageUrl ? (
                    <AdImage
                      src={ad.imageUrl}
                      alt={ad.title || "إعلان"}
                      blurSize={previewBlur}
                      opacity={1}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-muted-foreground/30">
                      <ImageIcon className="h-8 w-8" />
                    </div>
                  )}

                  {/* شارة الترتيب */}
                  <div className="absolute top-2 left-2 flex items-center gap-1">
                    <span className="bg-black/60 backdrop-blur-sm text-white text-[11px] font-bold rounded-full px-2 py-0.5">
                      {idx === 0 ? "① رئيسي" : idx === 1 ? "② جانبي" : "③ جانبي"}
                    </span>
                  </div>

                  {/* شارة الحالة */}
                  <div className={cn(
                    "absolute top-2 right-2 text-[11px] font-medium px-2 py-0.5 rounded-full",
                    ad.active ? "bg-green-500/90 text-white" : "bg-muted-foreground/60 text-white"
                  )}>
                    {ad.active ? "مفعّل" : "معطّل"}
                  </div>
                </div>

                {/* معلومات */}
                <div className="p-3 space-y-2">
                  <div className="space-y-1">
                    {ad.title ? (
                      <p className="text-sm font-semibold text-foreground leading-snug">{ad.title}</p>
                    ) : (
                      <p className="text-sm text-muted-foreground italic">بدون عنوان</p>
                    )}

                    {ad.linkUrl && (
                      <a
                        href={ad.linkUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-accent hover:underline flex items-center gap-1 truncate"
                      >
                        <ExternalLink className="h-3 w-3 flex-shrink-0" />
                        <span className="truncate">{ad.linkUrl}</span>
                      </a>
                    )}

                    {/* التفاصيل */}
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 mt-1 text-[11px] text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {ad.duration ?? 6} ثانية
                      </span>
                      <span>ترتيب: {ad.order}</span>
                      {ad.startDate && <span>من {ad.startDate}</span>}
                      {ad.endDate   && <span>حتى {ad.endDate}</span>}
                    </div>
                  </div>

                  {/* أزرار الإجراءات */}
                  <div className="flex items-center gap-1.5 pt-2 border-t border-border">
                    <Button
                      variant="ghost" size="sm"
                      className="h-8 px-2 text-muted-foreground hover:text-foreground gap-1 flex-1 text-xs"
                      onClick={() => handleToggle(ad)}
                    >
                      {ad.active ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                      {ad.active ? "تعطيل" : "تفعيل"}
                    </Button>
                    <Button
                      variant="ghost" size="sm"
                      className="h-8 px-2 text-muted-foreground hover:text-foreground gap-1 flex-1 text-xs"
                      onClick={() => openEdit(ad)}
                    >
                      <Pencil className="h-3.5 w-3.5" /> تعديل
                    </Button>
                    <Button
                      variant="ghost" size="sm"
                      className="h-8 px-2 text-muted-foreground hover:text-destructive gap-1 flex-1 text-xs"
                      onClick={() => setDeleteTarget(ad)}
                    >
                      <Trash2 className="h-3.5 w-3.5" /> حذف
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ─── نافذة الإضافة ─── */}
      <Dialog open={showAdd} onOpenChange={setShowAdd}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>إضافة إعلان جديد</DialogTitle>
          </DialogHeader>
          <AdForm
            value={newAd}
            onChange={patch => setNewAd(p => ({ ...p, ...patch }))}
            onImageFile={f => toBase64(f, b64 => setNewAd(p => ({ ...p, imageUrl: b64 })))}
            imageRef={addImgRef}
            isFirst={ads.length === 0}
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAdd(false)}>إلغاء</Button>
            <Button className="bg-accent text-white hover:bg-accent/90" onClick={handleAdd}>
              إضافة
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ─── نافذة التعديل ─── */}
      <Dialog open={!!editTarget} onOpenChange={open => { if (!open) setEditTarget(null); }}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>تعديل الإعلان</DialogTitle>
          </DialogHeader>
          <AdForm
            value={editAd}
            onChange={patch => setEditAd(p => ({ ...p, ...patch }))}
            onImageFile={f => toBase64(f, b64 => setEditAd(p => ({ ...p, imageUrl: b64 })))}
            imageRef={editImgRef}
            isFirst={editTarget ? ads.indexOf(editTarget) === 0 : false}
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditTarget(null)}>إلغاء</Button>
            <Button className="bg-accent text-white hover:bg-accent/90" onClick={handleEdit}>
              حفظ التعديلات
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ─── تأكيد الحذف ─── */}
      <AlertDialog open={!!deleteTarget} onOpenChange={open => { if (!open) setDeleteTarget(null); }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>حذف الإعلان</AlertDialogTitle>
            <AlertDialogDescription>
              هل أنت متأكد من حذف هذا الإعلان؟ لا يمكن التراجع عن هذا الإجراء.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>إلغاء</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-white hover:bg-destructive/90"
              onClick={handleDelete}
            >
              حذف
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AdminLayout>
  );
}
