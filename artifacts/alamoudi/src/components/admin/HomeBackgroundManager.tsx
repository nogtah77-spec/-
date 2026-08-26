import React, { useState, useRef, ChangeEvent } from "react";
import {
  Sparkles,
  Moon,
  Sun,
  Palette,
  Upload,
  RotateCcw,
  Save,
  Check,
  Building2,
  Trees,
  Sliders,
  Eye,
  Layers,
  Image as ImageIcon,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { useData, type SiteSettings, type HomeBackgroundSettings } from "@/context/DataContext";
import { HomeLuxuryBackground } from "@/components/ui/HomeLuxuryBackground";

interface HomeBackgroundManagerProps {
  form: SiteSettings;
  setForm: React.Dispatch<React.SetStateAction<SiteSettings>>;
  onSave?: () => Promise<void>;
  saving?: boolean;
}

interface PresetItem {
  id: string;
  title: string;
  url: string;
  tag: string;
}

interface PresetCategory {
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  items: PresetItem[];
}

// ── 🌙 مكتبة حصرية 100% للوضع الليلي (Strictly Nighttime Luxury - All 200 OK) ──
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
        title: "برج معماري فاخر وتصميم هندسي شاهق",
        url: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=1920&q=80",
        tag: "برج هندسي",
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
        title: "أفق بحري مضاء مع معالم عالمية ساحرة",
        url: "https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9?w=1920&q=80",
        tag: "أفق بحري",
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
    title: "لوحات وفنون معمارية وتجريد ليلي (Dark Architectural Art)",
    icon: Palette,
    items: [
      {
        id: "dark-art-1",
        title: "لوحة تجريدية زاهية بتدرجات الذهب والظلال",
        url: "https://images.unsplash.com/photo-1541701494587-cb58502866ab?w=1920&q=80",
        tag: "فن ذهبي",
      },
      {
        id: "dark-art-2",
        title: "فن تجريدي معماري ليلي مع تدرجات ضوئية",
        url: "https://images.unsplash.com/photo-1550684848-fac1c5b4e853?w=1920&q=80",
        tag: "تجريد ليلي",
      },
      {
        id: "dark-art-3",
        title: "منحنيات هندسية ثلاثية الأبعاد فاخرة",
        url: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1920&q=80",
        tag: "موجات فاخرة",
      },
      {
        id: "dark-art-4",
        title: "أفق معماري كوني ساحر في سكون الليل",
        url: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=1920&q=80",
        tag: "كوني معماري",
      },
    ],
  },
];

// ── ☀️ مكتبة حصرية 100% للوضع النهاري (Strictly Daytime Luxury - All 200 OK) ──
const LIGHT_PRESET_CATEGORIES: PresetCategory[] = [
  {
    title: "قصور وفيلات نهارية مع مسابح وحدائق (Daylight Villas)",
    icon: Trees,
    items: [
      {
        id: "light-villa-1",
        title: "فيلا بيضاء ملكية تطل على مسبح بلوري",
        url: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1920&q=80",
        tag: "فيلا ومسبح",
      },
      {
        id: "light-villa-2",
        title: "قصر عصري مشرق بنور الشمس وتصميم زجاجي",
        url: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1920&q=80",
        tag: "قصر مشرق",
      },
      {
        id: "light-villa-3",
        title: "فيلا كلاسيكية فخمة وسط واحة خضراء",
        url: "https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=1920&q=80",
        tag: "فيلا كلاسيكية",
      },
      {
        id: "light-villa-4",
        title: "مقر سكني فاخر مع حديقة مشمسة ممتدة",
        url: "https://images.unsplash.com/photo-1580587771525-78b9dba3b914?w=1920&q=80",
        tag: "حديقة مشمسة",
      },
    ],
  },
  {
    title: "ناطحات سحاب وأبراج زجاجية نهارية (Daylight Towers)",
    icon: Building2,
    items: [
      {
        id: "light-tower-1",
        title: "أبراج زجاجية تعكس زرقة السماء الصافية",
        url: "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=1920&q=80",
        tag: "أبراج زجاجية",
      },
      {
        id: "light-tower-2",
        title: "أبراج مال وأعمال بواجهات معمارية شاهقة",
        url: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=1920&q=80",
        tag: "أبراج أعمال",
      },
      {
        id: "light-tower-3",
        title: "هيكل معماري حديث بلمسات بلاتينية هندسية",
        url: "https://images.unsplash.com/photo-1577495508048-b635879837f1?w=1920&q=80",
        tag: "معمار حديث",
      },
      {
        id: "light-tower-4",
        title: "مجمع ناطحات سحاب في قلب العاصمة مشرق",
        url: "https://images.unsplash.com/photo-1479839672679-a46483c0e7c8?w=1920&q=80",
        tag: "أبراج العاصمة",
      },
    ],
  },
  {
    title: "فنون معمارية وتصاميم داخلية فخمة (Daylight Interior & Art)",
    icon: Palette,
    items: [
      {
        id: "light-art-1",
        title: "تموجات معمارية فنية ناعمة بتدرجات راقية",
        url: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1920&q=80",
        tag: "تموجات فنية",
      },
      {
        id: "light-art-2",
        title: "لوحة فنية مشمسة بألوان مائية مريحة",
        url: "https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?w=1920&q=80",
        tag: "لوحة مائية",
      },
      {
        id: "light-art-3",
        title: "صالون معماري فندقي بإضاءة طبيعية وافرة",
        url: "https://images.unsplash.com/photo-1513519245088-0e12902e5a38?w=1920&q=80",
        tag: "ديكور فندقي",
      },
      {
        id: "light-art-4",
        title: "مجلس فاخر مكسو بالرخام والخشب والضوء",
        url: "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=1920&q=80",
        tag: "رخام وضوء",
      },
    ],
  },
];

// ── ألوان الفلاتر العازلة المقترحة ──
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
    overlayOpacityDark: 30,
    blurDark: 0,
    imageOpacityDark: 100,
    bgImageLight: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1920&q=80",
    overlayColorLight: "#FFFFFF",
    overlayOpacityLight: 35,
    blurLight: 0,
    imageOpacityLight: 100,
  };

  const updateBg = (partial: Partial<HomeBackgroundSettings>) => {
    setForm((prev) => {
      const current = prev.homeBackgroundSettings || bgConfig;
      const updated = {
        ...current,
        enabled: true,
        ...partial,
      };
      return {
        ...prev,
        homeBackgroundSettings: updated,
      };
    });
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
    const current = form.homeBackgroundSettings || bgConfig;
    const targetBg: HomeBackgroundSettings = {
      ...current,
      enabled: current.enabled !== false,
    };
    const updatedForm: SiteSettings = {
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
      overlayOpacityDark: 30,
      blurDark: 0,
      imageOpacityDark: 100,
      bgImageLight: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1920&q=80",
      overlayColorLight: "#FFFFFF",
      overlayOpacityLight: 35,
      blurLight: 0,
      imageOpacityLight: 100,
    };
    setForm((prev) => ({
      ...prev,
      homeBackgroundSettings: defaultBg,
    }));
    await updateSettings({
      ...form,
      homeBackgroundSettings: defaultBg,
    });
    toast({
      title: "تمت استعادة الإعدادات الافتراضية بنجاح ✓",
    });
  };

  const isCurrentDark = activeTab === "dark";
  const currentImg = isCurrentDark ? bgConfig.bgImageDark : bgConfig.bgImageLight;
  const currentOverlayColor = isCurrentDark ? (bgConfig.overlayColorDark || "#000000") : (bgConfig.overlayColorLight || "#FFFFFF");
  const currentOverlayOpacity = isCurrentDark ? (bgConfig.overlayOpacityDark ?? 30) : (bgConfig.overlayOpacityLight ?? 35);
  const currentBlur = isCurrentDark ? (bgConfig.blurDark ?? 0) : (bgConfig.blurLight ?? 0);
  const currentImageOpacity = isCurrentDark ? (bgConfig.imageOpacityDark ?? 100) : (bgConfig.imageOpacityLight ?? 100);

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

      {/* Dual Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left 7 Columns: Preset Image Library */}
        <div className="lg:col-span-7 space-y-5">
          <Card className="card-luxury">
            <CardHeader className="py-4 px-5">
              <CardTitle className="text-sm sm:text-base flex items-center gap-2 font-bold">
                <ImageIcon className="h-4 w-4 text-accent" />
                مكتبة الخلفيات الفاخرة ({isCurrentDark ? "ليلي" : "نهاري"})
              </CardTitle>
              <CardDescription className="text-xs">
                اختر لوحة أو خلفية معمارية جاهزة بدقة 4K فائقة الوضوح.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6 px-5 pb-5">
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
                    className="w-8 h-8 rounded-lg cursor-pointer border border-border bg-transparent p-0.5"
                  />
                  <Input
                    dir="ltr"
                    value={currentOverlayColor}
                    onChange={(e) => {
                      if (isCurrentDark) updateBg({ overlayColorDark: e.target.value });
                      else updateBg({ overlayColorLight: e.target.value });
                    }}
                    className="h-8 text-xs font-mono max-w-[130px]"
                  />
                  <span className="text-[10px] text-muted-foreground">لون مخصص</span>
                </div>
              </div>

              {/* Sliders: Overlay Opacity */}
              <div className="space-y-1.5 pt-2 border-t border-border/80">
                <div className="flex items-center justify-between text-xs">
                  <Label className="flex items-center gap-1.5">
                    <Layers className="h-3.5 w-3.5 text-accent" />
                    شفافية الفلتر العازل:
                  </Label>
                  <span className="font-bold font-mono text-accent">{currentOverlayOpacity}%</span>
                </div>
                <Slider
                  min={0}
                  max={100}
                  step={1}
                  value={[currentOverlayOpacity]}
                  onValueChange={([val]) => {
                    if (isCurrentDark) updateBg({ overlayOpacityDark: val });
                    else updateBg({ overlayOpacityLight: val });
                  }}
                  className="py-1"
                />
                <p className="text-[10px] text-muted-foreground">
                  (0% تظهر الصورة كاملة بدون فلتر، 30-40% مثالي للتباين، 90% خلفية داكنة جداً)
                </p>
              </div>

              {/* Sliders: Blur */}
              <div className="space-y-1.5 pt-2 border-t border-border/80">
                <div className="flex items-center justify-between text-xs">
                  <Label className="flex items-center gap-1.5">
                    <Sliders className="h-3.5 w-3.5 text-accent" />
                    درجة التمويه والبلور (Blur):
                  </Label>
                  <span className="font-bold font-mono text-accent">{currentBlur}px</span>
                </div>
                <Slider
                  min={0}
                  max={15}
                  step={1}
                  value={[currentBlur]}
                  onValueChange={([val]) => {
                    if (isCurrentDark) updateBg({ blurDark: val });
                    else updateBg({ blurLight: val });
                  }}
                  className="py-1"
                />
              </div>

              {/* Sliders: Image Brightness/Opacity */}
              <div className="space-y-1.5 pt-2 border-t border-border/80">
                <div className="flex items-center justify-between text-xs">
                  <Label className="flex items-center gap-1.5">
                    <Eye className="h-3.5 w-3.5 text-accent" />
                    سطوع ووضوح صورة الخلفية:
                  </Label>
                  <span className="font-bold font-mono text-accent">{currentImageOpacity}%</span>
                </div>
                <Slider
                  min={10}
                  max={100}
                  step={1}
                  value={[currentImageOpacity]}
                  onValueChange={([val]) => {
                    if (isCurrentDark) updateBg({ imageOpacityDark: val });
                    else updateBg({ imageOpacityLight: val });
                  }}
                  className="py-1"
                />
              </div>
            </CardContent>
          </Card>

          {/* Live Simulator Preview Card */}
          <Card className="card-luxury overflow-hidden">
            <CardHeader className="py-3 px-5 border-b border-border/60">
              <CardTitle className="text-xs sm:text-sm font-bold flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <Eye className="h-4 w-4 text-accent" />
                  معاينة حية للمظهر على الموقع
                </span>
                <span className="text-[10px] text-muted-foreground font-normal">
                  محاكاة وضع {isCurrentDark ? "🌙 الليلي" : "☀️ النهاري"}
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div
                className={`relative h-56 w-full overflow-hidden flex flex-col justify-between p-4 ${
                  isCurrentDark ? "dark text-white" : "light text-slate-900"
                }`}
              >
                {/* Embedded Background Renderer inside simulator */}
                <HomeLuxuryBackground
                  forcedTheme={isCurrentDark ? "dark" : "light"}
                  overrideConfig={bgConfig}
                />

                {/* Simulated Header */}
                <div className="relative z-10 flex items-center justify-between rounded-xl px-3 py-2 bg-card/85 backdrop-blur-md border border-border shadow-xs">
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 rounded-lg bg-accent text-accent-foreground flex items-center justify-center font-bold text-[10px]">
                      ع
                    </div>
                    <span className="text-xs font-bold">العمودي للتسويق العقاري</span>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-accent/15 text-accent font-semibold">
                    معاينة حية
                  </span>
                </div>

                {/* Simulated Card Content */}
                <div className="relative z-10 rounded-2xl p-3 bg-card/90 backdrop-blur-md border border-border shadow-md max-w-[240px]">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-xl bg-accent/15 text-accent flex items-center justify-center">
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
          className="bg-accent text-accent-foreground hover:bg-accent/90 gap-2 px-7 h-10 text-xs sm:text-sm font-bold shadow-md cursor-pointer"
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
