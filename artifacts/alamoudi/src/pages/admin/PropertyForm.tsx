import { useState, useRef, useCallback } from "react";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Save, UploadCloud, X, Star, Link as LinkIcon, Plus, Phone, Mail, Camera, Play, Wand2, Sparkles, CheckCircle2, MessageSquare, Handshake, Bot, RefreshCw, ShieldCheck } from "lucide-react";
import { useParams, useLocation, Link } from "wouter";
import { useData, PropertyCategory, PropertyStatus } from "@/context/DataContext";
import { useToast } from "@/hooks/use-toast";
import { cn, formatNumber, toNumericString } from "@/lib/utils";
import { SEED_SOURCES } from "@/data/seedSources";
import { parsePropertyText } from "@/lib/aiPropertyParser";
import { parsePropertyWithGemini } from "@/lib/geminiApi";

import { useAuth } from "@/context/AuthContext";
import { checkUserPermission } from "@/lib/permissions";
import { ShieldAlert } from "lucide-react";

import { FINISHING_OPTIONS as finishingOptions } from "@/lib/finishingOptions";

export default function PropertyForm() {
  const { regions, propertyTypes, users, addProperty, updateProperty, properties, brokers } = useData();
  const { currentUser } = useAuth();
  const isAdmin = currentUser?.role === "admin";
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const params = useParams<{ id?: string }>();
  const isEdit = !!params.id;
  const existing = isEdit
    ? properties.find(
        p =>
          p.id === params.id ||
          p.code === params.id ||
          (p.code && params.id && p.code.toLowerCase() === params.id.toLowerCase()) ||
          (p.id && params.id && p.id.toLowerCase() === params.id.toLowerCase())
      )
    : undefined;
  const [aiText, setAiText] = useState("");
  const [aiParsedSummary, setAiParsedSummary] = useState<string | null>(null);
  const [aiLoading, setAiLoading] = useState(false);

  const canAddProperty = isAdmin || checkUserPermission(currentUser, "إدارة العقارات-إضافة عقار");
  const canEditProperty = isAdmin || checkUserPermission(currentUser, "إدارة العقارات-تعديل عقار");
  const isAuthorized = isEdit ? canEditProperty : canAddProperty;

  const apiKey = typeof window !== "undefined" ? localStorage.getItem("alm_ai_api_key") || "" : "";
  const aiModel = typeof window !== "undefined" ? localStorage.getItem("alm_ai_default_model") || "gemini-1.5-pro" : "gemini-1.5-pro";
  const isAiAgentActive = (() => {
    if (!apiKey.trim()) return false;
    try {
      const saved = localStorage.getItem("alm_ai_agents");
      if (!saved) return true;
      const parsedAgents = JSON.parse(saved);
      const ing = parsedAgents.find((a: any) => a.id === "ingestion-agent");
      return ing ? ing.active !== false : true;
    } catch {
      return true;
    }
  })();

  if (!isAuthorized) {
    return (
      <AdminLayout>
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-6 space-y-4">
          <div className="w-16 h-16 rounded-full bg-destructive/10 text-destructive flex items-center justify-center">
            <ShieldAlert className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold text-foreground">غير مصرح لك بالوصول</h2>
          <p className="text-sm text-muted-foreground max-w-md">
            {isEdit
              ? "ليس لديك صلاحية تعديل بيانات العقارات."
              : "ليس لديك صلاحية إضافة عقارات جديدة."}
          </p>
          <Button asChild className="mt-4 bg-accent text-accent-foreground">
            <Link href="/admin/properties">العودة لقائمة العقارات</Link>
          </Button>
        </div>
      </AdminLayout>
    );
  }

  const [form, setForm] = useState({
    code: existing?.code ?? "",
    description: existing?.description ?? "",
    price: existing?.price ?? 0,
    area: existing?.area ?? 0,
    beds: existing?.beds ?? 0,
    baths: existing?.baths ?? 0,
    floors: existing?.floors ?? 0,
    floor: existing?.floor !== undefined && existing?.floor !== null ? String(existing.floor) : "",
    finishing: existing?.finishing ?? "",
    view: existing?.view ?? "",
    typeId: existing?.typeId ?? "",
    regionId: existing?.regionId ?? "",
    category: (existing?.category ?? "residential") as PropertyCategory,
    listingType: (existing?.listingType ?? "sale") as "sale" | "rent" | "furnished",
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
    parking: existing?.parking ?? "",
    additionalFeatures: existing?.additionalFeatures ?? "",
    floorText: existing?.floorText ?? "",
    location: existing?.location ?? "",
    source: existing?.source ?? (existing?.code ? SEED_SOURCES[existing.code] ?? "" : ""),
    sourcePhones: existing?.sourcePhones ?? [""],
    sourceEmail: existing?.sourceEmail ?? "",
    sourceLocation: existing?.sourceLocation ?? "",
    sourceNotes: existing?.sourceNotes ?? "",
    assignedStaffId: existing?.assignedStaffId ?? "",
    brokerId: existing?.brokerId ?? "",
    coverPriority: existing?.coverPriority ?? "image",
  });
  const [images, setImages] = useState<string[]>(existing?.images ?? []);
  const [dragging, setDragging] = useState(false);
  const [saving, setSaving] = useState(false);
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

  const handleSave = async () => {
    if (!form.code.trim() || !form.typeId || !form.regionId) {
      toast({ title: "يرجى ملء الحقول المطلوبة (الكود، النوع، المنطقة)", variant: "destructive" });
      return;
    }
    if (saving) return;
    setSaving(true);
    const numericValue = (value: unknown) => {
      const parsed = Number(toNumericString(value));
      return Number.isFinite(parsed) ? parsed : 0;
    };
    const payload = {
      ...form,
      sourcePhones: form.sourcePhones.filter(ph => ph && ph.trim()),
      title: form.code.trim(),
      price: numericValue(form.price),
      area: numericValue(form.area),
      beds: numericValue(form.beds),
      baths: numericValue(form.baths),
      floors: numericValue(form.floors),
      floor: typeof form.floor === "string" ? form.floor.trim() : form.floor,
      images,
    };
    try {
      const targetId = existing?.id || params.id;
      const saved = isEdit && targetId
        ? await updateProperty(targetId, payload)
        : await addProperty(payload);
      if (!saved) return;
      toast({ title: "تم الحفظ بنجاح", description: isEdit ? "تم تحديث بيانات العقار." : "تم إضافة العقار الجديد." });
      setLocation("/admin/properties");
    } finally {
      setSaving(false);
    }
  };

  const set = <K extends keyof typeof form>(k: K, v: typeof form[K]) => setForm(p => ({ ...p, [k]: v }));
  const staffUsers = users.filter(user => user.role === "admin" || user.role === "agent");
  const staffLabel = (user: typeof staffUsers[number]) => {
    return user.name || (user.username ? `@${user.username}` : user.email);
  };

  const handleAiAutoFill = async () => {
    if (!aiText.trim()) {
      toast({ title: "يرجى لصق نص الإعلان أو الرسالة أولاً", variant: "destructive" });
      return;
    }
    setAiLoading(true);
    try {
      const staffList = staffUsers.map(u => ({ id: u.id, name: staffLabel(u) }));
      const regionsList = regions.map(r => ({ id: r.id, name: r.name }));
      const typesList = propertyTypes.map(t => ({ id: t.id, name: t.name }));

      const parsed = isAiAgentActive
        ? await parsePropertyWithGemini(aiText, apiKey, aiModel, regionsList, typesList, staffList)
        : parsePropertyText(aiText);

      // Match staff specifically from parsed.assignedStaffName or assignedStaffId
      let matchedStaff = (parsed as any).assignedStaffId;
      if (!matchedStaff && (parsed as any).assignedStaffName) {
        const targetStaff = (parsed as any).assignedStaffName.trim().toLowerCase();
        const found = staffUsers.find(u => {
          const uName = (u.name || "").toLowerCase();
          return uName.includes(targetStaff) || targetStaff.includes(uName);
        });
        if (found) {
          matchedStaff = found.id;
        }
      }

      setForm(prev => ({
        ...prev,
        code: parsed.code || (!isEdit ? "ALM-" + Math.floor(1000 + Math.random() * 9000) : prev.code),
        price: parsed.price !== undefined ? parsed.price : (isEdit ? prev.price : 0),
        area: parsed.area !== undefined ? parsed.area : (isEdit ? prev.area : 0),
        beds: parsed.beds !== undefined ? parsed.beds : (isEdit ? prev.beds : 0),
        baths: parsed.baths !== undefined ? parsed.baths : (isEdit ? prev.baths : 0),
        floors: parsed.floors !== undefined ? parsed.floors : (isEdit ? prev.floors : 0),
        floor: parsed.floor !== undefined ? (typeof parsed.floor === "number" ? (parsed.floor === 0 ? "أرضي" : String(parsed.floor)) : String(parsed.floor)) : (isEdit ? String(prev.floor ?? "") : ""),
        floorText: parsed.floorText || "",
        regionId: parsed.regionId || prev.regionId,
        typeId: parsed.typeId || prev.typeId,
        category: parsed.category || "residential",
        listingType: parsed.listingType || "sale",
        finishing: parsed.finishing || "",
        master: parsed.master || "",
        view: parsed.view || "",
        layout: parsed.layout || "",
        unitType: parsed.unitType || "",
        subArea: parsed.subArea || "",
        location: parsed.location || "",
        additionalFeatures: parsed.additionalFeatures || "",
        elevator: parsed.elevator || "",
        parking: parsed.parking || "",
        agentType: parsed.agentType || "direct",
        source: parsed.source || "",
        sourcePhones: parsed.sourcePhones?.length ? parsed.sourcePhones : [""],
        assignedStaffId: matchedStaff || "",
        description: parsed.description || prev.description,
      }));

      toast({
        title: isAiAgentActive
          ? "تم التحليل والتعبئة بواسطة وكيل Gemini Pro! 🪄⚡"
          : "تم التحليل والتعبئة بواسطة المحلل المحلي! 🪄",
      });
      setAiParsedSummary(
        isAiAgentActive
          ? "تمت المعالجة عبر وكيل Gemini Pro واستخراج (الكود، السعر، المساحة، الماستر، الموظف، المميزات، التقسيمة) بنجاح."
          : "تم استخراج البيانات عبر المحلل المحلي وتعبئتها تلقائياً."
      );
    } catch (err) {
      console.error("AI parse error:", err);
      toast({ title: "حدث خطأ أثناء معالجة الذكاء الاصطناعي", variant: "destructive" });
    } finally {
      setAiLoading(false);
    }
  };

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
            <Button className="bg-primary text-primary-foreground hover:bg-primary/90" onClick={handleSave} disabled={saving}>
              <Save className="ml-2 h-4 w-4" />{saving ? "جارٍ الحفظ..." : "حفظ ونشر"}
            </Button>
          </div>
        </div>

        {/* ── AI Smart Property Parser Card ── */}
        {!isEdit && (
          <Card className="border-accent/40 bg-gradient-to-br from-card via-card to-accent/5 shadow-md">
            <CardHeader className="pb-3.5">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="flex items-start sm:items-center gap-3 w-full sm:w-auto">
                  <div className="w-10 h-10 rounded-xl bg-accent/15 text-accent flex items-center justify-center shrink-0 mt-0.5 sm:mt-0 shadow-sm">
                    <Wand2 className="h-5 w-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <CardTitle className="text-sm sm:text-base font-bold text-foreground">
                        المحلل الذكي للإعلانات العقارية
                      </CardTitle>
                      <span className="text-[10px] bg-accent/20 text-accent font-bold px-2 py-0.5 rounded-full">Pro Hub</span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                      الصق أي نص عشوائي أو رسالة واتساب، وسيقوم الذكاء الاصطناعي باستخراج كافة البيانات وتعبئة الخانات فوراً.
                    </p>
                  </div>
                </div>

                {/* AI Agent Status Indicator Badge */}
                <div className="self-start sm:self-auto shrink-0 pt-1 sm:pt-0">
                  {isAiAgentActive ? (
                    <div className="flex items-center gap-1.5 text-xs text-emerald-500 font-bold bg-emerald-500/10 px-3 py-1.5 rounded-xl border border-emerald-500/20 shadow-sm">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                      <span>وكيل Gemini Pro متصل ⚡</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground bg-muted/80 px-3 py-1.5 rounded-xl border border-border/60 shadow-sm">
                      <span>⚪ المحلل المحلي السريع</span>
                    </div>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <Textarea
                rows={3}
                placeholder="الصق نص الرسالة أو الإعلان هنا..."
                value={aiText}
                onChange={e => setAiText(e.target.value)}
                className="text-xs sm:text-sm bg-background/80 focus:border-accent"
              />
              <div className="flex flex-wrap items-center justify-between gap-2">
                <Button
                  type="button"
                  onClick={handleAiAutoFill}
                  disabled={aiLoading}
                  className="bg-accent text-accent-foreground font-bold hover:bg-accent/90 gap-2 h-9 px-4 rounded-xl shadow-md text-xs"
                >
                  {aiLoading ? <RefreshCw className="h-3.5 w-3.5 animate-spin" /> : <Wand2 className="h-3.5 w-3.5" />}
                  {aiLoading ? "جارٍ المعالجة بالذكاء الاصطناعي..." : "تحليل وتعبئة الخانات فوراً"}
                </Button>
                {aiParsedSummary && (
                  <span className="text-xs text-emerald-500 font-bold flex items-center gap-1">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    {aiParsedSummary}
                  </span>
                )}
              </div>
            </CardContent>
          </Card>
        )}

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
                    <Input type="text" inputMode="decimal" dir="ltr" value={form.price ? formatNumber(form.price) : ""} onChange={e => set("price", Number(toNumericString(e.target.value)) || 0)} placeholder="0" />
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
                    <Input
                      type="text"
                      value={form.floor}
                      onChange={e => set("floor", e.target.value)}
                      placeholder="مثال: أرضي / الأول / الثالث / أخير / متكرر..."
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>الدريسنج</Label>
                    <Input value={form.floorText} onChange={e => set("floorText", e.target.value)} placeholder="يوجد / غرفة دريسنج / لا..." />
                  </div>
                  <div className="space-y-2">
                    <Label>التشطيب</Label>
                    <Select value={form.finishing} onValueChange={v => set("finishing", v)}>
                      <SelectTrigger><SelectValue placeholder="اختر" /></SelectTrigger>
                      <SelectContent>{finishingOptions.map(o => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>الواجهة</Label>
                    <Input value={form.unitType} onChange={e => set("unitType", e.target.value)} placeholder="أمامي / خلفي / بانورامي / ركني..." />
                  </div>
                  <div className="space-y-2">
                    <Label>الفيو</Label>
                    <Input value={form.view} onChange={e => set("view", e.target.value)} placeholder="فيو حديقة / مفتوح / مول / مسبح / نيل..." />
                  </div>
                  <div className="space-y-2">
                    <Label>ماستر</Label>
                    <Input value={form.master} onChange={e => set("master", e.target.value)} placeholder="نعم / ماستر + دريسنج..." />
                  </div>
                  <div className="space-y-2">
                    <Label>أسانسير</Label>
                    <Input value={form.elevator} onChange={e => set("elevator", e.target.value)} placeholder="نعم / لا" />
                  </div>
                  <div className="space-y-2">
                    <Label>موقف سيارة</Label>
                    <Input value={form.parking} onChange={e => set("parking", e.target.value)} placeholder="يوجد / لا يوجد / خاص / مشترك" />
                  </div>
                  <div className="space-y-2 col-span-2 sm:col-span-3">
                    <Label>المميزات الإضافية</Label>
                    <Input value={form.additionalFeatures} onChange={e => set("additionalFeatures", e.target.value)} placeholder="جراج، أمن، جيم، مسبح، حديقة..." />
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
                        {idx === 0 && <div className="absolute bottom-0 inset-x-0 bg-accent/80 text-accent-foreground text-[9px] font-bold text-center py-0.5">رئيسية</div>}
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

                {/* Cover Priority */}
                <div className="space-y-2">
                  <Label className="text-sm">أولوية غلاف البطاقة</Label>
                  <div className="flex rounded-lg border border-border overflow-hidden text-sm">
                    <button
                      type="button"
                      onClick={() => set("coverPriority", "image")}
                      className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-3 transition-colors ${
                        form.coverPriority === "image" || !form.coverPriority
                          ? "bg-accent text-accent-foreground font-semibold"
                          : "bg-background text-muted-foreground hover:bg-muted"
                      }`}
                    >
                      <Camera className="h-3.5 w-3.5" />
                      الصورة أولاً
                    </button>
                    <button
                      type="button"
                      onClick={() => set("coverPriority", "video")}
                      className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-3 border-r border-border transition-colors ${
                        form.coverPriority === "video"
                          ? "bg-accent text-accent-foreground font-semibold"
                          : "bg-background text-muted-foreground hover:bg-muted"
                      }`}
                    >
                      <Play className="h-3.5 w-3.5" />
                      الفيديو أولاً
                    </button>
                  </div>
                  <p className="text-[11px] text-muted-foreground">اختر ما يظهر كغلاف للبطاقة عند توفّر الاثنين معاً</p>
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
              <CardHeader><CardTitle className="text-sm">التصنيف والبيانات الأساسية</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>فئة العقار (الاستخدام) *</Label>
                  <Select value={form.category} onValueChange={(v: PropertyCategory) => set("category", v)}>
                    <SelectTrigger><SelectValue placeholder="اختر الفئة" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="residential">سكني</SelectItem>
                      <SelectItem value="administrative">إداري</SelectItem>
                      <SelectItem value="medical">طبي</SelectItem>
                      <SelectItem value="commercial">تجاري</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>نوع العرض *</Label>
                  <Select value={form.listingType} onValueChange={(v: "sale" | "rent" | "furnished") => set("listingType", v)}>
                    <SelectTrigger><SelectValue placeholder="اختر نوع العرض" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="sale">للبيع</SelectItem>
                      <SelectItem value="rent">للإيجار</SelectItem>
                      <SelectItem value="furnished">مفروش</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>نوع العقار *</Label>
                  <Select value={form.typeId} onValueChange={v => set("typeId", v)}>
                    <SelectTrigger><SelectValue placeholder="اختر النوع" /></SelectTrigger>
                    <SelectContent>
                      {propertyTypes.filter(t => t.active).map(t => (
                        <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>المنطقة *</Label>
                  <Select value={form.regionId} onValueChange={v => set("regionId", v)}>
                    <SelectTrigger><SelectValue placeholder="اختر المنطقة" /></SelectTrigger>
                    <SelectContent>
                      {regions.filter(r => r.active).map(r => (
                        <SelectItem key={r.id} value={r.id}>{r.name}</SelectItem>
                      ))}
                    </SelectContent>
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

            {/* Featured + Administrative & Source Options */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm flex items-center gap-2">
                  <Star className="h-4 w-4 text-yellow-500" />
                  خيارات إدارية ومصدر العقار
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
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

                <div className="border-t pt-3 space-y-2">
                  <Label className="text-sm">نوع المصدر</Label>
                  <Select value={form.agentType || "direct"} onValueChange={(v: "direct" | "broker") => set("agentType", v)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="direct">مباشر (من المالك)</SelectItem>
                      <SelectItem value="broker">بروكر (وسيط عقاري)</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">يظهر للمدير فقط</p>
                </div>

                {form.agentType === "broker" && (
                  <div className="space-y-2 p-3 rounded-xl bg-accent/10 border border-accent/30 animate-in fade-in-50">
                    <Label className="text-xs font-bold text-accent flex items-center gap-1.5">
                      <Handshake className="h-3.5 w-3.5" />
                      اختر الوسيط / البروكر المعتمد
                    </Label>
                    <Select
                      value={form.brokerId || "__none"}
                      onValueChange={v => {
                        if (v === "__none") {
                          set("brokerId", "");
                          return;
                        }
                        const b = brokers.find(x => x.id === v);
                        if (b) {
                          setForm(prev => ({
                            ...prev,
                            brokerId: b.id,
                            source: b.name,
                            sourcePhones: [b.phone, b.whatsapp || ""].filter(Boolean),
                            sourceNotes: `شركة: ${b.company || "خاص"} · عمولة: ${b.commission || "غير محددة"}`,
                          }));
                        }
                      }}
                    >
                      <SelectTrigger className="h-9 text-xs"><SelectValue placeholder="اختر من دليل الوسطاء" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="__none">وسيط غير مسجل (إدخال يدوي)</SelectItem>
                        {brokers.map(b => (
                          <SelectItem key={b.id} value={b.id}>
                            {b.name} {b.company ? `(${b.company})` : ""} - {b.phone}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                <div className="border-t pt-3 space-y-4">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">
                    {form.agentType === "broker" ? "بيانات البروكر / التواصل" : "بيانات المالك / التواصل"}
                  </p>
                  <div className="space-y-2">
                    <Label className="text-sm">{form.agentType === "broker" ? "اسم البروكر" : "اسم المالك"}</Label>
                    <Input value={form.source} onChange={e => set("source", e.target.value)} placeholder="اسم المصدر..." />
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
                  <div className="space-y-2">
                    <Label className="text-sm">الموظف المسؤول</Label>
                    <Select
                      value={form.assignedStaffId || "__unassigned"}
                      onValueChange={value => set("assignedStaffId", value === "__unassigned" ? "" : value)}
                    >
                      <SelectTrigger><SelectValue placeholder="اختر الموظف المسؤول" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="__unassigned">غير محدد</SelectItem>
                        {staffUsers.map(user => (
                          <SelectItem key={user.id} value={user.id}>
                            {staffLabel(user)} · {user.role === "admin" ? "مدير النظام" : "مستشار عقاري"}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-muted-foreground">يظهر هذا الاختيار للإدارة فقط.</p>
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
