import { useState, useRef, useCallback } from "react";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Save, UploadCloud, X, Star, Link as LinkIcon, Plus, Phone, Mail } from "lucide-react";
import { useParams, useLocation, Link } from "wouter";
import { useData, PropertyCategory, PropertyStatus } from "@/context/DataContext";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { SEED_SOURCES } from "@/data/seedSources";

import { FINISHING_OPTIONS as finishingOptions } from "@/lib/finishingOptions";

export default function PropertyForm() {
  const { regions, propertyTypes, addProperty, updateProperty, properties } = useData();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const params = useParams<{ id?: string }>();
  const isEdit = !!params.id;
  const existing = isEdit ? properties.find(p => p.id === params.id) : undefined;

  const [form, setForm] = useState({
    code: existing?.code ?? "",
    description: existing?.description ?? "",
    price: existing?.price ?? 0,
    area: existing?.area ?? 0,
    beds: existing?.beds ?? 0,
    baths: existing?.baths ?? 0,
    floors: existing?.floors ?? 0,
    floor: existing?.floor ?? 0,
    finishing: existing?.finishing ?? "",
    view: existing?.view ?? "",
    typeId: existing?.typeId ?? "",
    regionId: existing?.regionId ?? "",
    category: existing?.category ?? "sale" as PropertyCategory,
    status: existing?.status ?? "active" as PropertyStatus,
    featured: existing?.featured ?? false,
    agentType: existing?.agentType ?? "direct" as "direct" | "broker",
    videoUrl: existing?.videoUrl ?? "",
    externalUrl: existing?.externalUrl ?? "",
    mapsUrl: existing?.mapsUrl ?? "",
    unitType: existing?.unitType ?? "",
    subArea: existing?.subArea ?? "",
    layout: existing?.layout ?? "",
    master: existing?.master ?? "",
    elevator: existing?.elevator ?? "",
    floorText: existing?.floorText ?? "",
    location: existing?.location ?? "",
    source: existing?.source ?? (existing?.code ? SEED_SOURCES[existing.code] ?? "" : ""),
    sourcePhones: existing?.sourcePhones ?? [""],
    sourceEmail: existing?.sourceEmail ?? "",
    sourceLocation: existing?.sourceLocation ?? "",
    sourceNotes: existing?.sourceNotes ?? "",
  });
  const [images, setImages] = useState<string[]>(existing?.images ?? []);
  const [dragging, setDragging] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFiles = useCallback((files: FileList | null) => {
    if (!files) return;
    Array.from(files).slice(0, 20 - images.length).forEach(file => {
      if (!file.type.match(/image\/(jpeg|png|webp)/)) return;
      if (file.size > 8 * 1024 * 1024) { toast({ title: "الصورة كبيرة جداً (الحد 8MB)", variant: "destructive" }); return; }
      const reader = new FileReader();
      reader.onload = ev => setImages(prev => [...prev, ev.target?.result as string]);
      reader.readAsDataURL(file);
    });
    if (fileRef.current) fileRef.current.value = "";
  }, [images.length, toast]);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault(); setDragging(false);
    handleFiles(e.dataTransfer.files);
  };

  const handleSave = () => {
    if (!form.code.trim() || !form.typeId || !form.regionId) {
      toast({ title: "يرجى ملء الحقول المطلوبة (الكود، النوع، المنطقة)", variant: "destructive" });
      return;
    }
    const payload = { ...form, title: form.code.trim(), images };
    if (isEdit && params.id) {
      updateProperty(params.id, payload);
    } else {
      addProperty(payload);
    }
    toast({ title: "تم الحفظ بنجاح", description: isEdit ? "تم تحديث بيانات العقار." : "تم إضافة العقار الجديد." });
    setLocation("/admin/properties");
  };

  const set = <K extends keyof typeof form>(k: K, v: typeof form[K]) => setForm(p => ({ ...p, [k]: v }));

  return (
    <AdminLayout>
      <div className="space-y-6 max-w-5xl">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">{isEdit ? "تعديل عقار" : "إضافة عقار جديد"}</h1>
            <p className="text-muted-foreground mt-1 text-sm">أدخل تفاصيل العقار لنشره على المنصة</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" asChild><Link href="/admin/properties">إلغاء</Link></Button>
            <Button className="bg-primary text-primary-foreground hover:bg-primary/90" onClick={handleSave}>
              <Save className="ml-2 h-4 w-4" />حفظ ونشر
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-6">
            {/* Basic info */}
            <Card>
              <CardHeader><CardTitle className="text-sm">المعلومات الأساسية</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>كود العقار *</Label>
                  <Input value={form.code} onChange={e => set("code", e.target.value)} placeholder="مثال: S50" dir="ltr" className="text-right" />
                </div>
                <div className="space-y-2">
                  <Label>وصف العقار</Label>
                  <Textarea value={form.description} onChange={e => set("description", e.target.value)} placeholder="اكتب وصفاً مفصلاً..." className="min-h-[100px]" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>السعر (EGP)</Label>
                    <Input type="number" value={form.price || ""} onChange={e => set("price", Number(e.target.value))} placeholder="0" />
                  </div>
                  <div className="space-y-2">
                    <Label>المساحة (م²)</Label>
                    <Input type="number" value={form.area || ""} onChange={e => set("area", Number(e.target.value))} placeholder="0" />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Rooms & extras */}
            <Card>
              <CardHeader><CardTitle className="text-sm">المرافق والتفاصيل</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label>غرف النوم</Label>
                    <Input type="number" value={form.beds || ""} onChange={e => set("beds", Number(e.target.value))} placeholder="0" />
                  </div>
                  <div className="space-y-2">
                    <Label>الحمامات</Label>
                    <Input type="number" value={form.baths || ""} onChange={e => set("baths", Number(e.target.value))} placeholder="0" />
                  </div>
                  <div className="space-y-2">
                    <Label>عدد طوابق العقار</Label>
                    <Input type="number" value={form.floors || ""} onChange={e => set("floors", Number(e.target.value))} placeholder="0" />
                  </div>
                  <div className="space-y-2">
                    <Label>الدور</Label>
                    <Input type="number" value={form.floor || ""} onChange={e => set("floor", Number(e.target.value))} placeholder="0" />
                  </div>
                  <div className="space-y-2">
                    <Label>التشطيب</Label>
                    <Select value={form.finishing} onValueChange={v => set("finishing", v)}>
                      <SelectTrigger><SelectValue placeholder="اختر" /></SelectTrigger>
                      <SelectContent>{finishingOptions.map(o => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>الفيو</Label>
                    <Input value={form.view} onChange={e => set("view", e.target.value)} placeholder="بحري / قبلي / حديقة..." />
                  </div>
                  <div className="space-y-2">
                    <Label>نوع الطابق</Label>
                    <Input value={form.unitType} onChange={e => set("unitType", e.target.value)} placeholder="أرضي / متكرر / أخير..." />
                  </div>
                  <div className="space-y-2">
                    <Label>الواجهة</Label>
                    <Input value={form.floorText} onChange={e => set("floorText", e.target.value)} placeholder="أمامي / خلفي / ركني..." />
                  </div>
                  <div className="space-y-2">
                    <Label>التوزيع</Label>
                    <Input value={form.layout} onChange={e => set("layout", e.target.value)} placeholder="مثال: 3 غرف + 2 حمام" />
                  </div>
                  <div className="space-y-2">
                    <Label>ماستر</Label>
                    <Input value={form.master} onChange={e => set("master", e.target.value)} placeholder="نعم / ماستر + دريسنج..." />
                  </div>
                  <div className="space-y-2">
                    <Label>أسانسير</Label>
                    <Input value={form.elevator} onChange={e => set("elevator", e.target.value)} placeholder="نعم / لا" />
                  </div>
                  <div className="space-y-2 col-span-2 sm:col-span-3">
                    <Label>الموقع</Label>
                    <Input value={form.location} onChange={e => set("location", e.target.value)} placeholder="وصف الموقع التفصيلي..." />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Images */}
            <Card>
              <CardHeader><CardTitle className="text-sm">الصور ({images.length}/20)</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                {images.length > 0 && (
                  <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
                    {images.map((img, idx) => (
                      <div key={idx} className="relative rounded-lg overflow-hidden aspect-square bg-muted group">
                        <img src={img} alt="" className="w-full h-full object-cover" />
                        {idx === 0 && <div className="absolute bottom-0 inset-x-0 bg-accent/80 text-white text-[9px] font-bold text-center py-0.5">رئيسية</div>}
                        <button type="button" aria-label="حذف الصورة" onClick={() => setImages(p => p.filter((_, i) => i !== idx))}
                          className="absolute top-1.5 left-1.5 w-6 h-6 rounded-full bg-destructive text-white flex items-center justify-center shadow-md ring-2 ring-white/70 hover:bg-destructive/90 active:scale-95 transition">
                          <X className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
                <div
                  className={cn("border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all",
                    dragging ? "border-accent bg-accent/5" : "border-border hover:border-accent/60 hover:bg-muted/30")}
                  onDragOver={e => { e.preventDefault(); setDragging(true); }}
                  onDragLeave={() => setDragging(false)}
                  onDrop={handleDrop}
                  onClick={() => fileRef.current?.click()}
                >
                  <UploadCloud className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                  <p className="text-sm font-medium text-foreground mb-1">اسحب وأفلت الصور هنا أو انقر للاختيار</p>
                  <p className="text-xs text-muted-foreground">JPG, PNG, WEBP — حد أقصى 8MB لكل صورة</p>
                </div>
                <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp" multiple className="hidden"
                  onChange={e => handleFiles(e.target.files)} />
              </CardContent>
            </Card>

            {/* Links */}
            <Card>
              <CardHeader><CardTitle className="text-sm flex items-center gap-2"><LinkIcon className="h-4 w-4 text-accent" />روابط إضافية</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>رابط فيديو خارجي</Label>
                  <Input value={form.videoUrl} onChange={e => set("videoUrl", e.target.value)} placeholder="أي رابط — YouTube، TikTok، Telegram، وغيره" dir="ltr" />
                </div>
                <div className="space-y-2">
                  <Label>رابط خارجي للعقار</Label>
                  <Input value={form.externalUrl} onChange={e => set("externalUrl", e.target.value)} placeholder="أي رابط خارجي للعقار" dir="ltr" />
                </div>
                <div className="space-y-2">
                  <Label>رابط الموقع على الخريطة</Label>
                  <Input value={form.mapsUrl} onChange={e => set("mapsUrl", e.target.value)} placeholder="رابط Google Maps أو أي خريطة" dir="ltr" />
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            {/* Classification */}
            <Card>
              <CardHeader><CardTitle className="text-sm">التصنيف</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>فئة العقار</Label>
                  <Select value={form.category} onValueChange={(v: PropertyCategory) => set("category", v)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="sale">للبيع</SelectItem>
                      <SelectItem value="rent">للإيجار</SelectItem>
                      <SelectItem value="furnished">مفروش</SelectItem>
                      <SelectItem value="administrative">إداري</SelectItem>
                      <SelectItem value="medical">طبي</SelectItem>
                      <SelectItem value="commercial">تجاري</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>نوع العقار *</Label>
                  <Select value={form.typeId} onValueChange={v => set("typeId", v)}>
                    <SelectTrigger><SelectValue placeholder="اختر النوع" /></SelectTrigger>
                    <SelectContent>{propertyTypes.filter(t => t.active).map(t => <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>المنطقة *</Label>
                  <Select value={form.regionId} onValueChange={v => set("regionId", v)}>
                    <SelectTrigger><SelectValue placeholder="اختر المنطقة" /></SelectTrigger>
                    <SelectContent>{regions.filter(r => r.active).map(r => <SelectItem key={r.id} value={r.id}>{r.name}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>المنطقة الفرعية</Label>
                  <Input value={form.subArea} onChange={e => set("subArea", e.target.value)} placeholder="مثال: المنطقة ١ / B7" />
                </div>
                <div className="space-y-2">
                  <Label>الحالة</Label>
                  <Select value={form.status} onValueChange={(v: PropertyStatus) => set("status", v)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">نشط</SelectItem>
                      <SelectItem value="listed">معروض</SelectItem>
                      <SelectItem value="draft">مسودة</SelectItem>
                      <SelectItem value="sold">مباعة</SelectItem>
                      <SelectItem value="rented">مؤجر</SelectItem>
                      <SelectItem value="reserved">محجوز</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Featured + Agent Type */}
            <Card>
              <CardHeader><CardTitle className="text-sm flex items-center gap-2"><Star className="h-4 w-4 text-yellow-500" />خيارات إدارية</CardTitle></CardHeader>
              <CardContent className="space-y-5">
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-sm font-medium">عقار مميز</Label>
                    <p className="text-xs text-muted-foreground mt-0.5">يظهر في قسم العقارات المميزة</p>
                  </div>
                  <Switch
                    checked={form.featured}
                    onCheckedChange={v => set("featured", v)}
                    className="data-[state=checked]:bg-yellow-500"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm">نوع العرض</Label>
                  <Select value={form.agentType} onValueChange={(v: "direct" | "broker") => set("agentType", v)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="direct">مباشر</SelectItem>
                      <SelectItem value="broker">بروكر</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">يظهر للمدير فقط</p>
                </div>
                <div className="border-t pt-4 space-y-4">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">بيانات المصدر / التواصل</p>
                  <div className="space-y-2">
                    <Label className="text-sm">اسم المصدر</Label>
                    <Input value={form.source} onChange={e => set("source", e.target.value)} placeholder="بروكر / مالك / اسم المصدر..." />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm flex items-center gap-1.5">
                      <Phone className="h-3.5 w-3.5" />
                      أرقام التواصل
                    </Label>
                    <div className="space-y-2">
                      {form.sourcePhones.map((ph, i) => (
                        <div key={i} className="flex gap-2">
                          <Input
                            dir="ltr"
                            className="flex-1 text-right"
                            placeholder="+20 10 0000 0000"
                            value={ph}
                            onChange={e => {
                              const updated = [...form.sourcePhones];
                              updated[i] = e.target.value;
                              set("sourcePhones", updated);
                            }}
                          />
                          {form.sourcePhones.length > 1 && (
                            <button
                              type="button"
                              onClick={() => set("sourcePhones", form.sourcePhones.filter((_, idx) => idx !== i))}
                              className="w-9 h-9 flex items-center justify-center rounded-md border border-border text-muted-foreground hover:text-destructive hover:border-destructive transition-colors flex-shrink-0"
                            >
                              <X className="h-4 w-4" />
                            </button>
                          )}
                        </div>
                      ))}
                      {form.sourcePhones.length < 5 && (
                        <button
                          type="button"
                          onClick={() => set("sourcePhones", [...form.sourcePhones, ""])}
                          className="w-full flex items-center justify-center gap-1.5 h-9 rounded-md border border-dashed border-border text-sm text-muted-foreground hover:text-accent hover:border-accent transition-colors"
                        >
                          <Plus className="h-4 w-4" />
                          أضف رقم
                        </button>
                      )}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm flex items-center gap-1.5">
                      <Mail className="h-3.5 w-3.5" />
                      البريد الإلكتروني
                    </Label>
                    <Input
                      dir="ltr"
                      className="text-right"
                      type="email"
                      placeholder="example@mail.com"
                      value={form.sourceEmail}
                      onChange={e => set("sourceEmail", e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm flex items-center gap-1.5">
                      <LinkIcon className="h-3.5 w-3.5" />
                      رابط الموقع (Location)
                    </Label>
                    <Input
                      dir="ltr"
                      className="text-right text-xs"
                      placeholder="https://maps.google.com/..."
                      value={form.sourceLocation}
                      onChange={e => set("sourceLocation", e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm">ملاحظات إضافية</Label>
                    <Textarea
                      rows={3}
                      placeholder="تفاصيل إضافية عن المصدر أو موقع العقار..."
                      value={form.sourceNotes}
                      onChange={e => set("sourceNotes", e.target.value)}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">خاص بالإدارة — لا يظهر للزوّار</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
