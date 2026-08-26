import React, { useState, useRef, ChangeEvent } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Sparkles,
  Moon,
  Sun,
  Building2,
  Trees,
  Palette,
  Building,
  Upload,
  Image as ImageIcon,
  Save,
  RotateCcw,
  Eye,
  Check,
} from "lucide-react";
import { useData, type SiteSettings, type HomeBackgroundSettings } from "@/context/DataContext";
import { HomeLuxuryBackground } from "@/components/ui/HomeLuxuryBackground";
import { useToast } from "@/hooks/use-toast";

interface HomeBackgroundManagerProps {
  form: SiteSettings;
  setForm: React.Dispatch<React.SetStateAction<SiteSettings>>;
  onSave: () => void;
  saving: boolean;
}

interface PresetCategory {
  title: string;
  icon: any;
  items: {
    id: string;
    title: string;
    url: string;
    tag: string;
  }[];
}

// ── 🌙 مكتبة حصرية 100% للوضع الليلي (Strictly Nighttime Luxury) ──
const DARK_PRESET_CATEGORIES: PresetCategory[] = [
  {
    title: "أبراج وناطحات سحاب ليلية بإضاءات ذهبية (Night Skylines)",
    icon: Building2,
    items: [
      {
        id: "dark-towers-1",
        title: "ناطحات سحاب دبي المتوهجة ببريق ذهبي",
        url: "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=1920&q=80",
        tag: "أبراج دبي",
      },
      {
        id: "dark-towers-2",
        title: "أفق مانهاتن الليلي وتلألؤ الأضواء",
        url: "https://images.unsplash.com/photo-1514565131-fce0801e5785?w=1920&q=80",
        tag: "أفق نيويورك",
      },
      {
        id: "dark-towers-3",
        title: "أبراج زجاجية شاهقة في ظلمة الليل",
        url: "https://images.unsplash.com/photo-1477959858617-67f30bc75b82?w=1920&q=80",
        tag: "مدينة الأضواء",
      },
      {
        id: "dark-towers-4",
        title: "أفق كوزموبوليتان مع إضاءات دافئة",
        url: "https://images.unsplash.com/photo-1519501025264-65ba15a82390?w=1920&q=80",
        tag: "أفق كوزمو",
      },
      {
        id: "dark-towers-5",
        title: "أفق طوكيو الليلي وناطحات سحاب مستقبلية",
        url: "https://images.unsplash.com/photo-1503899036084-c55cdd92da26?w=1920&q=80",
        tag: "أبراج طوكيو",
      },
      {
        id: "dark-towers-6",
        title: "جسور معمارية وأبراج تنعكس على مياه البحر",
        url: "https://images.unsplash.com/photo-1508873696983-2df5293cb32b?w=1920&q=80",
        tag: "انعكاس ليلي",
      },
    ],
  },
  {
    title: "قصور وفيلات بإضاءات ليلية ومسابح (Night Luxury Villas)",
    icon: Trees,
    items: [
      {
        id: "dark-villa-1",
        title: "قصر فاخر مع مسبح مضاء وإضاءات ليلية",
        url: "https://images.unsplash.com/photo-1600585154526-990dced4db0d?w=1920&q=80",
        tag: "قصر ومسبح",
      },
      {
        id: "dark-villa-2",
        title: "فيلا مودرن بإضاءات أرضية معمارية ساحرة",
        url: "https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?w=1920&q=80",
        tag: "فيلا مضيئة",
      },
      {
        id: "dark-villa-3",
        title: "منزل فاخر متوهج في الليل وسط حديقة",
        url: "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=1920&q=80",
        tag: "فيلا ليلية",
      },
      {
        id: "dark-villa-4",
        title: "استراحة معمارية ملكية بإضاءات دافئة خافتة",
        url: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=1920&q=80",
        tag: "استراحة راقية",
      },
    ],
  },
  {
    title: "لوحات رسم وفنون معمارية ليلية (Dark Architectural Art)",
    icon: Palette,
    items: [
      {
        id: "dark-art-1",
        title: "لوحة أفق ليلي زيتي بتدرجات الكحلي والذهب",
        url: "https://images.unsplash.com/photo-1579783902614-a3fb3927b675?w=1920&q=80",
        tag: "زيتي ذهبي",
      },
      {
        id: "dark-art-2",
        title: "فن تجريدي معماري ليلي مع تدرجات ضوئية",
        url: "https://images.unsplash.com/photo-1550684848-fac1c5b4e853?w=1920&q=80",
        tag: "تجريد ليلي",
      },
      {
        id: "dark-art-3",
        title: "لوحة أكرليك لأبراج المدينة في الليل",
        url: "https://images.unsplash.com/photo-1578925518470-4def7a0f08bb?w=1920&q=80",
        tag: "أكرليك ليلي",
      },
      {
        id: "dark-art-4",
        title: "أفق معماري كوني ساحر في سكون الليل",
        url: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=1920&q=80",
        tag: "أفق كوني",
      },
    ],
  },
];

// ── ☀️ مكتبة حصرية 100% للوضع النهاري (Strictly Sunlit Daylight Luxury) ──
const LIGHT_PRESET_CATEGORIES: PresetCategory[] = [
  {
    title: "عماير وأبراج زجاجية مشرقة تحت الشمس (Sunlit Skylines)",
    icon: Building,
    items: [
      {
        id: "light-sky-1",
        title: "أبراج زجاجية شاهقة تحت السماء الزرقاء الصافية",
        url: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=1920&q=80",
        tag: "أبراج زجاجية",
      },
      {
        id: "light-sky-2",
        title: "عماير سكنية مودرن مع شرفات خضراء راقية",
        url: "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=1920&q=80",
        tag: "عماير وشرفات",
      },
      {
        id: "light-sky-3",
        title: "أفق ساحلي مشرق وعمارة بحرية حديثة",
        url: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1920&q=80",
        tag: "أفق ساحلي",
      },
      {
        id: "light-sky-4",
        title: "مجمعات عمرانية عصرية تحت أشعة الشمس الذهبية",
        url: "https://images.unsplash.com/photo-1479839672679-a46483c0e7c8?w=1920&q=80",
        tag: "مجمع عمراني",
      },
      {
        id: "light-sky-5",
        title: "عمارة هندسية بيضاء ناصعة وأفق مفتوح",
        url: "https://images.unsplash.com/photo-1444723121867-7a241cacace9?w=1920&q=80",
        tag: "عمارة بيضاء",
      },
      {
        id: "light-sky-6",
        title: "ناطحات سحاب معمارية بزاوية صاعدة ساطعة",
        url: "https://images.unsplash.com/photo-1486325212027-8081e485255e?w=1920&q=80",
        tag: "سماء زرقاء",
      },
    ],
  },
  {
    title: "فيلات ملكية وطبيعة خضراء وشجر ومسابح (Sunlit Villas & Gardens)",
    icon: Trees,
    items: [
      {
        id: "light-villa-1",
        title: "فيلا مودرن مع مسبح كريستالي ونخيل تحت الشمس",
        url: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1920&q=80",
        tag: "فيلا ومسبح",
      },
      {
        id: "light-villa-2",
        title: "قصر أبيض فاخر وسط حدائق خضراء غناء",
        url: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1920&q=80",
        tag: "قصر وحديقة",
      },
      {
        id: "light-villa-3",
        title: "قصر كلاسيكي فاخر مع حدائق ونخيل ومروج خضراء",
        url: "https://images.unsplash.com/photo-1580587771525-78b9dba3b914?w=1920&q=80",
        tag: "قصر ونخيل",
      },
      {
        id: "light-villa-4",
        title: "فيلا معمارية بتصميم فندقي ومسبح ومسطحات خضراء",
        url: "https://images.unsplash.com/photo-1613977257363-707ba9348227?w=1920&q=80",
        tag: "مسبح فندقي",
      },
      {
        id: "light-villa-5",
        title: "إطلالة مسبح إنفينيتي بانورامي فوق البحر",
        url: "https://images.unsplash.com/photo-1576013551627-0cc20b96c2a7?w=1920&q=80",
        tag: "مسبح بانورامي",
      },
    ],
  },
  {
    title: "لوحات رسم معمارية ملونة ومبهجة (Bright Architectural Art)",
    icon: Palette,
    items: [
      {
        id: "light-art-1",
        title: "لوحة فنية زيتية صيفية بتدرجات الألوان الطبيعية",
        url: "https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?w=1920&q=80",
        tag: "زيتي نهاري",
      },
      {
        id: "light-art-2",
        title: "رسم تجريدي مشرق ومبهج لعالم العقارات والهندسة",
        url: "https://images.unsplash.com/photo-1541701494587-cb58502866ab?w=1920&q=80",
        tag: "تجريد ملون",
      },
      {
        id: "light-art-3",
        title: "تدرجات شروق الشمس وألوان الباستيل المعمارية",
        url: "https://images.unsplash.com/photo-1534447677768-be436bb09401?w=1920&q=80",
        tag: "شروق وباستيل",
      },
      {
        id: "light-art-4",
        title: "لوحة زيتية معمارية مشرقة بألوان السماء والحدائق",
        url: "https://images.unsplash.com/photo-1579783902258-ce1e5143e8a2?w=1920&q=80",
        tag: "عمارة فنية",
      },
    ],
  },
];

const LUXURY_OVERLAY_PRESETS = [
  { label: "أسود ملكي", color: "#000000", desc: "سواد فاحم عميق" },
  { label: "كحلي ليلي", color: "#0B131B", desc: "كحلي أسود ملكي" },
  { label: "رمادي فحمي", color: "#18181B", desc: "رمادي داكن متزن" },
  { label: "رمادي جرافيت", color: "#1E293B", desc: "رمادي هادئ" },
  { label: "أبيض ناصع", color: "#FFFFFF", desc: "نقاء وإشراق كامل" },
  { label: "أوف وايت عاجي", color: "#FDFBF7", desc: "دفء كلاسيكي مريح" },
  { label: "رمادي بلاتيني", color: "#F1F5F9", desc: "لمسة بلاتينية راقية" },
];

export function HomeBackgroundManager({
  form,
  setForm,
  onSave,
  saving,
}: HomeBackgroundManagerProps) {
  const { toast } = useToast();
  const { updateSettings } = useData();
  const [activeTab, setActiveTab] = useState<"dark" | "light">("dark");
  const darkFileInputRef = useRef<HTMLInputElement>(null);
  const lightFileInputRef = useRef<HTMLInputElement>(null);

  const bgConfig: HomeBackgroundSettings = form.homeBackgroundSettings || {
    enabled: true,
    bgImageDark: "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=1920&q=80",
    overlayColorDark: "#000000",
    overlayOpacityDark: 75,
    blurDark: 1,
    imageOpacityDark: 90,
    bgImageLight: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1920&q=80",
    overlayColorLight: "#F8FAFC",
    overlayOpacityLight: 80,
    blurLight: 1,
    imageOpacityLight: 85,
  };

  const updateBg = (partial: Partial<HomeBackgroundSettings>) => {
    setForm((prev) => ({
      ...prev,
      homeBackgroundSettings: {
        ...(prev.homeBackgroundSettings || bgConfig),
        ...partial,
      },
    }));
  };

  const handleToggleMaster = async (checked: boolean) => {
    const updatedBg = {
      ...(form.homeBackgroundSettings || bgConfig),
      enabled: checked,
    };
    setForm((prev) => ({
      ...prev,
      homeBackgroundSettings: updatedBg,
    }));
    // Persist immediately to context & storage
    await updateSettings({
      ...form,
      homeBackgroundSettings: updatedBg,
    });
    toast({
      title: checked ? "تم تفعيل خلفيات المنصة بنجاح ✓" : "تم تعطيل خلفيات المنصة بنجاح ✕",
      description: checked ? "الخلفيات ستظهر الآن في الصفحة الرئيسية." : "تم إخفاء الخلفيات تماماً من الصفحة الرئيسية.",
    });
  };

  const handleFileUpload = (e: ChangeEvent<HTMLInputElement>, mode: "dark" | "light") => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "الصورة كبيرة جداً (الحد 5 ميجابايت)",
        variant: "destructive",
      });
      return;
    }
    const reader = new FileReader();
    reader.onload = (ev) => {
      const b64 = ev.target?.result as string;
      if (mode === "dark") {
        updateBg({ bgImageDark: b64 });
      } else {
        updateBg({ bgImageLight: b64 });
      }
      toast({ title: "تم رفع الخلفية بنجاح ✓" });
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  const handleSaveDirect = async () => {
    const targetBg = form.homeBackgroundSettings || bgConfig;
    const updatedForm = {
      ...form,
      homeBackgroundSettings: targetBg,
    };
    setForm(updatedForm);
    await updateSettings(updatedForm);
    toast({
      title: "تم حفظ إعدادات الخلفيات والمظهر بنجاح ✓",
      description: "تم تطبيق الخلفية ومزامنتها لحظياً على جميع الأجهزة.",
    });
  };

  const handleResetDefaults = async () => {
    const defaultBg: HomeBackgroundSettings = {
      enabled: true,
      bgImageDark: "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=1920&q=80",
      overlayColorDark: "#000000",
      overlayOpacityDark: 75,
      blurDark: 1,
      imageOpacityDark: 90,
      bgImageLight: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1920&q=80",
      overlayColorLight: "#F8FAFC",
      overlayOpacityLight: 80,
      blurLight: 1,
      imageOpacityLight: 85,
    };
    setForm((prev) => ({
      ...prev,
      homeBackgroundSettings: defaultBg,
    }));
    await updateSettings({
      ...form,
      homeBackgroundSettings: defaultBg,
    });
    toast({ title: "تمت استعادة الإعدادات الافتراضية الموصى بها ✓" });
  };

  const isCurrentDark = activeTab === "dark";
  const currentImg = isCurrentDark ? bgConfig.bgImageDark : bgConfig.bgImageLight;
  const currentOverlayColor = isCurrentDark ? (bgConfig.overlayColorDark || "#000000") : (bgConfig.overlayColorLight || "#F8FAFC");
  const currentOverlayOpacity = isCurrentDark ? (bgConfig.overlayOpacityDark ?? 75) : (bgConfig.overlayOpacityLight ?? 80);
  const currentBlur = isCurrentDark ? (bgConfig.blurDark ?? 1) : (bgConfig.blurLight ?? 1);
  const currentImgOpacity = isCurrentDark ? (bgConfig.imageOpacityDark ?? 90) : (bgConfig.imageOpacityLight ?? 85);

  const categoriesToShow = isCurrentDark ? DARK_PRESET_CATEGORIES : LIGHT_PRESET_CATEGORIES;

  return (
    <div className="space-y-6">
      {/* Master Enable/Disable Bar */}
      <Card className="card-luxury border-accent/30 shadow-md">
        <CardHeader className="py-4 px-5">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <CardTitle className="flex items-center gap-2 text-base sm:text-lg font-bold">
                <Sparkles className="h-5 w-5 text-accent" />
                خلفيات ومظهر المنصة
              </CardTitle>
              <CardDescription className="text-xs sm:text-sm mt-0.5">
                اختر خلفيات فاخرة للوضع الليلي والنهاري، مع تحكم فوري بطبقة الفلتر والشفافية والبلور.
              </CardDescription>
            </div>
            <div className="flex items-center gap-3 bg-muted/60 px-3.5 py-1.5 rounded-xl border border-border">
              <Label htmlFor="masterHomeBgEnabled" className="font-semibold text-xs sm:text-sm cursor-pointer">
                {bgConfig.enabled ? "الخلفيات مفعّلة ✓" : "الخلفيات معطلة ✕"}
              </Label>
              <Switch
                id="masterHomeBgEnabled"
                checked={bgConfig.enabled}
                onCheckedChange={handleToggleMaster}
              />
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Mode Switcher Tabs */}
      <div className="flex items-center justify-start gap-2.5 border-b border-border/80 pb-3">
        <Button
          type="button"
          variant={isCurrentDark ? "default" : "outline"}
          onClick={() => setActiveTab("dark")}
          className={`h-10 px-5 rounded-xl font-bold gap-2 text-xs sm:text-sm transition-all ${
            isCurrentDark
              ? "bg-[#10202D] text-[#D4AF37] border-2 border-[#D4AF37] shadow-md scale-[1.02]"
              : "hover:border-[#D4AF37]/50"
          }`}
        >
          <Moon className="h-4 w-4 text-[#D4AF37]" />
          خلفيات وفلاتر الوضع الليلي
        </Button>
        <Button
          type="button"
          variant={!isCurrentDark ? "default" : "outline"}
          onClick={() => setActiveTab("light")}
          className={`h-10 px-5 rounded-xl font-bold gap-2 text-xs sm:text-sm transition-all ${
            !isCurrentDark
              ? "bg-accent text-accent-foreground border-2 border-accent shadow-md scale-[1.02]"
              : "hover:border-accent/50"
          }`}
        >
          <Sun className="h-4 w-4 text-amber-500" />
          خلفيات وفلاتر الوضع النهاري
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left 7 Columns: Mode-Specific Presets Gallery & Upload */}
        <div className="lg:col-span-7 space-y-6">
          <Card className="card-luxury">
            <CardHeader className="py-4 px-5">
              <div className="flex items-center justify-between w-full">
                <CardTitle className="text-sm sm:text-base flex items-center gap-2 font-bold">
                  <ImageIcon className="h-4 w-4 text-accent shrink-0" />
                  {isCurrentDark ? "مكتبة خلفيات الوضع الليلي" : "مكتبة خلفيات الوضع النهاري"}
                </CardTitle>
                <span className={`text-[11px] font-bold px-2 py-0.5 rounded-md border shrink-0 whitespace-nowrap ${
                  isCurrentDark ? "bg-[#10202D] text-[#D4AF37] border-[#D4AF37]/40" : "bg-amber-100 text-amber-900 border-amber-300"
                }`}>
                  {isCurrentDark ? "🌙 ليلي" : "☀️ نهاري"}
                </span>
              </div>
              <CardDescription className="text-xs">
                انقر على أي خلفية لمعاينتها فوراً.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-5 px-5 pb-5">
              {categoriesToShow.map((cat, idx) => {
                const CatIcon = cat.icon;
                return (
                  <div key={idx} className="space-y-2">
                    <div className="flex items-center gap-2 text-xs font-bold text-foreground/90">
                      <CatIcon className="h-3.5 w-3.5 text-accent" />
                      <span>{cat.title}</span>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {cat.items.map((item) => {
                        const isSelected = currentImg === item.url;
                        return (
                          <button
                            key={item.id}
                            type="button"
                            onClick={() => {
                              if (isCurrentDark) {
                                updateBg({ bgImageDark: item.url });
                              } else {
                                updateBg({ bgImageLight: item.url });
                              }
                            }}
                            className={`group relative h-24 rounded-xl overflow-hidden border-2 text-right transition-all duration-200 ${
                              isSelected
                                ? "border-accent ring-2 ring-accent/50 shadow-md scale-[1.02] z-10"
                                : "border-border/60 hover:border-accent/60 opacity-85 hover:opacity-100"
                            }`}
                          >
                            <img
                              src={item.url}
                              alt={item.title}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                              loading="lazy"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent" />
                            <div className="absolute bottom-1 right-1.5 left-1.5 text-white">
                              <span className="block text-[10px] font-bold leading-tight truncate">
                                {item.title}
                              </span>
                              <span className="text-[9px] text-[#E6CC98] font-medium opacity-90">
                                {item.tag}
                              </span>
                            </div>
                            {isSelected && (
                              <div className="absolute top-1 left-1 w-4 h-4 rounded-full bg-accent text-white flex items-center justify-center shadow-xs">
                                <Check className="h-2.5 w-2.5 stroke-[3]" />
                              </div>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}

              {/* Upload Custom Image Option */}
              <div className="pt-3 border-t border-border/80 space-y-2.5">
                <div className="flex items-center justify-between">
                  <Label className="text-xs font-bold text-foreground">
                    أو ارفع خلفية من جهازك:
                  </Label>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      if (isCurrentDark) darkFileInputRef.current?.click();
                      else lightFileInputRef.current?.click();
                    }}
                    className="h-7 text-xs gap-1.5 border-accent/40 text-accent hover:bg-accent/10 font-bold px-3"
                  >
                    <Upload className="h-3 w-3" />
                    اختيار صورة
                  </Button>
                </div>

                <input
                  ref={darkFileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => handleFileUpload(e, "dark")}
                />
                <input
                  ref={lightFileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => handleFileUpload(e, "light")}
                />

                {/* Direct URL Input */}
                <div className="space-y-1">
                  <Label className="text-[10px] text-muted-foreground">أو ضع رابط مباشر للصورة:</Label>
                  <Input
                    dir="ltr"
                    placeholder="https://..."
                    value={currentImg || ""}
                    onChange={(e) => {
                      if (isCurrentDark) updateBg({ bgImageDark: e.target.value });
                      else updateBg({ bgImageLight: e.target.value });
                    }}
                    className="h-8 text-xs font-mono"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right 5 Columns: Filters, Overlay Colors, Sliders & Live Preview */}
        <div className="lg:col-span-5 space-y-6">
          {/* Overlay Color & Filter Controls Card */}
          <Card className="card-luxury">
            <CardHeader className="py-4 px-5">
              <CardTitle className="text-sm sm:text-base flex items-center gap-2 font-bold">
                <Palette className="h-4 w-4 text-accent" />
                الطبقة العازلة والفلاتر ({isCurrentDark ? "الوضع الليلي" : "الوضع النهاري"})
              </CardTitle>
              <CardDescription className="text-xs">
                تحكم بلون الفلتر وشفافيته ودرجة البلور والسطوع.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 px-5 pb-5">
              {/* Overlay Color Swatches */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <Label className="font-bold">لون الفلتر العازل:</Label>
                  <span className="font-mono text-accent font-bold">{currentOverlayColor}</span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                  {LUXURY_OVERLAY_PRESETS.map((p) => {
                    const isSelected = currentOverlayColor.toLowerCase() === p.color.toLowerCase();
                    return (
                      <button
                        key={p.color}
                        type="button"
                        onClick={() => {
                          if (isCurrentDark) updateBg({ overlayColorDark: p.color });
                          else updateBg({ overlayColorLight: p.color });
                        }}
                        className={`flex items-center gap-1.5 p-1.5 rounded-lg border text-right transition-all ${
                          isSelected
                            ? "border-accent ring-1.5 ring-accent/40 bg-accent/10 shadow-xs font-bold"
                            : "border-border/70 hover:border-accent/40 bg-card"
                        }`}
                      >
                        <span
                          className="w-3.5 h-3.5 rounded-full border border-black/20 shadow-xs shrink-0"
                          style={{ backgroundColor: p.color }}
                        />
                        <span className="text-[10px] truncate">{p.label}</span>
                      </button>
                    );
                  })}
                </div>

                {/* Custom Color Input */}
                <div className="flex items-center gap-2 pt-1">
                  <input
                    type="color"
                    value={currentOverlayColor}
                    onChange={(e) => {
                      if (isCurrentDark) updateBg({ overlayColorDark: e.target.value });
                      else updateBg({ overlayColorLight: e.target.value });
                    }}
                    className="w-7 h-7 rounded-md border border-border cursor-pointer shrink-0"
                  />
                  <Input
                    dir="ltr"
                    value={currentOverlayColor}
                    onChange={(e) => {
                      if (isCurrentDark) updateBg({ overlayColorDark: e.target.value });
                      else updateBg({ overlayColorLight: e.target.value });
                    }}
                    className="h-7 text-xs font-mono"
                    placeholder="#000000"
                  />
                  <span className="text-[10px] text-muted-foreground shrink-0">لون حر</span>
                </div>
              </div>

              {/* Overlay Opacity Slider */}
              <div className="space-y-2 pt-2 border-t border-border/60">
                <div className="flex items-center justify-between text-xs">
                  <Label className="font-bold">شفافية طبقة الفلتر (تغطية اللون):</Label>
                  <span className="font-bold font-mono text-accent">{currentOverlayOpacity}%</span>
                </div>
                <Slider
                  dir="ltr"
                  value={[currentOverlayOpacity]}
                  min={0}
                  max={100}
                  step={1}
                  onValueChange={(v) => {
                    if (isCurrentDark) updateBg({ overlayOpacityDark: v[0] });
                    else updateBg({ overlayOpacityLight: v[0] });
                  }}
                />
                <div className="flex justify-between text-[9px] text-muted-foreground">
                  <span>خلفية بارزة (20%)</span>
                  <span>متزنة (75%)</span>
                  <span>تعتيم كامل (100%)</span>
                </div>
              </div>

              {/* Image Opacity Slider */}
              <div className="space-y-2 pt-1">
                <div className="flex items-center justify-between text-xs">
                  <Label className="font-bold">سطوع ووضوح صورة الخلفية:</Label>
                  <span className="font-bold font-mono text-accent">{currentImgOpacity}%</span>
                </div>
                <Slider
                  dir="ltr"
                  value={[currentImgOpacity]}
                  min={10}
                  max={100}
                  step={1}
                  onValueChange={(v) => {
                    if (isCurrentDark) updateBg({ imageOpacityDark: v[0] });
                    else updateBg({ imageOpacityLight: v[0] });
                  }}
                />
              </div>

              {/* Blur Slider */}
              <div className="space-y-2 pt-1">
                <div className="flex items-center justify-between text-xs">
                  <Label className="font-bold">درجة البلور والتمويه الزجاجي:</Label>
                  <span className="font-bold font-mono text-accent">{currentBlur}px</span>
                </div>
                <Slider
                  dir="ltr"
                  value={[currentBlur]}
                  min={0}
                  max={20}
                  step={1}
                  onValueChange={(v) => {
                    if (isCurrentDark) updateBg({ blurDark: v[0] });
                    else updateBg({ blurLight: v[0] });
                  }}
                />
                <div className="flex justify-between text-[9px] text-muted-foreground">
                  <span>حادة ونقية (0px)</span>
                  <span>تمويه ناعم (2px)</span>
                  <span>تمويه زجاجي (10px)</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* ⚡ Live Instant Interactive Preview Box ⚡ */}
          <Card className="card-luxury border-accent/40 shadow-md">
            <CardHeader className="py-3 px-4">
              <div className="flex items-center justify-between">
                <CardTitle className="text-xs sm:text-sm flex items-center gap-1.5 font-bold">
                  <Eye className="h-4 w-4 text-accent animate-pulse" />
                  معاينة مباشرة للبطاقات فوق الخلفية
                </CardTitle>
                <span className="text-[10px] bg-accent/15 text-accent font-bold px-2 py-0.5 rounded-md shrink-0">
                  تحديث فوري ⚡
                </span>
              </div>
            </CardHeader>
            <CardContent className="p-3">
              <div
                className={`relative rounded-xl overflow-hidden p-4 sm:p-5 min-h-[200px] flex items-center justify-center border border-border shadow-inner transition-colors duration-300 ${
                  isCurrentDark ? "bg-black text-white" : "bg-[#F8FAFC] text-slate-900"
                }`}
              >
                {/* Live Background Simulator with active uncommitted config */}
                <HomeLuxuryBackground
                  forcedTheme={isCurrentDark ? "dark" : "light"}
                  overrideConfig={bgConfig}
                />

                {/* Simulated Floating Real Estate Card */}
                <div
                  className={`relative z-10 max-w-[260px] w-full p-3.5 rounded-xl border shadow-xl backdrop-blur-md transition-all ${
                    isCurrentDark
                      ? "bg-[#10202D]/95 border-accent/40 text-white shadow-black/80"
                      : "bg-white/95 border-border/80 text-slate-900 shadow-slate-300/80"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#C09C5A] to-[#A8823E] text-white flex items-center justify-center font-bold shadow-xs shrink-0">
                      <Building2 className="h-4 w-4" />
                    </div>
                    <div className="min-w-0">
                      <h4 className="font-bold text-xs truncate">برج العاصمة الفاخر</h4>
                      <p className="text-[9px] opacity-75 truncate">الشيخ زايد • إطلالة بانورامية</p>
                    </div>
                  </div>
                  <div className="mt-2.5 pt-2 border-t border-current/10 flex items-center justify-between text-xs">
                    <span className="font-bold text-accent text-[11px]">7,850,000 ج.م</span>
                    <span className="text-[9px] px-1.5 py-0.5 rounded-md bg-accent/20 text-accent font-bold">
                      {isCurrentDark ? "🌙 ليلي" : "☀️ نهاري"}
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Action Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-border">
        <Button
          onClick={handleSaveDirect}
          disabled={saving}
          className="bg-accent text-accent-foreground hover:bg-accent/90 gap-2 px-7 h-10 text-xs sm:text-sm font-bold shadow-md"
        >
          <Save className="h-4 w-4" />
          {saving ? "جارٍ الحفظ..." : "حفظ إعدادات الخلفيات والمظهر"}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={handleResetDefaults}
          className="gap-1.5 text-muted-foreground hover:text-foreground text-xs h-9"
        >
          <RotateCcw className="h-3 w-3" />
          استعادة الافتراضي
        </Button>
      </div>
    </div>
  );
}
