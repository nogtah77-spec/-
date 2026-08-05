import { useState, useRef, ChangeEvent } from "react";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import {
  Save,
  Upload,
  X,
  Image as ImageIcon,
  Phone,
  Mail,
  MapPin,
  Facebook,
  Instagram,
  Plus,
  Play,
  ExternalLink,
  Sun,
  Moon,
  SunMoon,
} from "lucide-react";
import {
  WhatsAppIcon,
  TikTokIcon,
  TelegramIcon,
} from "@/components/icons/BrandIcons";
import { useData } from "@/context/DataContext";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { extractVideoUrl } from "@/lib/videoThumbnail";
import type { SiteSettings, TiktokVideo } from "@/context/DataContext";

const EMPTY_VIDEO: Omit<TiktokVideo, "id"> = {
  thumbnail: "",
  title: "",
  videoUrl: "",
};

export default function Settings() {
  const {
    settings,
    updateSettings,
    addTiktokVideo,
    updateTiktokVideo,
    deleteTiktokVideo,
  } = useData();
  const { currentUser } = useAuth();
  const isAdmin = currentUser?.role === "admin";
  const { toast } = useToast();

  const [form, setForm] = useState<SiteSettings>({ ...settings });
  const [saving, setSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [newVideo, setNewVideo] =
    useState<Omit<TiktokVideo, "id">>(EMPTY_VIDEO);
  const [editingVideoId, setEditingVideoId] = useState<string | null>(null);
  const [editVideo, setEditVideo] =
    useState<Omit<TiktokVideo, "id">>(EMPTY_VIDEO);
  const thumbRefs = useRef<{ [key: string]: HTMLInputElement | null }>({});

  const avatarRef = useRef<HTMLInputElement>(null);

  const handleAvatarFile = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 3 * 1024 * 1024) {
      toast({ title: "الصورة كبيرة جداً (حد 3MB)", variant: "destructive" });
      return;
    }
    const r = new FileReader();
    r.onload = (ev) =>
      setForm((p) => ({ ...p, tiktokAvatar: ev.target?.result as string }));
    r.readAsDataURL(file);
    e.target.value = "";
  };

  const handleSaveAccount = () => {
    updateSettings({
      tiktok: form.tiktok,
      tiktokName: form.tiktokName,
      tiktokAvatar: form.tiktokAvatar,
    });
    toast({ title: "تم حفظ بيانات الحساب ✓" });
  };

  const handleThumbFile = (file: File, onDone: (b64: string) => void) => {
    if (file.size > 3 * 1024 * 1024) {
      toast({ title: "الصورة كبيرة جداً (حد 3MB)", variant: "destructive" });
      return;
    }
    const r = new FileReader();
    r.onload = (e) => onDone(e.target?.result as string);
    r.readAsDataURL(file);
  };

  const handleAddVideo = () => {
    if (!newVideo.title.trim() || !newVideo.videoUrl.trim()) {
      toast({
        title: "يرجى إدخال العنوان ورابط الفيديو",
        variant: "destructive",
      });
      return;
    }
    if ((settings.tiktokVideos ?? []).length >= 6) {
      toast({
        title: "الحد الأقصى 6 فيديوهات",
        description: "احذف فيديو قبل إضافة فيديو جديد",
        variant: "destructive",
      });
      return;
    }
    addTiktokVideo({
      ...newVideo,
      videoUrl: extractVideoUrl(newVideo.videoUrl),
    });
    setNewVideo(EMPTY_VIDEO);
    toast({ title: "تم إضافة الفيديو" });
  };

  const handleSaveEdit = () => {
    if (!editingVideoId) return;
    updateTiktokVideo(editingVideoId, {
      ...editVideo,
      videoUrl: extractVideoUrl(editVideo.videoUrl),
    });
    setEditingVideoId(null);
    toast({ title: "تم تحديث الفيديو" });
  };

  const set =
    (key: keyof SiteSettings) =>
    (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setForm((prev) => ({ ...prev, [key]: e.target.value }));

  const handleHeroFile = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 4 * 1024 * 1024) {
      toast({
        title: "الصورة كبيرة جداً",
        description: "يجب أن لا يتجاوز حجم الصورة 4 ميجابايت",
        variant: "destructive",
      });
      return;
    }
    const reader = new FileReader();
    reader.onload = (ev) => {
      const result = ev.target?.result as string;
      setForm((prev) => ({ ...prev, heroImageUrl: result }));
    };
    reader.readAsDataURL(file);
  };

  const handleSave = async () => {
    setSaving(true);
    await new Promise((r) => setTimeout(r, 400));
    try {
      updateSettings(form);
      toast({
        title: "تم الحفظ بنجاح ✓",
        description: "تم تحديث إعدادات المنصة.",
      });
    } catch {
      toast({
        title: "خطأ في الحفظ",
        description: "تعذر حفظ الإعدادات. حاول مرة أخرى.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6 max-w-4xl">
        <div>
          <h1 className="text-2xl font-bold text-foreground">إعدادات المنصة</h1>
          <p className="text-sm text-muted-foreground mt-1">
            إدارة إعدادات الموقع وبيانات التواصل
          </p>
        </div>

        <Tabs defaultValue="general" className="w-full">
          <TabsList className="grid w-full h-auto grid-cols-2 gap-2 sm:grid-cols-3 lg:w-auto lg:grid-cols-6">
            <TabsTrigger value="general">عام</TabsTrigger>
            <TabsTrigger value="contact">التواصل</TabsTrigger>
            <TabsTrigger value="hero">صورة الغلاف</TabsTrigger>
            <TabsTrigger value="tiktok">تيك توك</TabsTrigger>
            <TabsTrigger value="system">النظام</TabsTrigger>
            <TabsTrigger value="carousel">الكاروسيل</TabsTrigger>
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
                  <Input
                    id="companyName"
                    value={form.companyName}
                    onChange={set("companyName")}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="companyDescription">وصف الشركة</Label>
                  <Textarea
                    id="companyDescription"
                    rows={3}
                    value={form.companyDescription}
                    onChange={set("companyDescription")}
                  />
                </div>
              </CardContent>
              <CardFooter className="border-t pt-4">
                <Button
                  onClick={handleSave}
                  disabled={saving}
                  className="bg-accent text-white hover:bg-accent/90 gap-2"
                >
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
                <CardDescription>
                  ستظهر هذه البيانات تلقائياً في تذييل الموقع
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="phone1" className="flex items-center gap-2">
                      <Phone className="h-3.5 w-3.5 text-accent" />
                      رقم الهاتف الأول
                    </Label>
                    <Input
                      id="phone1"
                      dir="ltr"
                      className="text-right"
                      value={form.phone1}
                      onChange={set("phone1")}
                      placeholder="+20 10 0000 0000"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone2" className="flex items-center gap-2">
                      <Phone className="h-3.5 w-3.5 text-accent" />
                      رقم الهاتف الثاني
                    </Label>
                    <Input
                      id="phone2"
                      dir="ltr"
                      className="text-right"
                      value={form.phone2}
                      onChange={set("phone2")}
                      placeholder="+20 11 0000 0000"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label
                      htmlFor="whatsapp"
                      className="flex items-center gap-2"
                    >
                      <WhatsAppIcon className="h-3.5 w-3.5 text-accent" />
                      رقم واتساب
                    </Label>
                    <Input
                      id="whatsapp"
                      dir="ltr"
                      className="text-right"
                      value={form.whatsapp}
                      onChange={set("whatsapp")}
                      placeholder="+20 10 0000 0000"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email" className="flex items-center gap-2">
                      <Mail className="h-3.5 w-3.5 text-accent" />
                      البريد الإلكتروني
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      dir="ltr"
                      className="text-right"
                      value={form.email}
                      onChange={set("email")}
                      placeholder="info@alamoudi.com"
                    />
                  </div>
                </div>

                <div className="border-t pt-5">
                  <p className="text-sm font-semibold text-foreground mb-4">
                    روابط التواصل الاجتماعي والخرائط
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label
                        htmlFor="mapsUrl"
                        className="flex items-center gap-2"
                      >
                        <MapPin className="h-3.5 w-3.5 text-accent" />
                        رابط خرائط جوجل
                      </Label>
                      <Input
                        id="mapsUrl"
                        dir="ltr"
                        className="text-right text-xs"
                        value={form.mapsUrl}
                        onChange={set("mapsUrl")}
                        placeholder="https://maps.google.com/..."
                      />
                    </div>
                    <div className="space-y-2">
                      <Label
                        htmlFor="tiktok"
                        className="flex items-center gap-2"
                      >
                        <TikTokIcon className="h-3.5 w-3.5 text-accent" />
                        رابط تيك توك
                      </Label>
                      <Input
                        id="tiktok"
                        dir="ltr"
                        className="text-right text-xs"
                        value={form.tiktok}
                        onChange={set("tiktok")}
                        placeholder="https://tiktok.com/@..."
                      />
                    </div>
                    <div className="space-y-2">
                      <Label
                        htmlFor="facebook"
                        className="flex items-center gap-2"
                      >
                        <Facebook className="h-3.5 w-3.5 text-accent" />
                        رابط فيسبوك
                      </Label>
                      <Input
                        id="facebook"
                        dir="ltr"
                        className="text-right text-xs"
                        value={form.facebook}
                        onChange={set("facebook")}
                        placeholder="https://facebook.com/..."
                      />
                    </div>
                    <div className="space-y-2">
                      <Label
                        htmlFor="instagram"
                        className="flex items-center gap-2"
                      >
                        <Instagram className="h-3.5 w-3.5 text-accent" />
                        رابط إنستغرام
                      </Label>
                      <Input
                        id="instagram"
                        dir="ltr"
                        className="text-right text-xs"
                        value={form.instagram}
                        onChange={set("instagram")}
                        placeholder="https://instagram.com/..."
                      />
                    </div>
                    <div className="space-y-2">
                      <Label
                        htmlFor="telegram"
                        className="flex items-center gap-2"
                      >
                        <TelegramIcon className="h-3.5 w-3.5 text-accent" />
                        رابط تيليجرام
                      </Label>
                      <Input
                        id="telegram"
                        dir="ltr"
                        className="text-right text-xs"
                        value={form.telegram ?? ""}
                        onChange={set("telegram")}
                        placeholder="https://t.me/..."
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="border-t pt-4">
                <Button
                  onClick={handleSave}
                  disabled={saving}
                  className="bg-accent text-white hover:bg-accent/90 gap-2"
                >
                  <Save className="h-4 w-4" />
                  {saving ? "جاري الحفظ..." : "حفظ التواصل"}
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>

          {/* ── Hero Image ── */}
          <TabsContent value="hero" className="mt-6">
            <div className="space-y-5">
              {/* Hero text */}
              <Card className="card-luxury">
                <CardHeader>
                  <CardTitle>نص صفحة الغلاف</CardTitle>
                  <CardDescription>
                    السطران اللذان يظهران فوق الأزرار في الصفحة الرئيسية —
                    اتركهما فارغَين لإخفائهما
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="heroLine1">السطر الأول</Label>
                    <Input
                      id="heroLine1"
                      value={form.heroLine1 ?? ""}
                      onChange={set("heroLine1")}
                      placeholder="شريكك الموثوق في عالم التسويق العقاري والتشطيبات"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="heroLine2">السطر الثاني</Label>
                    <Input
                      id="heroLine2"
                      value={form.heroLine2 ?? ""}
                      onChange={set("heroLine2")}
                      placeholder="نقدم لك أفضل الفرص العقارية والاستثمارية في مصر"
                    />
                  </div>
                </CardContent>
                <CardFooter className="border-t pt-4">
                  <Button
                    onClick={handleSave}
                    disabled={saving}
                    className="bg-accent text-white hover:bg-accent/90 gap-2"
                  >
                    <Save className="h-4 w-4" />
                    {saving ? "جاري الحفظ..." : "حفظ النص"}
                  </Button>
                </CardFooter>
              </Card>

              <Card className="card-luxury">
                <CardHeader>
                  <CardTitle>صورة الغلاف الرئيسية</CardTitle>
                  <CardDescription>
                    الصورة التي تظهر في قسم الهيرو بالصفحة الرئيسية
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-5">
                  {/* Preview */}
                  {form.heroImageUrl && (
                    <div className="relative rounded-xl overflow-hidden h-48 bg-muted border border-border group">
                      <img
                        src={form.heroImageUrl}
                        alt="صورة الغلاف"
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = "none";
                        }}
                      />
                      <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() =>
                            setForm((prev) => ({ ...prev, heroImageUrl: "" }))
                          }
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
                    <p className="text-xs text-muted-foreground">
                      PNG, JPG, WEBP — تُخزَّن في المتصفح فقط حتى يتم ربط
                      التخزين السحابي
                    </p>
                  </div>

                  {/* URL input */}
                  <div className="space-y-2">
                    <Label htmlFor="heroUrl">أو أدخل رابط الصورة مباشرة</Label>
                    <Input
                      id="heroUrl"
                      dir="ltr"
                      className="text-xs"
                      value={
                        form.heroImageUrl.startsWith("data:")
                          ? ""
                          : form.heroImageUrl
                      }
                      onChange={set("heroImageUrl")}
                      placeholder="https://example.com/image.jpg"
                    />
                  </div>

                  {/* Overlay darkness — admin (manager) only */}
                  {isAdmin && (
                    <div className="space-y-3 pt-2 border-t border-border">
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <Label>درجة تعتيم الصورة</Label>
                          <p className="text-xs text-muted-foreground mt-1">
                            كل ما زادت النسبة، أصبحت الصورة أغمق ووضح النص فوقها
                          </p>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            className="h-9 w-9"
                            onClick={() =>
                              setForm((prev) => ({
                                ...prev,
                                heroOverlayOpacity: Math.max(
                                  0,
                                  (prev.heroOverlayOpacity ?? 85) - 5,
                                ),
                              }))
                            }
                          >
                            <X className="h-3 w-3 rotate-45" />
                          </Button>
                          <Input
                            type="number"
                            min={0}
                            max={100}
                            dir="ltr"
                            className="w-20 text-center"
                            value={form.heroOverlayOpacity ?? 85}
                            onChange={(e) => {
                              const raw = parseInt(e.target.value, 10);
                              const val = isNaN(raw)
                                ? 0
                                : Math.min(100, Math.max(0, raw));
                              setForm((prev) => ({
                                ...prev,
                                heroOverlayOpacity: val,
                              }));
                            }}
                          />
                          <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            className="h-9 w-9"
                            onClick={() =>
                              setForm((prev) => ({
                                ...prev,
                                heroOverlayOpacity: Math.min(
                                  100,
                                  (prev.heroOverlayOpacity ?? 85) + 5,
                                ),
                              }))
                            }
                          >
                            <Plus className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </div>
                      <Slider
                        dir="ltr"
                        value={[form.heroOverlayOpacity ?? 85]}
                        min={0}
                        max={100}
                        step={1}
                        onValueChange={(v) =>
                          setForm((prev) => ({
                            ...prev,
                            heroOverlayOpacity: v[0],
                          }))
                        }
                      />
                      {/* Live preview */}
                      <div className="relative rounded-xl overflow-hidden h-28 bg-muted border border-border">
                        {form.heroImageUrl && (
                          <img
                            src={form.heroImageUrl}
                            alt="معاينة"
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              (e.target as HTMLImageElement).style.display =
                                "none";
                            }}
                          />
                        )}
                        <div
                          className="absolute inset-0 flex items-center justify-center"
                          style={{
                            background: `linear-gradient(135deg, rgba(44,54,57,${(form.heroOverlayOpacity ?? 85) / 100}) 0%, rgba(63,78,79,${((form.heroOverlayOpacity ?? 85) / 100) * 0.92}) 50%, rgba(44,54,57,${Math.min(1, ((form.heroOverlayOpacity ?? 85) / 100) * 1.04)}) 100%)`,
                          }}
                        >
                          <span className="text-white text-sm font-bold">
                            معاينة النص فوق الصورة
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
                <CardFooter className="border-t pt-4 gap-3">
                  <Button
                    onClick={handleSave}
                    disabled={saving}
                    className="bg-accent text-white hover:bg-accent/90 gap-2"
                  >
                    <Save className="h-4 w-4" />
                    {saving ? "جاري الحفظ..." : "حفظ صورة الغلاف"}
                  </Button>
                  {form.heroImageUrl && (
                    <Button
                      variant="outline"
                      onClick={() =>
                        setForm((prev) => ({
                          ...prev,
                          heroImageUrl:
                            "https://images.unsplash.com/photo-1613977257363-707ba9348227?w=1920&q=80",
                        }))
                      }
                      className="text-muted-foreground text-sm"
                    >
                      استعادة الصورة الافتراضية
                    </Button>
                  )}
                </CardFooter>
              </Card>
            </div>
          </TabsContent>

          {/* ── TikTok Videos ── */}
          <TabsContent value="tiktok" className="mt-6">
            <div className="space-y-5">
              {/* Account info */}
              <Card className="card-luxury">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TikTokIcon className="h-4 w-4 text-accent" />
                    بيانات حساب تيك توك
                  </CardTitle>
                  <CardDescription>
                    الصورة والاسم يظهران في أعلى قسم تيك توك بالصفحة الرئيسية
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>صورة الحساب</Label>
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 rounded-full overflow-hidden bg-muted border flex-shrink-0 flex items-center justify-center text-accent">
                        {form.tiktokAvatar ? (
                          <img
                            src={form.tiktokAvatar}
                            alt=""
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <TikTokIcon className="h-6 w-6" />
                        )}
                      </div>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        ref={avatarRef}
                        onChange={handleAvatarFile}
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="gap-2"
                        onClick={() => avatarRef.current?.click()}
                      >
                        <Upload className="h-3.5 w-3.5" />
                        رفع صورة
                      </Button>
                      {form.tiktokAvatar && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="gap-2 text-destructive"
                          onClick={() =>
                            setForm((p) => ({ ...p, tiktokAvatar: "" }))
                          }
                        >
                          <X className="h-3.5 w-3.5" />
                          حذف
                        </Button>
                      )}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>اسم الحساب</Label>
                    <Input
                      value={form.tiktokName}
                      onChange={set("tiktokName")}
                      placeholder="العمودي للتسويق العقاري"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>رابط حساب تيك توك</Label>
                    <Input
                      dir="ltr"
                      className="text-right text-xs"
                      value={form.tiktok}
                      onChange={set("tiktok")}
                      placeholder="https://tiktok.com/@..."
                    />
                  </div>
                </CardContent>
                <CardFooter className="border-t pt-4">
                  <Button
                    onClick={handleSaveAccount}
                    className="bg-accent text-white hover:bg-accent/90 gap-2"
                  >
                    <Save className="h-4 w-4" />
                    حفظ بيانات الحساب
                  </Button>
                </CardFooter>
              </Card>

              {/* Add new video */}
              <Card className="card-luxury">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Plus className="h-4 w-4 text-accent" />
                    إضافة فيديو جديد
                  </CardTitle>
                  <CardDescription>
                    أضف حتى 6 فيديوهات تظهر في الصفحة الرئيسية
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>عنوان الفيديو *</Label>
                    <Input
                      value={newVideo.title}
                      onChange={(e) =>
                        setNewVideo((p) => ({ ...p, title: e.target.value }))
                      }
                      placeholder="مثال: جولة في مشروع مدينتي"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>رابط الفيديو *</Label>
                    <Input
                      dir="ltr"
                      className="text-xs"
                      value={newVideo.videoUrl}
                      onChange={(e) =>
                        setNewVideo((p) => ({ ...p, videoUrl: e.target.value }))
                      }
                      placeholder="https://tiktok.com/@..."
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>صورة مصغرة (اختياري)</Label>
                    <div className="flex gap-3 items-start">
                      {newVideo.thumbnail && (
                        <div className="relative w-20 h-14 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                          <img
                            src={newVideo.thumbnail}
                            alt=""
                            className="w-full h-full object-cover"
                          />
                          <button
                            type="button"
                            onClick={() =>
                              setNewVideo((p) => ({ ...p, thumbnail: "" }))
                            }
                            className="absolute top-0.5 right-0.5 w-4 h-4 bg-destructive rounded-full text-white flex items-center justify-center"
                          >
                            <X className="h-2.5 w-2.5" />
                          </button>
                        </div>
                      )}
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        ref={(el) => {
                          thumbRefs.current["new"] = el;
                        }}
                        onChange={(e) => {
                          const f = e.target.files?.[0];
                          if (f)
                            handleThumbFile(f, (b64) =>
                              setNewVideo((p) => ({ ...p, thumbnail: b64 })),
                            );
                          e.target.value = "";
                        }}
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="gap-2"
                        onClick={() => thumbRefs.current["new"]?.click()}
                      >
                        <Upload className="h-3.5 w-3.5" />
                        رفع صورة
                      </Button>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="border-t pt-4">
                  <Button
                    onClick={handleAddVideo}
                    className="bg-accent text-white hover:bg-accent/90 gap-2"
                  >
                    <Plus className="h-4 w-4" />
                    إضافة الفيديو
                  </Button>
                </CardFooter>
              </Card>

              {/* Existing videos */}
              <Card className="card-luxury">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Play className="h-4 w-4 text-accent" />
                    الفيديوهات الحالية ({(settings.tiktokVideos ?? []).length}
                    /6)
                  </CardTitle>
                  <CardDescription>
                    تظهر الفيديوهات في الصفحة الرئيسية
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {(settings.tiktokVideos ?? []).length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <Play className="h-8 w-8 mx-auto mb-2 opacity-30" />
                      <p className="text-sm">لا توجد فيديوهات مضافة</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {(settings.tiktokVideos ?? []).map((video, idx) => (
                        <div
                          key={video.id}
                          className="border border-border rounded-xl p-4"
                        >
                          {editingVideoId === video.id ? (
                            <div className="space-y-3">
                              <Input
                                value={editVideo.title}
                                onChange={(e) =>
                                  setEditVideo((p) => ({
                                    ...p,
                                    title: e.target.value,
                                  }))
                                }
                                placeholder="عنوان الفيديو"
                              />
                              <Input
                                dir="ltr"
                                className="text-xs"
                                value={editVideo.videoUrl}
                                onChange={(e) =>
                                  setEditVideo((p) => ({
                                    ...p,
                                    videoUrl: e.target.value,
                                  }))
                                }
                                placeholder="رابط الفيديو"
                              />
                              <div className="flex gap-3 items-center">
                                {editVideo.thumbnail && (
                                  <div className="relative w-16 h-11 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                                    <img
                                      src={editVideo.thumbnail}
                                      alt=""
                                      className="w-full h-full object-cover"
                                    />
                                    <button
                                      type="button"
                                      onClick={() =>
                                        setEditVideo((p) => ({
                                          ...p,
                                          thumbnail: "",
                                        }))
                                      }
                                      className="absolute top-0.5 right-0.5 w-4 h-4 bg-destructive rounded-full text-white flex items-center justify-center"
                                    >
                                      <X className="h-2.5 w-2.5" />
                                    </button>
                                  </div>
                                )}
                                <input
                                  type="file"
                                  accept="image/*"
                                  className="hidden"
                                  ref={(el) => {
                                    thumbRefs.current[video.id] = el;
                                  }}
                                  onChange={(e) => {
                                    const f = e.target.files?.[0];
                                    if (f)
                                      handleThumbFile(f, (b64) =>
                                        setEditVideo((p) => ({
                                          ...p,
                                          thumbnail: b64,
                                        })),
                                      );
                                    e.target.value = "";
                                  }}
                                />
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="sm"
                                  className="gap-2 text-xs"
                                  onClick={() =>
                                    thumbRefs.current[video.id]?.click()
                                  }
                                >
                                  <Upload className="h-3 w-3" />
                                  صورة
                                </Button>
                              </div>
                              <div className="flex gap-2">
                                <Button
                                  size="sm"
                                  onClick={handleSaveEdit}
                                  className="bg-accent text-white hover:bg-accent/90"
                                >
                                  حفظ
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => setEditingVideoId(null)}
                                >
                                  إلغاء
                                </Button>
                              </div>
                            </div>
                          ) : (
                            <div className="flex items-center gap-4">
                              <div className="w-16 h-11 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                                {video.thumbnail ? (
                                  <img
                                    src={video.thumbnail}
                                    alt=""
                                    className="w-full h-full object-cover"
                                  />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center">
                                    <Play className="h-4 w-4 text-muted-foreground/50" />
                                  </div>
                                )}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium truncate">
                                  {video.title}
                                </p>
                                <a
                                  href={video.videoUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-xs text-accent hover:underline flex items-center gap-1 mt-0.5"
                                >
                                  <ExternalLink className="h-3 w-3" />
                                  فتح الرابط
                                </a>
                              </div>
                              <div className="flex gap-2 flex-shrink-0">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="text-xs h-7 px-2"
                                  onClick={() => {
                                    setEditingVideoId(video.id);
                                    setEditVideo({
                                      title: video.title,
                                      thumbnail: video.thumbnail,
                                      videoUrl: video.videoUrl,
                                    });
                                  }}
                                >
                                  تعديل
                                </Button>
                                <Button
                                  size="sm"
                                  variant="destructive"
                                  className="text-xs h-7 px-2"
                                  onClick={() => {
                                    deleteTiktokVideo(video.id);
                                    toast({ title: "تم حذف الفيديو" });
                                  }}
                                >
                                  حذف
                                </Button>
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* ── System ── */}
          <TabsContent value="system" className="mt-6">
            <div className="space-y-4">
              {/* ── Appearance / Theme Mode ── */}
              <Card className="card-luxury">
                <CardHeader>
                  <CardTitle>المظهر</CardTitle>
                  <CardDescription>تحكم في وضع الإضاءة للمنصة</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      {
                        value: "light",
                        label: "فاتح دائماً",
                        icon: <Sun className="h-5 w-5" />,
                      },
                      {
                        value: "dark",
                        label: "داكن دائماً",
                        icon: <Moon className="h-5 w-5" />,
                      },
                      {
                        value: "user",
                        label: "يتحكم المستخدم",
                        icon: <SunMoon className="h-5 w-5" />,
                      },
                    ].map((opt) => {
                      const active = (form.themeMode ?? "user") === opt.value;
                      return (
                        <button
                          key={opt.value}
                          type="button"
                          onClick={() => {
                            setForm((p) => ({
                              ...p,
                              themeMode: opt.value as "light" | "dark" | "user",
                            }));
                            updateSettings({
                              themeMode: opt.value as "light" | "dark" | "user",
                            });
                          }}
                          className={`flex flex-col items-center gap-2 p-4 rounded-md border-2 transition-all duration-200 text-sm font-medium ${
                            active
                              ? "border-accent bg-accent/10 text-accent"
                              : "border-border bg-card text-muted-foreground hover:border-accent/40 hover:text-foreground"
                          }`}
                        >
                          {opt.icon}
                          <span className="text-center leading-tight">
                            {opt.label}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                  <p className="text-xs text-muted-foreground mt-3">
                    {(form.themeMode ?? "user") === "user"
                      ? "يظهر زر تبديل الوضع في شريط التنقل لكل زائر"
                      : "يُطبّق الوضع المختار على جميع الزوار ويُخفى زر التبديل"}
                  </p>
                </CardContent>
              </Card>

              <Card className="card-luxury">
                <CardHeader>
                  <CardTitle>الإشعارات</CardTitle>
                  <CardDescription>التحكم في التنبيهات</CardDescription>
                </CardHeader>
                <CardContent className="space-y-5">
                  {[
                    {
                      label: "إشعارات العقارات الجديدة",
                      desc: "تنبيه عند إضافة عقار جديد",
                      defaultOn: true,
                    },
                    {
                      label: "طلبات التواصل",
                      desc: "تنبيه عند تلقي طلب تواصل من عميل",
                      defaultOn: true,
                    },
                    {
                      label: "تحديثات النظام",
                      desc: "إشعارات حول تحديثات المنصة",
                      defaultOn: false,
                    },
                  ].map((item, i) => (
                    <div key={i} className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium">{item.label}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {item.desc}
                        </p>
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
                      <p className="text-sm font-medium">
                        فرض المصادقة الثنائية (2FA)
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        لجميع حسابات مدراء النظام
                      </p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  <div className="space-y-2 pt-3 border-t">
                    <Label htmlFor="passLength" className="text-sm">
                      الحد الأدنى لطول كلمة المرور
                    </Label>
                    <Input
                      id="passLength"
                      type="number"
                      defaultValue="8"
                      className="w-24 text-center"
                    />
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          <TabsContent value="carousel" className="mt-6">
            <Card className="card-luxury">
              <CardHeader>
                <CardTitle>إعدادات الكاروسيل</CardTitle>
                <CardDescription>
                  التحكم بحركة جميع الكاروسيلات في الموقع.
                </CardDescription>
              </CardHeader>

              <CardContent>
                <div className="flex items-center justify-between">
                  <div>
                    <Label>تشغيل الحركة التلقائية</Label>
                    <p className="text-sm text-muted-foreground">
                      تشغيل أو إيقاف حركة الكاروسيل تلقائياً.
                    </p>
                  </div>

                  <Switch checked />
                </div>
                <div className="space-y-2 mt-6">
                  <Label>سرعة الحركة (بالثواني)</Label>

                  <Input
                    type="number"
                    min="1"
                    max="30"
                    defaultValue="5"
                    className="w-32"
                  />

                  <p className="text-sm text-muted-foreground">
                    عدد الثواني قبل انتقال الكاروسيل إلى العقار التالي.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
}
