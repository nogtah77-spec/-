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
  Compass,
  Waves,
} from "lucide-react";
import type { SiteSettings, HomeBackgroundSettings } from "@/context/DataContext";
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

// ── 🌙 مكتبة مخصصة حصرياً للوضع الليلي (Dark Mode Presets) ──
const DARK_PRESET_CATEGORIES: PresetCategory[] = [
  {
    title: "أبراج وناطحات سحاب ليلية بإضاءات ذهبية (Night Skylines & Towers)",
    icon: Building2,
    items: [
      {
        id: "dark-towers-1",
        title: "ناطحات سحاب دبي المتوهجة ببريق ذهبي",
        url: "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=1920&q=80",
        tag: "دبي الذهبية",
      },
      {
        id: "dark-towers-2",
        title: "أفق مانهاتن الليلي وتلألؤ أضواء المدينة",
        url: "https://images.unsplash.com/photo-1514565131-fce0801e5785?w=1920&q=80",
        tag: "أفق نيويورك",
      },
      {
        id: "dark-towers-3",
        title: "عمارة زجاجية حديثة تحت سماء الشفق والليل",
        url: "https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9?w=1920&q=80",
        tag: "أبراج الشفق",
      },
      {
        id: "dark-towers-4",
        title: "أبراج سكنية وإضاءات كوزموبوليتان متلألئة",
        url: "https://images.unsplash.com/photo-1519501025264-65ba15a82390?w=1920&q=80",
        tag: "مدينة الأضواء",
      },
      {
        id: "dark-towers-5",
        title: "أفق طوكيو الليلي وناطحات سحاب مستقبلية",
        url: "https://images.unsplash.com/photo-1503899036084-c55cdd92da26?w=1920&q=80",
        tag: "أبراج طوكيو",
      },
      {
        id: "dark-towers-6",
        title: "جسور معمارية وأبراج تنعكس على مياه البحر ليلاً",
        url: "https://images.unsplash.com/photo-1508873696983-2df5293cb32b?w=1920&q=80",
        tag: "انعكاس البحر",
      },
    ],
  },
  {
    title: "قصور وفيلات بإضاءات ليلية ومسابح ساحرة (Night Luxury Estates & Pools)",
    icon: Trees,
    items: [
      {
        id: "dark-villa-1",
        title: "قصر فاخر مع مسبح مضاء ونخيل في سكون الليل",
        url: "https://images.unsplash.com/photo-1580587771525-78b9dba3b914?w=1920&q=80",
        tag: "قصر ومسبح ليلي",
      },
      {
        id: "dark-villa-2",
        title: "فيلا معمارية مودرن بإضاءات أرضية ساحرة",
        url: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1920&q=80",
        tag: "فيلا بإضاءة دافئة",
      },
      {
        id: "dark-villa-3",
        title: "مجمع سكني راقي بإضاءات حدائق ليلية",
        url: "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=1920&q=80",
        tag: "كمبوند ليلي",
      },
      {
        id: "dark-villa-4",
        title: "استراحة ريفية معمارية بإضاءات دافئة في الليل",
        url: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=1920&q=80",
        tag: "استراحة ريفية",
      },
    ],
  },
  {
    title: "لوحات رسم وفنون معمارية ليلية (Dark Luxury Architectural Art)",
    icon: Palette,
    items: [
      {
        id: "dark-art-1",
        title: "لوحة أفق ليلي زيتي بتدرجات الكحلي والذهب",
        url: "https://images.unsplash.com/photo-1579783902614-a3fb3927b675?w=1920&q=80",
        tag: "زيتي ليلي ذهبي",
      },
      {
        id: "dark-art-2",
        title: "فن تجريدي معماري ليلي مع تدرجات ضوئية",
        url: "https://images.unsplash.com/photo-1541701494587-cb58502866ab?w=1920&q=80",
        tag: "تجريد ليلي",
      },
      {
        id: "dark-art-3",
        title: "لوحة أكرليك تعبيرية لأبراج المدينة في الليل",
        url: "https://images.unsplash.com/photo-1578925518470-4def7a0f08bb?w=1920&q=80",
        tag: "أكرليك ليلي",
      },
      {
        id: "dark-art-4",
        title: "عمارة سيريالية نيون ليلية بهيبة ملكية",
        url: "https://images.unsplash.com/photo-1550684848-fac1c5b4e853?w=1920&q=80",
        tag: "نيون سيريالي",
      },
    ],
  },
];

// ── ☀️ مكتبة مخصصة حصرياً للوضع النهاري (Light Mode Presets) ──
const LIGHT_PRESET_CATEGORIES: PresetCategory[] = [
  {
    title: "عماير وأبراج زجاجية مشرقة تحت الشمس (Sunlit Modern Skylines)",
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
        title: "أفق مدن مفتوح وعمارة هندسية بيضاء ناصعة",
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
    title: "فيلات ملكية وطبيعة خضراء وشجر ومسابح (Sunlit Villas & Tropical Nature)",
    icon: Trees,
    items: [
      {
        id: "light-villa-1",
        title: "فيلا مودرن مع مسبح كريستالي ونخيل تحت الشمس",
        url: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1920&q=80",
        tag: "فيلا ومسبح نهاراً",
      },
      {
        id: "light-villa-2",
        title: "قصر أبيض فاخر وسط حدائق خضراء غناء",
        url: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1920&q=80",
        tag: "قصر وحديقة شمسية",
      },
      {
        id: "light-villa-3",
        title: "كمبوند سكني فاخر مع مسطحات مائية وحدائق",
        url: "https://images.unsplash.com/photo-1600565193348-f74bd3c7ccdf?w=1920&q=80",
        tag: "بحيرات وحدائق",
      },
      {
        id: "light-villa-4",
        title: "منزل معماري فندقي بين الأشجار والطبيعة المورقة",
        url: "https://images.unsplash.com/photo-1513694203232-719a280e022f?w=1920&q=80",
        tag: "طبيعة وشجر نهاراً",
      },
      {
        id: "light-villa-5",
        title: "إطلالة مسابح شمسية مذهلة واستراحات راقية",
        url: "https://images.unsplash.com/photo-1576013551627-0cc20b96c2a7?w=1920&q=80",
        tag: "مسابح ومنتجعات",
      },
    ],
  },
  {
    title: "لوحات رسم معمارية ملونة ومبهجة (Bright Artistic Paintings)",
    icon: Palette,
    items: [
      {
        id: "light-art-1",
        title: "لوحة فنية زيتية صيفية بتدرجات الألوان الطبيعية",
        url: "https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?w=1920&q=80",
        tag: "زيتي نهاري صيفي",
      },
      {
        id: "light-art-2",
        title: "رسم تجريدي مشرق ومبهج لعالم العقارات والهندسة",
        url: "https://images.unsplash.com/photo-1541701494587-cb58502866ab?w=1920&q=80",
        tag: "تجريد نهاري ملون",
      },
      {
        id: "light-art-3",
        title: "لوحة مائية تعبيرية لأفق معماري مبهج",
        url: "https://images.unsplash.com/photo-1578925518470-4def7a0f08bb?w=1920&q=80",
        tag: "ألوان مائية",
      },
      {
        id: "light-art-4",
        title: "تدرجات شروق الشمس وألوان الباستيل المعمارية",
        url: "https://images.unsplash.com/photo-1534447677768-be436bb09401?w=1920&q=80",
        tag: "شروق وباستيل",
      },
    ],
  },
];

const LUXURY_OVERLAY_PRESETS = [
  { label: "أسود ملكي", color: "#0B131B", desc: "أعلى درجات الفخامة والهيبة" },
  { label: "رمادي فحمي", color: "#18181B", desc: "هدوء عصري متزن" },
  { label: "كحلي ليلي", color: "#0F172A", desc: "عمق بحري ملكي" },
  { label: "رمادي جرافيت", color: "#1E293B", desc: "تباين ثلاثي الأبعاد" },
  { label: "أبيض لؤلؤي", color: "#FFFFFF", desc: "نقاء وإشراق فندقي" },
  { label: "أوف وايت عاجي", color: "#FDFBF7", desc: "دفء كلاسيكي مريح للعين" },
  { label: "رمادي بلاتيني", color: "#F1F5F9", desc: "لمسة عصرية راقية" },
];

export function HomeBackgroundManager({
  form,
  setForm,
  onSave,
  saving,
}: HomeBackgroundManagerProps) {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<"dark" | "light">("dark");
  const darkFileInputRef = useRef<HTMLInputElement>(null);
  const lightFileInputRef = useRef<HTMLInputElement>(null);

  const bgConfig: HomeBackgroundSettings = form.homeBackgroundSettings || {
    enabled: true,
    bgImageDark: "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=1920&q=80",
    overlayColorDark: "#0B131B",
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

  const handleResetDefaults = () => {
    updateBg({
      enabled: true,
      bgImageDark: "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=1920&q=80",
      overlayColorDark: "#0B131B",
      overlayOpacityDark: 75,
      blurDark: 1,
      imageOpacityDark: 90,
      bgImageLight: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1920&q=80",
      overlayColorLight: "#F8FAFC",
      overlayOpacityLight: 80,
      blurLight: 1,
      imageOpacityLight: 85,
    });
    toast({ title: "تمت استعادة الإعدادات الافتراضية الموصى بها ✓" });
  };

  const isCurrentDark = activeTab === "dark";
  const currentImg = isCurrentDark ? bgConfig.bgImageDark : bgConfig.bgImageLight;
  const currentOverlayColor = isCurrentDark ? bgConfig.overlayColorDark : bgConfig.overlayColorLight;
  const currentOverlayOpacity = isCurrentDark ? (bgConfig.overlayOpacityDark ?? 75) : (bgConfig.overlayOpacityLight ?? 80);
  const currentBlur = isCurrentDark ? (bgConfig.blurDark ?? 1) : (bgConfig.blurLight ?? 1);
  const currentImgOpacity = isCurrentDark ? (bgConfig.imageOpacityDark ?? 90) : (bgConfig.imageOpacityLight ?? 85);

  const categoriesToShow = isCurrentDark ? DARK_PRESET_CATEGORIES : LIGHT_PRESET_CATEGORIES;

  return (
    <div className="space-y-6">
      {/* Master Enable/Disable Bar */}
      <Card className="card-luxury border-accent/30 shadow-md">
        <CardHeader>
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <CardTitle className="flex items-center gap-2 text-lg font-bold">
                <Sparkles className="h-5 w-5 text-accent" />
                خلفيات الصفحة الرئيسية والمظهر الفني (Luxury Backgrounds & Overlays)
              </CardTitle>
              <CardDescription className="mt-1">
                اختر أو ارفع خلفيات فاخرة (عماير، أبراج، طبيعة وشجر، أو لوحات رسم) مخصصة للوضع الليلي والنهاري، مع تحكم فوري بالطبقة العازلة والبلور والشفافية مع معاينة حية تتغير لحظياً.
              </CardDescription>
            </div>
            <div className="flex items-center gap-3 bg-muted/60 px-4 py-2 rounded-xl border border-border">
              <Label htmlFor="masterHomeBgEnabled" className="font-semibold text-sm cursor-pointer">
                {bgConfig.enabled ? "الخلفيات مفعّلة ✓" : "الخلفيات معطلة ✕"}
              </Label>
              <Switch
                id="masterHomeBgEnabled"
                checked={bgConfig.enabled}
                onCheckedChange={(checked) => updateBg({ enabled: checked })}
              />
            </div>
          </div>
        </CardHeader>
      </Card>

      {bgConfig.enabled && (
        <>
          {/* Mode Switcher Tabs */}
          <div className="flex items-center justify-center sm:justify-start gap-3 border-b border-border/80 pb-3">
            <Button
              type="button"
              variant={isCurrentDark ? "default" : "outline"}
              onClick={() => setActiveTab("dark")}
              className={`h-11 px-6 rounded-xl font-bold gap-2 text-xs sm:text-sm transition-all ${
                isCurrentDark
                  ? "bg-[#10202D] text-[#D4AF37] border-2 border-[#D4AF37] shadow-lg shadow-black/40 scale-[1.02]"
                  : "hover:border-[#D4AF37]/50"
              }`}
            >
              <Moon className="h-4 w-4 text-[#D4AF37]" />
              خلفيات وفلاتر الوضع الليلي (Dark Mode Gallery)
            </Button>
            <Button
              type="button"
              variant={!isCurrentDark ? "default" : "outline"}
              onClick={() => setActiveTab("light")}
              className={`h-11 px-6 rounded-xl font-bold gap-2 text-xs sm:text-sm transition-all ${
                !isCurrentDark
                  ? "bg-accent text-accent-foreground border-2 border-accent shadow-lg shadow-accent/20 scale-[1.02]"
                  : "hover:border-accent/50"
              }`}
            >
              <Sun className="h-4 w-4 text-amber-500" />
              خلفيات وفلاتر الوضع النهاري (Light Mode Gallery)
            </Button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left 7 Columns: Mode-Specific Presets Gallery & Upload */}
            <div className="lg:col-span-7 space-y-6">
              <Card className="card-luxury">
                <CardHeader>
                  <CardTitle className="text-base flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      <ImageIcon className="h-4 w-4 text-accent" />
                      {isCurrentDark
                        ? "مكتبة خلفيات الوضع الليلي الفاخرة (أبراج ليلية، قصور، لوحات)"
                        : "مكتبة خلفيات الوضع النهاري الفاخرة (عماير شمسية، طبيعة، بحيرات)"}
                    </span>
                    <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                      isCurrentDark ? "bg-[#10202D] text-[#D4AF37] border border-[#D4AF37]/40" : "bg-amber-100 text-amber-900 border border-amber-300"
                    }`}>
                      {isCurrentDark ? "🌙 معروض لليلي" : "☀️ معروض للنهاري"}
                    </span>
                  </CardTitle>
                  <CardDescription>
                    انقر على أي بطاقة لتطبيقها ومعاينتها فوراً في صندوق المعاينة الحية.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {categoriesToShow.map((cat, idx) => {
                    const CatIcon = cat.icon;
                    return (
                      <div key={idx} className="space-y-2.5">
                        <div className="flex items-center gap-2 text-xs font-bold text-foreground/90">
                          <CatIcon className="h-4 w-4 text-accent" />
                          <span>{cat.title}</span>
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
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
                                className={`group relative h-24 sm:h-28 rounded-xl overflow-hidden border-2 text-right transition-all duration-300 ${
                                  isSelected
                                    ? "border-accent ring-2 ring-accent/50 shadow-lg scale-[1.03] z-10"
                                    : "border-border/60 hover:border-accent/60 opacity-85 hover:opacity-100"
                                }`}
                              >
                                <img
                                  src={item.url}
                                  alt={item.title}
                                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                  loading="lazy"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent" />
                                <div className="absolute bottom-1.5 right-1.5 left-1.5 text-white">
                                  <span className="block text-[10px] font-bold leading-tight truncate">
                                    {item.title}
                                  </span>
                                  <span className="text-[9px] text-[#E6CC98] font-medium opacity-90">
                                    {item.tag}
                                  </span>
                                </div>
                                {isSelected && (
                                  <div className="absolute top-1.5 left-1.5 w-5 h-5 rounded-full bg-accent text-white flex items-center justify-center shadow-md">
                                    <Check className="h-3 w-3 stroke-[3]" />
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
                  <div className="pt-4 border-t border-border/80 space-y-3">
                    <div className="flex items-center justify-between">
                      <Label className="text-xs font-bold text-foreground">
                        أو ارفع خلفية خاصة بك من جهازك (صورة، رسمة، أو تصميم):
                      </Label>
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          if (isCurrentDark) darkFileInputRef.current?.click();
                          else lightFileInputRef.current?.click();
                        }}
                        className="h-8 text-xs gap-1.5 border-accent/40 text-accent hover:bg-accent/10 font-bold"
                      >
                        <Upload className="h-3.5 w-3.5" />
                        اختيار صورة من الجهاز
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
                    <div className="space-y-1.5">
                      <Label className="text-[11px] text-muted-foreground">أو ضع رابط مباشر للصورة (Image URL):</Label>
                      <Input
                        dir="ltr"
                        placeholder="https://..."
                        value={currentImg || ""}
                        onChange={(e) => {
                          if (isCurrentDark) updateBg({ bgImageDark: e.target.value });
                          else updateBg({ bgImageLight: e.target.value });
                        }}
                        className="text-xs font-mono"
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
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <Palette className="h-4 w-4 text-accent" />
                    الطبقة العازلة والفلاتر ({isCurrentDark ? "الوضع الليلي" : "الوضع النهاري"})
                  </CardTitle>
                  <CardDescription>
                    تحكم بلون وشفافية الطبقة العازلة والبلور مع استجابة لحظية في المعاينة.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-5">
                  {/* Overlay Color Swatches */}
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between text-xs">
                      <Label className="font-bold">لون الطبقة العازلة (Overlay Tint):</Label>
                      <span className="font-mono text-accent font-semibold">{currentOverlayColor}</span>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
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
                            className={`flex items-center gap-2 p-2 rounded-xl border text-right transition-all ${
                              isSelected
                                ? "border-accent ring-2 ring-accent/40 bg-accent/10 shadow-xs font-bold"
                                : "border-border/70 hover:border-accent/40 bg-card"
                            }`}
                          >
                            <span
                              className="w-4 h-4 rounded-full border border-black/20 shadow-xs shrink-0"
                              style={{ backgroundColor: p.color }}
                            />
                            <span className="text-[11px] truncate">{p.label}</span>
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
                        className="w-8 h-8 rounded-lg border border-border cursor-pointer shrink-0"
                      />
                      <Input
                        dir="ltr"
                        value={currentOverlayColor}
                        onChange={(e) => {
                          if (isCurrentDark) updateBg({ overlayColorDark: e.target.value });
                          else updateBg({ overlayColorLight: e.target.value });
                        }}
                        className="h-8 text-xs font-mono"
                        placeholder="#0B131B"
                      />
                      <span className="text-[11px] text-muted-foreground shrink-0">لون حر مخصص</span>
                    </div>
                  </div>

                  {/* Overlay Opacity Slider */}
                  <div className="space-y-2.5 pt-2 border-t border-border/60">
                    <div className="flex items-center justify-between text-xs">
                      <Label className="font-bold">شفافية الطبقة العازلة (Overlay Tint Opacity):</Label>
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
                    <div className="flex justify-between text-[10px] text-muted-foreground">
                      <span>خلفية بارزة وواضحة (20%)</span>
                      <span>متزنة وفخمة (75%)</span>
                      <span>معتمة تماماً (100%)</span>
                    </div>
                  </div>

                  {/* Image Opacity Slider */}
                  <div className="space-y-2.5 pt-1">
                    <div className="flex items-center justify-between text-xs">
                      <Label className="font-bold">سطوع ووضوح صورة الخلفية (Image Opacity):</Label>
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
                  <div className="space-y-2.5 pt-1">
                    <div className="flex items-center justify-between text-xs">
                      <Label className="font-bold">درجة البلور والتمويه (Background Blur):</Label>
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
                    <div className="flex justify-between text-[10px] text-muted-foreground">
                      <span>حادة ونقية (0px)</span>
                      <span>تمويه ناعم خفيف (2px)</span>
                      <span>تمويه زجاجي فندقي (10px)</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* ⚡ Live Instant Interactive Preview Box ⚡ */}
              <Card className="card-luxury border-accent/40 shadow-lg">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <Eye className="h-4 w-4 text-accent animate-pulse" />
                      معاينة حية ومباشرة (تتغير لحظياً مع كل حركة)
                    </CardTitle>
                    <span className="text-[10px] bg-accent/15 text-accent font-bold px-2 py-0.5 rounded-md">
                      تحديث فوري Live ⚡
                    </span>
                  </div>
                </CardHeader>
                <CardContent>
                  <div
                    className={`relative rounded-2xl overflow-hidden p-5 sm:p-6 min-h-[230px] flex items-center justify-center border border-border shadow-inner transition-colors duration-500 ${
                      isCurrentDark ? "bg-[#0B131B] text-white" : "bg-[#F8FAFC] text-slate-900"
                    }`}
                  >
                    {/* Live Background Simulator with live active config */}
                    <HomeLuxuryBackground
                      forcedTheme={isCurrentDark ? "dark" : "light"}
                      overrideConfig={bgConfig}
                    />

                    {/* Simulated Floating Real Estate Card */}
                    <div
                      className={`relative z-10 max-w-xs w-full p-4 rounded-xl border shadow-2xl backdrop-blur-md transition-all ${
                        isCurrentDark
                          ? "bg-[#10202D]/95 border-accent/40 text-white shadow-black/60"
                          : "bg-white/95 border-border/80 text-slate-900 shadow-slate-300/80"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#C09C5A] to-[#A8823E] text-white flex items-center justify-center font-bold shadow-xs">
                          <Building2 className="h-5 w-5" />
                        </div>
                        <div>
                          <h4 className="font-bold text-xs sm:text-sm">برج العاصمة الفاخر</h4>
                          <p className="text-[10px] opacity-80">الشيخ زايد • إطلالة بانورامية</p>
                        </div>
                      </div>
                      <div className="mt-3 pt-2.5 border-t border-current/10 flex items-center justify-between text-xs">
                        <span className="font-bold text-accent">7,850,000 ج.م</span>
                        <span className="text-[9px] px-2 py-0.5 rounded-full bg-accent/20 text-accent font-bold">
                          {isCurrentDark ? "معاينة الوضع الليلي" : "معاينة الوضع النهاري"}
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Action Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-border">
            <Button
              onClick={onSave}
              disabled={saving}
              className="bg-accent text-accent-foreground hover:bg-accent/90 gap-2 px-8 h-11 text-sm font-bold shadow-lg"
            >
              <Save className="h-4 w-4" />
              {saving ? "جارٍ الحفظ..." : "حفظ إعدادات الخلفيات والمظهر"}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={handleResetDefaults}
              className="gap-2 text-muted-foreground hover:text-foreground text-xs h-10"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              استعادة الخلفيات والإعدادات الافتراضية
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
