import { useState, useRef, useCallback } from "react";
import { useData } from "@/context/DataContext";
import type { Ad, AdType } from "@/context/DataContext";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { useLocation } from "wouter";
import {
  Pencil, Trash2, Plus, Image as ImageIcon, ExternalLink,
  Eye, EyeOff, Clock, Info, GripVertical, Monitor, Tablet, Smartphone,
  CheckCircle2, CalendarClock, XCircle, MinusCircle, MousePointerClick, TrendingUp,
  AlertTriangle, UploadCloud, BarChart2,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

// ─── النسب المطلوبة لكل نوع صورة ──────────────────────────────────────────

const RATIO_SPECS = {
  premium_desktop:  { w: 21, h: 9,  label: "21:9",  example: "2520×1080 أو 1680×720 أو 840×360" },
  premium_mobile:   { w: 16, h: 9,  label: "16:9",  example: "1280×720 أو 1920×1080" },
  secondary_desktop:{ w: 16, h: 9,  label: "16:9",  example: "1280×720 أو 1920×1080" },
  secondary_mobile: { w: 16, h: 9,  label: "16:9",  example: "1280×720 أو 1920×1080" },
} as const;

// ─── حساب حالة الإعلان ──────────────────────────────────────────────────────

function getAdStatus(ad: Ad): "active" | "scheduled" | "expired" | "disabled" {
  if (!ad.active) return "disabled";
  const now = new Date();
  if (ad.startDate && new Date(ad.startDate) > now) return "scheduled";
  if (ad.endDate   && new Date(ad.endDate)   < now) return "expired";
  return "active";
}

const STATUS_CONFIG = {
  active:   { label: "نشط",     color: "bg-green-100 text-green-800 border-green-200",   icon: CheckCircle2 },
  scheduled:{ label: "مجدول",   color: "bg-blue-100 text-blue-800 border-blue-200",      icon: CalendarClock },
  expired:  { label: "منتهي",   color: "bg-red-100 text-red-800 border-red-200",         icon: XCircle },
  disabled: { label: "معطّل",   color: "bg-neutral-100 text-neutral-600 border-neutral-200", icon: MinusCircle },
};

// ─── ضغط الصورة وتحويلها لـ WebP مع التحقق من النسبة ──────────────────────

interface ImageResult {
  dataUrl: string;
  width: number;
  height: number;
  error?: string;
}

async function validateAndCompress(
  file: File,
  spec: { w: number; h: number },
  tolerance = 0.03
): Promise<ImageResult> {
  if (file.size > 10 * 1024 * 1024)
    return { dataUrl: "", width: 0, height: 0, error: "حجم الملف كبير جداً — الحد الأقصى 10 ميجابايت" };

  return new Promise(resolve => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      const { naturalWidth: w, naturalHeight: h } = img;
      const actual   = w / h;
      const expected = spec.w / spec.h;
      if (Math.abs(actual - expected) / expected > tolerance) {
        resolve({
          dataUrl: "", width: 0, height: 0,
          error: `النسبة غير صحيحة — صورتك: ${w}×${h} (${(actual).toFixed(2)}:1) — المطلوب: ${spec.w}:${spec.h} (${(expected).toFixed(2)}:1)`,
        });
        return;
      }
      const canvas = document.createElement("canvas");
      const MAX    = 1920;
      const scale  = w > MAX ? MAX / w : 1;
      canvas.width  = Math.round(w * scale);
      canvas.height = Math.round(h * scale);
      canvas.getContext("2d")!.drawImage(img, 0, 0, canvas.width, canvas.height);
      resolve({ dataUrl: canvas.toDataURL("image/webp", 0.85), width: canvas.width, height: canvas.height });
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      resolve({ dataUrl: "", width: 0, height: 0, error: "تعذّر قراءة الصورة" });
    };
    img.src = url;
  });
}

// ─── مكوّن رفع الصورة مع التحقق ─────────────────────────────────────────────

function ImageUploader({
  label,
  sublabel,
  value,
  spec,
  onResult,
  required,
}: {
  label: string;
  sublabel: string;
  value: string;
  spec: { w: number; h: number; label: string; example: string };
  onResult: (dataUrl: string, error?: string) => void;
  required?: boolean;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState<string>();
  const [dragging, setDragging] = useState(false);
  const [imgDims,  setImgDims]  = useState<{ w: number; h: number } | null>(null);

  const handleFile = async (file: File) => {
    setLoading(true);
    setError(undefined);
    setImgDims(null);
    const result = await validateAndCompress(file, spec);
    setLoading(false);
    if (result.error) {
      setError(result.error);
      onResult("", result.error);
    } else {
      setError(undefined);
      setImgDims({ w: result.width, h: result.height });
      onResult(result.dataUrl);
    }
  };

  const onDragOver  = (e: React.DragEvent) => { e.preventDefault(); setDragging(true); };
  const onDragLeave = (e: React.DragEvent) => { e.preventDefault(); setDragging(false); };
  const onDrop      = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith("image/")) handleFile(file);
  };

  // الأبعاد البصرية لمستطيل النسبة (عرض ثابت 56px)
  const diagW = spec.w === 21 ? 84 : 64;
  const diagH = Math.round(diagW * spec.h / spec.w);

  return (
    <div className="space-y-2.5">
      {/* ── رأس: العنوان + الشارة ── */}
      <div className="flex items-center justify-between">
        <Label className="text-sm font-semibold">
          {label}
          {required && <span className="text-destructive mr-1">*</span>}
        </Label>
        <span className={cn(
          "text-xs font-bold px-2 py-0.5 rounded-full",
          required ? "bg-accent/10 text-accent" : "bg-muted text-muted-foreground"
        )}>
          {spec.label}
        </span>
      </div>

      {/* ── بطاقة المواصفات المرئية ── */}
      <div className="rounded-lg bg-blue-50/60 border border-blue-200/70 px-3 py-2.5 flex items-start gap-3">
        {/* مستطيل يوضّح النسبة */}
        <div className="shrink-0 flex items-center justify-center mt-0.5">
          <div
            className="border-2 border-blue-400 rounded-sm bg-blue-100"
            style={{ width: `${diagW}px`, height: `${diagH}px` }}
          >
            <div className="w-full h-full flex items-center justify-center text-[9px] text-blue-600 font-bold">
              {spec.label}
            </div>
          </div>
        </div>
        <div className="text-xs space-y-0.5 min-w-0">
          <p className="font-semibold text-blue-900">{sublabel}</p>
          <p className="text-blue-700">
            <span className="text-blue-500">أبعاد موصى بها:</span> {spec.example}
          </p>
          <p className="text-blue-500">الحجم الأقصى للملف: 10 ميجابايت</p>
          <p className="text-blue-500">صيغ مقبولة: JPG · PNG · WebP</p>
        </div>
      </div>

      {/* ── منطقة الرفع (drag & drop) ── */}
      <div
        className={cn(
          "rounded-lg border-2 border-dashed p-3 space-y-2 transition-all duration-200",
          dragging
            ? "border-accent bg-accent/5 scale-[1.01]"
            : "border-border bg-muted/30 hover:border-muted-foreground/40"
        )}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
      >
        {dragging && (
          <div className="text-center py-1 text-xs text-accent font-semibold animate-pulse">
            ↓ أسقط الصورة هنا
          </div>
        )}

        <div className="flex gap-2">
          <Input
            placeholder="https://... أو ارفع الصورة"
            value={value}
            onChange={e => { setImgDims(null); onResult(e.target.value); }}
            className="flex-1 text-sm h-9"
          />
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="gap-1.5 shrink-0 h-9"
            disabled={loading}
            onClick={() => inputRef.current?.click()}
          >
            <UploadCloud className="h-3.5 w-3.5" />
            {loading ? "جارٍ الفحص…" : "رفع"}
          </Button>
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={e => {
              const f = e.target.files?.[0];
              if (f) handleFile(f);
              e.target.value = "";
            }}
          />
        </div>

        {!dragging && !value && (
          <p className="text-[11px] text-muted-foreground text-center">
            اسحب وأسقط الصورة هنا أو انقر «رفع»
          </p>
        )}
      </div>

      {/* ── خطأ ── */}
      {error && (
        <div className="flex items-start gap-2 rounded-lg bg-destructive/10 border border-destructive/20 px-3 py-2.5 text-xs text-destructive">
          <AlertTriangle className="h-3.5 w-3.5 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold mb-0.5">النسبة غير مطابقة</p>
            <p>{error}</p>
          </div>
        </div>
      )}

      {/* ── معاينة + المنطقة الآمنة ── */}
      {value && !error && (
        <div
          className="relative rounded-lg overflow-hidden border border-border bg-muted shadow-sm"
          style={{ aspectRatio: `${spec.w}/${spec.h}` }}
        >
          <img src={value} alt="معاينة" className="absolute inset-0 w-full h-full object-cover object-center" />

          {/* أبعاد الصورة المرفوعة */}
          {imgDims && (
            <div className="absolute top-1.5 right-1.5 bg-black/60 text-white text-[9px] font-mono px-1.5 py-0.5 rounded backdrop-blur-sm">
              {imgDims.w}×{imgDims.h}
            </div>
          )}

          {/* ✅ شارة */}
          <div className="absolute top-1.5 left-1.5 bg-green-500/90 text-white text-[9px] px-1.5 py-0.5 rounded flex items-center gap-0.5 backdrop-blur-sm">
            ✓ مطابقة
          </div>

          {/* المنطقة الآمنة */}
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute border-2 border-dashed border-white/60 rounded" style={{ inset: "10% 15%" }} />
            <div className="absolute bottom-[10%] right-[15%] bg-black/50 text-white text-[9px] px-1 py-0.5 rounded">
              منطقة آمنة
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── معاينة مباشرة (Desktop / Tablet / Mobile) ──────────────────────────────

type DeviceTab = "desktop" | "tablet" | "mobile";

function LivePreview({
  adType,
  desktopSrc,
  mobileSrc,
  title,
}: {
  adType: AdType;
  desktopSrc: string;
  mobileSrc: string;
  title: string;
}) {
  const [device, setDevice] = useState<DeviceTab>("desktop");

  const isPremium = adType === "premium";

  // النسبة حسب الجهاز
  const ratio = device === "desktop" && isPremium ? "21/9" : "16/9";
  // الصورة حسب الجهاز
  const src   = device === "desktop" ? (desktopSrc || mobileSrc) : (mobileSrc || desktopSrc);

  const devices: { key: DeviceTab; label: string; icon: typeof Monitor }[] = [
    { key: "desktop", label: "ديسكتوب", icon: Monitor },
    { key: "tablet",  label: "تابلت",   icon: Tablet },
    { key: "mobile",  label: "جوال",    icon: Smartphone },
  ];

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <Label className="text-sm font-semibold">معاينة مباشرة</Label>
        <div className="flex rounded-lg border border-border overflow-hidden">
          {devices.map(d => (
            <button
              key={d.key}
              type="button"
              onClick={() => setDevice(d.key)}
              className={cn(
                "flex items-center gap-1.5 px-2.5 py-1.5 text-xs transition-colors",
                device === d.key
                  ? "bg-accent text-white"
                  : "text-muted-foreground hover:bg-muted"
              )}
            >
              <d.icon className="h-3.5 w-3.5" />
              {d.label}
            </button>
          ))}
        </div>
      </div>

      <div
        className={cn(
          "relative overflow-hidden rounded-xl border border-border bg-neutral-200 mx-auto transition-all",
          device === "mobile"  && "max-w-[280px]",
          device === "tablet"  && "max-w-[480px]",
          device === "desktop" && "w-full"
        )}
        style={{ aspectRatio: ratio }}
      >
        {src ? (
          <>
            <img
              src={src}
              alt="معاينة"
              className="absolute inset-0 w-full h-full object-cover object-center"
            />
            {/* Safe Area */}
            <div className="absolute pointer-events-none" style={{ inset: "10% 15%" }}>
              <div className="w-full h-full border-2 border-dashed border-white/60 rounded" />
              <div className="absolute bottom-1 right-1 bg-black/50 text-white text-[9px] px-1 py-0.5 rounded">
                منطقة آمنة
              </div>
            </div>
            {/* عنوان */}
            {title && (
              <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/70 to-transparent px-3 pb-2 pt-8">
                <p className="text-white text-xs font-semibold text-right line-clamp-1">{title}</p>
              </div>
            )}
          </>
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-muted-foreground/40">
            <ImageIcon className="h-8 w-8" />
            <span className="text-xs">ارفع صورة لرؤية المعاينة</span>
          </div>
        )}
      </div>

      <div className="text-xs text-muted-foreground text-center">
        {isPremium
          ? device === "desktop" ? "نسبة 21:9 على الديسكتوب" : "نسبة 16:9 على الجوال والتابلت"
          : "نسبة 16:9 على جميع الشاشات"
        }
      </div>
    </div>
  );
}

// ─── بيانات الإعلان الافتراضية ──────────────────────────────────────────────

type AdForm = Omit<Ad, "id" | "views" | "clicks">;

function emptyAd(type: AdType = "secondary"): AdForm {
  return {
    type,
    desktopImageUrl: "",
    mobileImageUrl: "",
    linkUrl: "",
    title: "",
    order: 1,
    duration: 6,
    startDate: "",
    endDate: "",
    active: true,
  };
}

// ─── نافذة الإضافة / التعديل ─────────────────────────────────────────────────

function AdDialog({
  open,
  title,
  initial,
  onSave,
  onClose,
}: {
  open: boolean;
  title: string;
  initial: AdForm;
  onSave: (f: AdForm) => void;
  onClose: () => void;
}) {
  const [form, setForm] = useState<AdForm>(initial);
  const patch = (p: Partial<AdForm>) => setForm(v => ({ ...v, ...p }));

  // إعادة التهيئة عند فتح النافذة
  const prevOpen = useRef(false);
  if (open && !prevOpen.current) { setForm(initial); }
  prevOpen.current = open;

  const isPremium = form.type === "premium";
  const desktopSpec = isPremium ? RATIO_SPECS.premium_desktop : RATIO_SPECS.secondary_desktop;
  const mobileSpec  = isPremium ? RATIO_SPECS.premium_mobile  : RATIO_SPECS.secondary_mobile;

  const [desktopErr, setDesktopErr] = useState<string>();

  const handleSave = () => {
    if (!form.desktopImageUrl.trim()) return;
    if (desktopErr) return;
    onSave(form);
  };

  return (
    <Dialog open={open} onOpenChange={v => { if (!v) onClose(); }}>
      <DialogContent
        className="max-w-2xl max-h-[92vh] overflow-y-auto"
        dir="rtl"
      >
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-2">

          {/* نوع الإعلان */}
          <div className="space-y-2">
            <Label className="text-sm font-semibold">نوع الإعلان</Label>
            <div className="grid grid-cols-2 gap-3">
              {(["premium", "secondary"] as AdType[]).map(t => (
                <button
                  key={t}
                  type="button"
                  onClick={() => patch({ type: t })}
                  className={cn(
                    "rounded-xl border-2 p-3 text-right transition-all",
                    form.type === t
                      ? "border-accent bg-accent/5"
                      : "border-border hover:border-muted-foreground/40"
                  )}
                >
                  <div className="font-semibold text-sm mb-0.5">
                    {t === "premium" ? "🏆 Premium" : "📌 Secondary"}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {t === "premium"
                      ? "إعلان رئيسي — عرض كامل — نسبة 21:9"
                      : "إعلان ثانوي — أسفل الرئيسي — نسبة 16:9"
                    }
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div className="border-t border-border" />

          {/* رفع الصور */}
          <ImageUploader
            label={`صورة الديسكتوب ${isPremium ? "(21:9)" : "(16:9)"}`}
            sublabel={isPremium
              ? "الصورة الكبيرة تظهر على الحاسوب والشاشات الكبيرة"
              : "تظهر على جميع الأجهزة ما لم تُرفع صورة جوال"
            }
            value={form.desktopImageUrl}
            spec={desktopSpec}
            required
            onResult={(url, err) => {
              patch({ desktopImageUrl: url || "" });
              setDesktopErr(err);
            }}
          />

          <ImageUploader
            label={`صورة الجوال (16:9) — اختياري`}
            sublabel="إذا لم تُرفع، ستُستخدم صورة الديسكتوب تلقائياً"
            value={form.mobileImageUrl || ""}
            spec={mobileSpec}
            onResult={(url) => patch({ mobileImageUrl: url || "" })}
          />

          <div className="border-t border-border" />

          {/* معاينة مباشرة */}
          <LivePreview
            adType={form.type}
            desktopSrc={form.desktopImageUrl}
            mobileSrc={form.mobileImageUrl || ""}
            title={form.title || ""}
          />

          <div className="border-t border-border" />

          {/* بيانات الإعلان */}
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label>العنوان <span className="text-muted-foreground text-xs">(اختياري — يظهر فوق الصورة)</span></Label>
              <Input
                placeholder="مثال: مجمع سكني فاخر — الساحل الشمالي"
                value={form.title ?? ""}
                onChange={e => patch({ title: e.target.value })}
              />
            </div>

            <div className="space-y-1.5">
              <Label>رابط الإعلان <span className="text-muted-foreground text-xs">(اختياري)</span></Label>
              <div className="flex gap-2">
                <Input
                  placeholder="https://..."
                  value={form.linkUrl ?? ""}
                  onChange={e => patch({ linkUrl: e.target.value })}
                  className="flex-1"
                />
                {form.linkUrl && (
                  <Button type="button" variant="outline" size="icon" asChild>
                    <a href={form.linkUrl} target="_blank" rel="noopener noreferrer"><ExternalLink className="h-4 w-4" /></a>
                  </Button>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="flex items-center gap-1.5">
                  <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                  مدة الظهور (ثانية)
                </Label>
                <Input
                  type="number" min={2} max={60}
                  value={form.duration ?? 6}
                  onChange={e => patch({ duration: Number(e.target.value) || 0 })}
                  onBlur={e => patch({ duration: Math.max(2, Math.min(60, Number(e.target.value) || 2)) })}
                />
              </div>
              <div className="space-y-1.5">
                <Label>ترتيب الظهور</Label>
                <Input
                  type="number" min={1}
                  value={form.order}
                  onChange={e => patch({ order: Number(e.target.value) })}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>تاريخ البداية <span className="text-muted-foreground text-xs">(اختياري)</span></Label>
                <Input type="date" value={form.startDate ?? ""} onChange={e => patch({ startDate: e.target.value })} />
              </div>
              <div className="space-y-1.5">
                <Label>تاريخ الانتهاء <span className="text-muted-foreground text-xs">(اختياري)</span></Label>
                <Input type="date" value={form.endDate ?? ""} onChange={e => patch({ endDate: e.target.value })} />
              </div>
            </div>

            <div className="flex items-center gap-3 pt-1">
              <Switch id="dlg-active" checked={form.active} onCheckedChange={v => patch({ active: v })} />
              <Label htmlFor="dlg-active" className="cursor-pointer">
                {form.active ? "مفعّل — يظهر للزوار فوراً" : "معطّل — مخفي عن الزوار"}
              </Label>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>إلغاء</Button>
          <Button
            className="bg-accent text-white hover:bg-accent/90"
            disabled={!form.desktopImageUrl.trim() || !!desktopErr}
            onClick={handleSave}
          >
            حفظ
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ─── الصفحة الرئيسية ──────────────────────────────────────────────────────────

export default function Ads() {
  const { settings, addAd, updateAd, deleteAd, reorderAds } = useData();
  const { toast } = useToast();
  const [, navigate] = useLocation();

  const ads = [...(settings.ads ?? [])].sort((a, b) => a.order - b.order);

  const [showAdd,      setShowAdd]      = useState(false);
  const [editTarget,   setEditTarget]   = useState<Ad | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Ad | null>(null);
  const [addType,      setAddType]      = useState<AdType>("secondary");

  // ─── Drag & Drop ──────────────────────────────────────────────────────────
  const dragIdx = useRef<number | null>(null);
  const [dragOver, setDragOver] = useState<number | null>(null);

  const onDragStart = (i: number) => { dragIdx.current = i; };
  const onDragOver  = (e: React.DragEvent, i: number) => { e.preventDefault(); setDragOver(i); };
  const onDrop      = (e: React.DragEvent, dropIdx: number) => {
    e.preventDefault();
    if (dragIdx.current === null || dragIdx.current === dropIdx) { setDragOver(null); return; }
    const reordered = [...ads];
    const [moved]   = reordered.splice(dragIdx.current, 1);
    reordered.splice(dropIdx, 0, moved);
    // تحديث الترتيب دفعةً واحدة في استدعاء settings واحد
    reorderAds(reordered);
    dragIdx.current = null;
    setDragOver(null);
  };
  const onDragEnd = () => { dragIdx.current = null; setDragOver(null); };

  // ─── حفظ جديد ──────────────────────────────────────────────────────────
  const handleAdd = useCallback((form: Omit<Ad, "id" | "views" | "clicks">) => {
    addAd({ ...form, views: 0, clicks: 0, order: ads.length + 1 });
    setShowAdd(false);
    toast({ title: "تم إضافة الإعلان ✓" });
  }, [addAd, ads.length, toast]);

  // ─── تعديل ────────────────────────────────────────────────────────────────
  const handleEdit = useCallback((form: Omit<Ad, "id" | "views" | "clicks">) => {
    if (!editTarget) return;
    updateAd(editTarget.id, form);
    setEditTarget(null);
    toast({ title: "تم تحديث الإعلان ✓" });
  }, [editTarget, updateAd, toast]);

  // ─── حذف ──────────────────────────────────────────────────────────────────
  const handleDelete = () => {
    if (!deleteTarget) return;
    deleteAd(deleteTarget.id);
    setDeleteTarget(null);
    toast({ title: "تم حذف الإعلان" });
  };

  const handleToggle = (ad: Ad) => updateAd(ad.id, { active: !ad.active });

  // ─── إحصائيات إجمالية ────────────────────────────────────────────────────
  const totalViews  = ads.reduce((s, a) => s + (a.views ?? 0), 0);
  const totalClicks = ads.reduce((s, a) => s + (a.clicks ?? 0), 0);
  const avgCTR      = totalViews > 0 ? ((totalClicks / totalViews) * 100).toFixed(1) : "0.0";

  return (
    <AdminLayout>
      <div className="space-y-6" dir="rtl">

        {/* ─── رأس الصفحة ─── */}
        <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
          <div>
            <h1 className="text-2xl font-bold">إدارة الإعلانات</h1>
            <p className="text-muted-foreground mt-1 text-sm">
              {ads.length} إعلان — {ads.filter(a => getAdStatus(a) === "active").length} نشط
            </p>
          </div>
          <div className="flex gap-2 shrink-0">
            <Button
              variant="outline"
              className="gap-2"
              onClick={() => { setAddType("secondary"); setShowAdd(true); }}
            >
              <Plus className="h-4 w-4" /> Secondary
            </Button>
            <Button
              className="gap-2 bg-accent text-white hover:bg-accent/90"
              onClick={() => { setAddType("premium"); setShowAdd(true); }}
            >
              <Plus className="h-4 w-4" /> Premium
            </Button>
          </div>
        </div>

        {/* ─── بطاقات الإحصائيات ─── */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: "المشاهدات", value: totalViews.toLocaleString(), icon: Eye,              color: "text-blue-600" },
            { label: "النقرات",   value: totalClicks.toLocaleString(), icon: MousePointerClick, color: "text-green-600" },
            { label: "معدّل النقر",value: `${avgCTR}%`,               icon: TrendingUp,        color: "text-accent" },
          ].map(s => (
            <div key={s.label} className="rounded-xl border border-border bg-card p-4 flex items-center gap-3">
              <s.icon className={cn("h-5 w-5 shrink-0", s.color)} />
              <div>
                <p className="text-xs text-muted-foreground">{s.label}</p>
                <p className="text-lg font-bold leading-tight">{s.value}</p>
              </div>
            </div>
          ))}
        </div>

        {/* ─── شرح الأنواع ─── */}
        <div className="rounded-xl border border-border bg-muted/20 p-4 space-y-2 text-sm">
          <p className="font-semibold">كيف تعمل الإعلانات؟</p>
          <div className="space-y-1.5 text-muted-foreground text-[13px] leading-relaxed">
            <p>🏆 <strong className="text-foreground">Premium (21:9):</strong> إعلان رئيسي بعرض كامل — يدور تلقائياً إذا وُجد أكثر من إعلان Premium نشط.</p>
            <p>📌 <strong className="text-foreground">Secondary (16:9):</strong> إعلانان أسفل الرئيسي جنباً إلى جنب — على الجوال تظهر فوق بعض.</p>
            <p>📐 <strong className="text-foreground">الصور:</strong> يجب أن تطابق النسبة المطلوبة (±3%) وإلا لن يُقبل الرفع.</p>
            <p>📱 <strong className="text-foreground">صورة الجوال:</strong> اختياري — إذا لم تُرفع، ستُستخدم صورة الديسكتوب تلقائياً مع قص جانبي طفيف.</p>
            <p>🔀 <strong className="text-foreground">الترتيب:</strong> اسحب الإعلانات لتغيير ترتيبها.</p>
          </div>
        </div>

        {/* ─── جدول الإعلانات ─── */}
        {ads.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-muted/20 py-20 gap-3">
            <ImageIcon className="h-12 w-12 text-muted-foreground/20" />
            <p className="text-muted-foreground font-medium">لا توجد إعلانات بعد</p>
            <div className="flex gap-2 mt-1">
              <Button variant="outline" className="gap-2" onClick={() => { setAddType("secondary"); setShowAdd(true); }}>
                <Plus className="h-4 w-4" /> أضف Secondary
              </Button>
              <Button className="gap-2 bg-accent text-white hover:bg-accent/90" onClick={() => { setAddType("premium"); setShowAdd(true); }}>
                <Plus className="h-4 w-4" /> أضف Premium
              </Button>
            </div>
          </div>
        ) : (
          <div className="rounded-xl border border-border overflow-hidden">
            {/* رأس الجدول */}
            <div className="hidden md:grid bg-muted/50 px-4 py-2.5 text-xs font-semibold text-muted-foreground border-b border-border"
              style={{ gridTemplateColumns: "2rem 5rem 1fr 6rem 7rem 5rem 5rem 5rem 7rem" }}>
              <span />
              <span>صورة</span>
              <span>الإعلان</span>
              <span className="text-center">النوع</span>
              <span className="text-center">الحالة</span>
              <span className="text-center">مشاهدات</span>
              <span className="text-center">نقرات</span>
              <span className="text-center">CTR</span>
              <span className="text-center">إجراءات</span>
            </div>

            {/* صفوف الجدول */}
            <div>
              {ads.map((ad, idx) => {
                const status    = getAdStatus(ad);
                const cfg       = STATUS_CONFIG[status];
                const StatusIcon = cfg.icon;
                const ctr       = (ad.views ?? 0) > 0
                  ? (((ad.clicks ?? 0) / (ad.views ?? 1)) * 100).toFixed(1) + "%"
                  : "—";
                const thumb = ad.desktopImageUrl || ad.imageUrl || "";

                return (
                  <div
                    key={ad.id}
                    draggable
                    onDragStart={() => onDragStart(idx)}
                    onDragOver={e  => onDragOver(e, idx)}
                    onDrop={e      => onDrop(e, idx)}
                    onDragEnd={onDragEnd}
                    className={cn(
                      "grid items-center gap-3 px-4 py-3 border-b border-border last:border-b-0 transition-colors",
                      "grid-cols-[2rem_1fr] md:grid-cols-[2rem_5rem_1fr_6rem_7rem_5rem_5rem_5rem_7rem]",
                      dragOver === idx && "bg-accent/5 border-accent/30",
                      !ad.active && "opacity-60"
                    )}
                  >
                    {/* مقبض السحب */}
                    <div className="cursor-grab active:cursor-grabbing text-muted-foreground/40 hover:text-muted-foreground transition-colors">
                      <GripVertical className="h-5 w-5" />
                    </div>

                    {/* الصورة المصغرة */}
                    <div className="hidden md:block rounded-lg overflow-hidden bg-muted aspect-video">
                      {thumb
                        ? <img src={thumb} alt="" className="w-full h-full object-cover" loading="lazy" />
                        : <div className="w-full h-full flex items-center justify-center"><ImageIcon className="h-4 w-4 text-muted-foreground/30" /></div>
                      }
                    </div>

                    {/* معلومات */}
                    <div className="min-w-0">
                      <div className="flex items-start gap-2">
                        {/* الصورة على الجوال */}
                        <div className="md:hidden flex-shrink-0 rounded-lg overflow-hidden bg-muted w-14 h-10">
                          {thumb
                            ? <img src={thumb} alt="" className="w-full h-full object-cover" loading="lazy" />
                            : <div className="w-full h-full flex items-center justify-center"><ImageIcon className="h-3 w-3 text-muted-foreground/30" /></div>
                          }
                        </div>
                        <div className="min-w-0">
                          {ad.title
                            ? <p className="font-semibold text-sm truncate">{ad.title}</p>
                            : <p className="text-sm text-muted-foreground italic">بدون عنوان</p>
                          }
                          {ad.linkUrl && (
                            <a href={ad.linkUrl} target="_blank" rel="noopener noreferrer"
                              className="text-xs text-accent hover:underline flex items-center gap-1 truncate mt-0.5">
                              <ExternalLink className="h-3 w-3 flex-shrink-0" />
                              <span className="truncate">{ad.linkUrl}</span>
                            </a>
                          )}
                          <div className="flex flex-wrap gap-2 mt-1 text-[11px] text-muted-foreground">
                            {ad.startDate && <span>من {ad.startDate}</span>}
                            {ad.endDate   && <span>حتى {ad.endDate}</span>}
                            <span className="flex items-center gap-0.5"><Clock className="h-2.5 w-2.5" />{ad.duration}ث</span>
                          </div>
                        </div>
                      </div>
                      {/* على الجوال: النوع والحالة */}
                      <div className="md:hidden flex gap-2 mt-2">
                        <Badge variant="outline" className={cn("text-[10px]", ad.type === "premium" ? "border-yellow-300 text-yellow-700 bg-yellow-50" : "border-blue-300 text-blue-700 bg-blue-50")}>
                          {ad.type === "premium" ? "🏆 Premium" : "📌 Secondary"}
                        </Badge>
                        <span className={cn("inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full border", cfg.color)}>
                          <StatusIcon className="h-3 w-3" />{cfg.label}
                        </span>
                      </div>
                    </div>

                    {/* النوع */}
                    <div className="hidden md:flex justify-center">
                      <Badge variant="outline" className={cn("text-xs", ad.type === "premium" ? "border-yellow-300 text-yellow-700 bg-yellow-50" : "border-blue-300 text-blue-700 bg-blue-50")}>
                        {ad.type === "premium" ? "🏆 Premium" : "📌 Secondary"}
                      </Badge>
                    </div>

                    {/* الحالة */}
                    <div className="hidden md:flex justify-center">
                      <span className={cn("inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full border", cfg.color)}>
                        <StatusIcon className="h-3 w-3" />{cfg.label}
                      </span>
                    </div>

                    {/* مشاهدات */}
                    <div className="hidden md:flex justify-center text-sm font-medium">
                      {(ad.views ?? 0).toLocaleString()}
                    </div>

                    {/* نقرات */}
                    <div className="hidden md:flex justify-center text-sm font-medium">
                      {(ad.clicks ?? 0).toLocaleString()}
                    </div>

                    {/* CTR */}
                    <div className="hidden md:flex justify-center text-sm font-medium">
                      {ctr}
                    </div>

                    {/* إجراءات */}
                    <div className="flex items-center gap-1 md:justify-center flex-wrap">
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-blue-600 hover:text-blue-700 hover:bg-blue-50" title="إحصائيات" onClick={() => navigate(`/admin/ads/${ad.id}/analytics`)}>
                        <BarChart2 className="h-3.5 w-3.5" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8" title={ad.active ? "تعطيل" : "تفعيل"} onClick={() => handleToggle(ad)}>
                        {ad.active ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8" title="تعديل" onClick={() => setEditTarget(ad)}>
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive" title="حذف" onClick={() => setDeleteTarget(ad)}>
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* ─── نافذة الإضافة ─── */}
      <AdDialog
        open={showAdd}
        title="إضافة إعلان جديد"
        initial={emptyAd(addType)}
        onSave={form => handleAdd(form as Omit<Ad, "id" | "views" | "clicks">)}
        onClose={() => setShowAdd(false)}
      />

      {/* ─── نافذة التعديل ─── */}
      {editTarget && (
        <AdDialog
          open={!!editTarget}
          title="تعديل الإعلان"
          initial={{
            type:            editTarget.type ?? "secondary",
            desktopImageUrl: editTarget.desktopImageUrl || editTarget.imageUrl || "",
            mobileImageUrl:  editTarget.mobileImageUrl ?? "",
            linkUrl:         editTarget.linkUrl   ?? "",
            title:           editTarget.title     ?? "",
            order:           editTarget.order,
            duration:        editTarget.duration  ?? 6,
            startDate:       editTarget.startDate ?? "",
            endDate:         editTarget.endDate   ?? "",
            active:          editTarget.active,
          }}
          onSave={form => handleEdit(form as Omit<Ad, "id" | "views" | "clicks">)}
          onClose={() => setEditTarget(null)}
        />
      )}

      {/* ─── تأكيد الحذف ─── */}
      <AlertDialog open={!!deleteTarget} onOpenChange={open => { if (!open) setDeleteTarget(null); }}>
        <AlertDialogContent dir="rtl">
          <AlertDialogHeader>
            <AlertDialogTitle>حذف الإعلان</AlertDialogTitle>
            <AlertDialogDescription>
              هل أنت متأكد من حذف{" "}
              <strong>{deleteTarget?.title || "هذا الإعلان"}</strong>؟
              لا يمكن التراجع عن هذا الإجراء.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>إلغاء</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
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
