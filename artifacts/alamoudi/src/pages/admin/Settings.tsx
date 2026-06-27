import { useState, useRef, ChangeEvent } from "react";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Save, Upload, X, Image as ImageIcon, Phone, Mail, MessageCircle, MapPin, Facebook, Instagram, Music } from "lucide-react";
import { useData } from "@/context/DataContext";
import { useToast } from "@/hooks/use-toast";
import type { SiteSettings } from "@/context/DataContext";

export default function Settings() {
  const { settings, updateSettings } = useData();
  const { toast } = useToast();

  const [form, setForm] = useState<SiteSettings>({ ...settings });
  const [saving, setSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const set = (key: keyof SiteSettings) => (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm(prev => ({ ...prev, [key]: e.target.value }));

  const handleHeroFile = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 4 * 1024 * 1024) {
      toast({ title: "الصورة كبيرة جداً", description: "يجب أن لا يتجاوز حجم الصورة 4 ميجابايت", variant: "destructive" });
      return;
    }
    const reader = new FileReader();
    reader.onload = (ev) => {
      const result = ev.target?.result as string;
      setForm(prev => ({ ...prev, heroImageUrl: result }));
    };
    reader.readAsDataURL(file);
  };

  const handleSave = async () => {
    setSaving(true);
    await new Promise(r => setTimeout(r, 400));
    try {
      updateSettings(form);
      toast({ title: "تم الحفظ بنجاح ✓", description: "تم تحديث إعدادات المنصة." });
    } catch {
      toast({ title: "خطأ في الحفظ", description: "تعذر حفظ الإعدادات. حاول مرة أخرى.", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6 max-w-4xl">
        <div>
          <h1 className="text-2xl font-bold text-foreground">إعدادات المنصة</h1>
          <p className="text-sm text-muted-foreground mt-1">إدارة إعدادات الموقع وبيانات التواصل</p>
        </div>

        <Tabs defaultValue="general" className="w-full">
          <TabsList className="grid w-full grid-cols-4 lg:w-auto lg:inline-grid">
            <TabsTrigger value="general">عام</TabsTrigger>
            <TabsTrigger value="contact">التواصل</TabsTrigger>
            <TabsTrigger value="hero">صورة الغلاف</TabsTrigger>
            <TabsTrigger value="system">النظام</TabsTrigger>
          </TabsList>

          {/* ── General ── */}
          <TabsContent value="general" className="mt-6">
            <Card className="card-luxury">
              <CardHeader>
                <CardTitle>الإعدادات العامة</CardTitle>
                <CardDescription>المعلومات الأساسية للشركة</CardDescription>
              </CardHeader>
              <CardContent className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="companyName">اسم الشركة</Label>
                  <Input id="companyName" value={form.companyName} onChange={set("companyName")} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="companyDescription">وصف الشركة</Label>
                  <Textarea id="companyDescription" rows={3} value={form.companyDescription} onChange={set("companyDescription")} />
                </div>
              </CardContent>
              <CardFooter className="border-t pt-4">
                <Button onClick={handleSave} disabled={saving} className="bg-accent text-white hover:bg-accent/90 gap-2">
                  <Save className="h-4 w-4" />
                  {saving ? "جاري الحفظ..." : "حفظ الإعدادات"}
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>

          {/* ── Contact ── */}
          <TabsContent value="contact" className="mt-6">
            <Card className="card-luxury">
              <CardHeader>
                <CardTitle>معلومات التواصل</CardTitle>
                <CardDescription>ستظهر هذه البيانات تلقائياً في تذييل الموقع</CardDescription>
              </CardHeader>
              <CardContent className="space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="phone1" className="flex items-center gap-2">
                      <Phone className="h-3.5 w-3.5 text-accent" />
                      رقم الهاتف الأول
                    </Label>
                    <Input id="phone1" dir="ltr" className="text-right" value={form.phone1} onChange={set("phone1")} placeholder="+20 10 0000 0000" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone2" className="flex items-center gap-2">
                      <Phone className="h-3.5 w-3.5 text-accent" />
                      رقم الهاتف الثاني
                    </Label>
                    <Input id="phone2" dir="ltr" className="text-right" value={form.phone2} onChange={set("phone2")} placeholder="+20 11 0000 0000" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="whatsapp" className="flex items-center gap-2">
                      <MessageCircle className="h-3.5 w-3.5 text-accent" />
                      رقم واتساب
                    </Label>
                    <Input id="whatsapp" dir="ltr" className="text-right" value={form.whatsapp} onChange={set("whatsapp")} placeholder="+20 10 0000 0000" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email" className="flex items-center gap-2">
                      <Mail className="h-3.5 w-3.5 text-accent" />
                      البريد الإلكتروني
                    </Label>
                    <Input id="email" type="email" dir="ltr" className="text-right" value={form.email} onChange={set("email")} placeholder="info@alamoudi.com" />
                  </div>
                </div>

                <div className="border-t pt-5">
                  <p className="text-sm font-semibold text-foreground mb-4">روابط التواصل الاجتماعي والخرائط</p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="mapsUrl" className="flex items-center gap-2">
                        <MapPin className="h-3.5 w-3.5 text-accent" />
                        رابط خرائط جوجل
                      </Label>
                      <Input id="mapsUrl" dir="ltr" className="text-right text-xs" value={form.mapsUrl} onChange={set("mapsUrl")} placeholder="https://maps.google.com/..." />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="tiktok" className="flex items-center gap-2">
                        <Music className="h-3.5 w-3.5 text-accent" />
                        رابط تيك توك
                      </Label>
                      <Input id="tiktok" dir="ltr" className="text-right text-xs" value={form.tiktok} onChange={set("tiktok")} placeholder="https://tiktok.com/@..." />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="facebook" className="flex items-center gap-2">
                        <Facebook className="h-3.5 w-3.5 text-accent" />
                        رابط فيسبوك
                      </Label>
                      <Input id="facebook" dir="ltr" className="text-right text-xs" value={form.facebook} onChange={set("facebook")} placeholder="https://facebook.com/..." />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="instagram" className="flex items-center gap-2">
                        <Instagram className="h-3.5 w-3.5 text-accent" />
                        رابط إنستغرام
                      </Label>
                      <Input id="instagram" dir="ltr" className="text-right text-xs" value={form.instagram} onChange={set("instagram")} placeholder="https://instagram.com/..." />
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="border-t pt-4">
                <Button onClick={handleSave} disabled={saving} className="bg-accent text-white hover:bg-accent/90 gap-2">
                  <Save className="h-4 w-4" />
                  {saving ? "جاري الحفظ..." : "حفظ التواصل"}
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>

          {/* ── Hero Image ── */}
          <TabsContent value="hero" className="mt-6">
            <Card className="card-luxury">
              <CardHeader>
                <CardTitle>صورة الغلاف الرئيسية</CardTitle>
                <CardDescription>الصورة التي تظهر في قسم الهيرو بالصفحة الرئيسية</CardDescription>
              </CardHeader>
              <CardContent className="space-y-5">
                {/* Preview */}
                {form.heroImageUrl && (
                  <div className="relative rounded-xl overflow-hidden h-48 bg-muted border border-border group">
                    <img
                      src={form.heroImageUrl}
                      alt="صورة الغلاف"
                      className="w-full h-full object-cover"
                      onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                    />
                    <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => setForm(prev => ({ ...prev, heroImageUrl: "" }))}
                        className="gap-1"
                      >
                        <X className="h-3.5 w-3.5" />
                        إزالة الصورة
                      </Button>
                    </div>
                  </div>
                )}

                {!form.heroImageUrl && (
                  <div className="rounded-xl h-48 bg-muted border-2 border-dashed border-border flex flex-col items-center justify-center text-muted-foreground gap-2">
                    <ImageIcon className="h-8 w-8 opacity-40" />
                    <p className="text-sm">لا توجد صورة غلاف</p>
                  </div>
                )}

                {/* Upload file */}
                <div className="space-y-2">
                  <Label>رفع صورة جديدة</Label>
                  <div className="flex gap-2">
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleHeroFile}
                      className="hidden"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => fileInputRef.current?.click()}
                      className="gap-2 flex-1"
                    >
                      <Upload className="h-4 w-4" />
                      اختيار صورة (حد أقصى 4 ميجا)
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground">PNG, JPG, WEBP — تُخزَّن في المتصفح فقط حتى يتم ربط التخزين السحابي</p>
                </div>

                {/* URL input */}
                <div className="space-y-2">
                  <Label htmlFor="heroUrl">أو أدخل رابط الصورة مباشرة</Label>
                  <Input
                    id="heroUrl"
                    dir="ltr"
                    className="text-xs"
                    value={form.heroImageUrl.startsWith("data:") ? "" : form.heroImageUrl}
                    onChange={set("heroImageUrl")}
                    placeholder="https://example.com/image.jpg"
                  />
                </div>
              </CardContent>
              <CardFooter className="border-t pt-4 gap-3">
                <Button onClick={handleSave} disabled={saving} className="bg-accent text-white hover:bg-accent/90 gap-2">
                  <Save className="h-4 w-4" />
                  {saving ? "جاري الحفظ..." : "حفظ صورة الغلاف"}
                </Button>
                {form.heroImageUrl && (
                  <Button
                    variant="outline"
                    onClick={() => setForm(prev => ({ ...prev, heroImageUrl: "https://images.unsplash.com/photo-1613977257363-707ba9348227?w=1920&q=80" }))}
                    className="text-muted-foreground text-sm"
                  >
                    استعادة الصورة الافتراضية
                  </Button>
                )}
              </CardFooter>
            </Card>
          </TabsContent>

          {/* ── System ── */}
          <TabsContent value="system" className="mt-6">
            <div className="space-y-4">
              <Card className="card-luxury">
                <CardHeader>
                  <CardTitle>الإشعارات</CardTitle>
                  <CardDescription>التحكم في التنبيهات</CardDescription>
                </CardHeader>
                <CardContent className="space-y-5">
                  {[
                    { label: "إشعارات العقارات الجديدة", desc: "تنبيه عند إضافة عقار جديد", defaultOn: true },
                    { label: "طلبات التواصل", desc: "تنبيه عند تلقي طلب تواصل من عميل", defaultOn: true },
                    { label: "تحديثات النظام", desc: "إشعارات حول تحديثات المنصة", defaultOn: false },
                  ].map((item, i) => (
                    <div key={i} className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium">{item.label}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">{item.desc}</p>
                      </div>
                      <Switch defaultChecked={item.defaultOn} />
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card className="card-luxury">
                <CardHeader>
                  <CardTitle>الأمان</CardTitle>
                  <CardDescription>سياسات حماية الحسابات</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">فرض المصادقة الثنائية (2FA)</p>
                      <p className="text-xs text-muted-foreground mt-0.5">لجميع حسابات مدراء النظام</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  <div className="space-y-2 pt-3 border-t">
                    <Label htmlFor="passLength" className="text-sm">الحد الأدنى لطول كلمة المرور</Label>
                    <Input id="passLength" type="number" defaultValue="8" className="w-24 text-center" />
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
}
