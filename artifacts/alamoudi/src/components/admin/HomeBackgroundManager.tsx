import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
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
  LayoutGrid,
  Building,
  Layers,
  Waves,
  SunMedium,
  Image as ImageIcon,
  Save,
  RotateCcw,
  Eye,
} from "lucide-react";
import type { SiteSettings, HomeBackgroundSettings, BackgroundPatternType } from "@/context/DataContext";
import { HomeLuxuryBackground } from "@/components/ui/HomeLuxuryBackground";

interface HomeBackgroundManagerProps {
  form: SiteSettings;
  setForm: React.Dispatch<React.SetStateAction<SiteSettings>>;
  onSave: () => void;
  saving: boolean;
}

const PATTERNS: { id: BackgroundPatternType; label: string; desc: string; icon: any }[] = [
  {
    id: "architectural",
    label: "نقوش معمارية (Architectural)",
    desc: "خطوط وإحداثيات هندسية فاخرة باللون الذهبي والكحلي",
    icon: Building,
  },
  {
    id: "mashrabiya",
    label: "مشربية ملكية (Mashrabiya)",
    desc: "زخارف إسلامية وأرابيسك هندسية متناسقة وراقية",
    icon: LayoutGrid,
  },
  {
    id: "luxury_grid",
    label: "شبكة عصرية دقيقة (Luxury Grid)",
    desc: "شبكة مربعات ناعمة بأطراف تفاعلية خافتة",
    icon: Layers,
  },
  {
    id: "marble_waves",
    label: "تموجات رخامية (Marble Waves)",
    desc: "خطوط تضاريس انسيابية فخمة تحاكي عروق الرخام الطبيعي",
    icon: Waves,
  },
  {
    id: "ambient_aurora",
    label: "هالة ضوئية متدرجة (Ambient Aurora)",
    desc: "توهج أثيري ناعم في الخلفية يعطي إضاءة فندقية هادئة",
    icon: SunMedium,
  },
  {
    id: "custom",
    label: "صورة مخصصة (Custom Image)",
    desc: "استخدام رابط صورة مخصصة من اختيارك",
    icon: ImageIcon,
  },
];

export function HomeBackgroundManager({
  form,
  setForm,
  onSave,
  saving,
}: HomeBackgroundManagerProps) {
  const [activePreviewMode, setActivePreviewMode] = useState<"dark" | "light">("dark");

  const bgConfig: HomeBackgroundSettings = form.homeBackgroundSettings || {
    enabled: true,
    patternDark: "architectural",
    patternLight: "marble_waves",
    opacityDark: 45,
    opacityLight: 30,
    blurDark: 0,
    blurLight: 0,
    customImageDark: "",
    customImageLight: "",
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

  const handleResetDefaults = () => {
    updateBg({
      enabled: true,
      patternDark: "architectural",
      patternLight: "marble_waves",
      opacityDark: 45,
      opacityLight: 30,
      blurDark: 0,
      blurLight: 0,
      customImageDark: "",
      customImageLight: "",
    });
  };

  return (
    <div className="space-y-6">
      {/* Master Activation Card */}
      <Card className="card-luxury border-accent/30 shadow-md">
        <CardHeader>
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <CardTitle className="flex items-center gap-2 text-lg font-bold">
                <Sparkles className="h-5 w-5 text-accent" />
                خلفيات ونقوش الصفحة الرئيسية (Ambient Luxury Backgrounds)
              </CardTitle>
              <CardDescription className="mt-1">
                تفعيل وإدارة خلفيات ونقوش فاخرة تظهر خلف البطاقات والأقسام بالصفحة الرئيسية مع تحكم كامل بالشفافية والأنماط.
              </CardDescription>
            </div>
            <div className="flex items-center gap-3 bg-muted/50 px-4 py-2 rounded-xl border border-border">
              <Label htmlFor="homeBgEnabled" className="font-semibold text-sm cursor-pointer">
                {bgConfig.enabled ? "الخلفيات مفعّلة ✓" : "الخلفيات معطلة ✕"}
              </Label>
              <Switch
                id="homeBgEnabled"
                checked={bgConfig.enabled}
                onCheckedChange={(checked) => updateBg({ enabled: checked })}
              />
            </div>
          </div>
        </CardHeader>
      </Card>

      {bgConfig.enabled && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Dark Mode Background Card */}
          <Card className="card-luxury border-border/80 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-2 h-full bg-[#B88E4B]" />
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base text-foreground">
                <Moon className="h-4 w-4 text-accent" />
                خلفية الوضع الليلي (Dark Mode)
              </CardTitle>
              <CardDescription>
                تخصيص شكل ونمط وشفافية الخلفية في الوضع الداكن.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              {/* Pattern Selector */}
              <div className="space-y-2.5">
                <Label className="text-xs font-bold text-foreground">نمط النقش والخلفية:</Label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {PATTERNS.map((p) => {
                    const Icon = p.icon;
                    const isSelected = bgConfig.patternDark === p.id;
                    return (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => updateBg({ patternDark: p.id })}
                        className={`text-right p-3 rounded-xl border transition-all text-xs flex flex-col gap-1.5 ${
                          isSelected
                            ? "border-accent bg-accent/15 text-foreground shadow-xs font-bold"
                            : "border-border/70 hover:border-accent/40 bg-card hover:bg-muted/40 text-muted-foreground"
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <Icon className={`h-4 w-4 ${isSelected ? "text-accent" : "text-muted-foreground"}`} />
                          <span className="truncate">{p.label}</span>
                        </div>
                        <span className="text-[10px] text-muted-foreground font-normal line-clamp-2 leading-relaxed">
                          {p.desc}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Custom Image URL for Dark */}
              {bgConfig.patternDark === "custom" && (
                <div className="space-y-2 bg-muted/40 p-3.5 rounded-xl border border-border">
                  <Label className="text-xs font-semibold">رابط صورة الخلفية للوضع الليلي:</Label>
                  <Input
                    dir="ltr"
                    placeholder="https://images.unsplash.com/..."
                    value={bgConfig.customImageDark || ""}
                    onChange={(e) => updateBg({ customImageDark: e.target.value })}
                    className="text-xs font-mono"
                  />
                </div>
              )}

              {/* Opacity Slider */}
              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-foreground">درجة الشفافية والظهور:</span>
                  <span className="font-bold text-accent font-mono">{bgConfig.opacityDark ?? 45}%</span>
                </div>
                <Slider
                  dir="ltr"
                  value={[bgConfig.opacityDark ?? 45]}
                  min={5}
                  max={100}
                  step={1}
                  onValueChange={(v) => updateBg({ opacityDark: v[0] })}
                />
                <div className="flex justify-between text-[10px] text-muted-foreground">
                  <span>خافت وهادئ جداً (5%)</span>
                  <span>متزن وموصى به (40% - 50%)</span>
                  <span>بارز وقوي (100%)</span>
                </div>
              </div>

              {/* Blur Slider */}
              <div className="space-y-3 pt-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-foreground">درجة التمويه (Blur Effect):</span>
                  <span className="font-bold text-accent font-mono">{bgConfig.blurDark ?? 0}px</span>
                </div>
                <Slider
                  dir="ltr"
                  value={[bgConfig.blurDark ?? 0]}
                  min={0}
                  max={15}
                  step={1}
                  onValueChange={(v) => updateBg({ blurDark: v[0] })}
                />
              </div>
            </CardContent>
          </Card>

          {/* Light Mode Background Card */}
          <Card className="card-luxury border-border/80 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-2 h-full bg-[#D4AF37]" />
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base text-foreground">
                <Sun className="h-4 w-4 text-accent" />
                خلفية الوضع النهاري (Light Mode)
              </CardTitle>
              <CardDescription>
                تخصيص شكل ونمط وشفافية الخلفية في الوضع الفاتح.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              {/* Pattern Selector */}
              <div className="space-y-2.5">
                <Label className="text-xs font-bold text-foreground">نمط النقش والخلفية:</Label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {PATTERNS.map((p) => {
                    const Icon = p.icon;
                    const isSelected = bgConfig.patternLight === p.id;
                    return (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => updateBg({ patternLight: p.id })}
                        className={`text-right p-3 rounded-xl border transition-all text-xs flex flex-col gap-1.5 ${
                          isSelected
                            ? "border-accent bg-accent/15 text-foreground shadow-xs font-bold"
                            : "border-border/70 hover:border-accent/40 bg-card hover:bg-muted/40 text-muted-foreground"
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <Icon className={`h-4 w-4 ${isSelected ? "text-accent" : "text-muted-foreground"}`} />
                          <span className="truncate">{p.label}</span>
                        </div>
                        <span className="text-[10px] text-muted-foreground font-normal line-clamp-2 leading-relaxed">
                          {p.desc}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Custom Image URL for Light */}
              {bgConfig.patternLight === "custom" && (
                <div className="space-y-2 bg-muted/40 p-3.5 rounded-xl border border-border">
                  <Label className="text-xs font-semibold">رابط صورة الخلفية للوضع النهاري:</Label>
                  <Input
                    dir="ltr"
                    placeholder="https://images.unsplash.com/..."
                    value={bgConfig.customImageLight || ""}
                    onChange={(e) => updateBg({ customImageLight: e.target.value })}
                    className="text-xs font-mono"
                  />
                </div>
              )}

              {/* Opacity Slider */}
              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-foreground">درجة الشفافية والظهور:</span>
                  <span className="font-bold text-accent font-mono">{bgConfig.opacityLight ?? 30}%</span>
                </div>
                <Slider
                  dir="ltr"
                  value={[bgConfig.opacityLight ?? 30]}
                  min={5}
                  max={100}
                  step={1}
                  onValueChange={(v) => updateBg({ opacityLight: v[0] })}
                />
                <div className="flex justify-between text-[10px] text-muted-foreground">
                  <span>خافت وهادئ جداً (5%)</span>
                  <span>متزن وموصى به (25% - 35%)</span>
                  <span>بارز وقوي (100%)</span>
                </div>
              </div>

              {/* Blur Slider */}
              <div className="space-y-3 pt-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-foreground">درجة التمويه (Blur Effect):</span>
                  <span className="font-bold text-accent font-mono">{bgConfig.blurLight ?? 0}px</span>
                </div>
                <Slider
                  dir="ltr"
                  value={[bgConfig.blurLight ?? 0]}
                  min={0}
                  max={15}
                  step={1}
                  onValueChange={(v) => updateBg({ blurLight: v[0] })}
                />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Live Preview Box */}
      {bgConfig.enabled && (
        <Card className="card-luxury">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Eye className="h-4 w-4 text-accent" />
                  معاينة حية وفورية للخلفية
                </CardTitle>
                <CardDescription>
                  شاهد كيف ستظهر البطاقات والمحتوى فوق النمط المختار مباشرة.
                </CardDescription>
              </div>
              <div className="flex items-center gap-1 bg-muted p-1 rounded-xl border border-border">
                <Button
                  type="button"
                  size="sm"
                  variant={activePreviewMode === "dark" ? "default" : "ghost"}
                  onClick={() => setActivePreviewMode("dark")}
                  className={activePreviewMode === "dark" ? "bg-accent text-accent-foreground font-bold h-7 text-xs" : "h-7 text-xs"}
                >
                  <Moon className="h-3.5 w-3.5 ml-1" />
                  معاينة الليلي
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant={activePreviewMode === "light" ? "default" : "ghost"}
                  onClick={() => setActivePreviewMode("light")}
                  className={activePreviewMode === "light" ? "bg-accent text-accent-foreground font-bold h-7 text-xs" : "h-7 text-xs"}
                >
                  <Sun className="h-3.5 w-3.5 ml-1" />
                  معاينة النهاري
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div
              className={`relative rounded-2xl overflow-hidden p-6 sm:p-8 min-h-[200px] flex items-center justify-center border border-border shadow-inner transition-colors duration-500 ${
                activePreviewMode === "dark" ? "bg-[#0B131B] text-white" : "bg-[#F8FAFC] text-slate-900"
              }`}
            >
              {/* Dynamic Simulated Background */}
              <div className={activePreviewMode === "dark" ? "dark" : ""}>
                <HomeLuxuryBackground />
              </div>

              {/* Sample Floating Card Over Background */}
              <div
                className={`relative z-10 max-w-sm w-full p-4 rounded-xl border shadow-xl backdrop-blur-md transition-all ${
                  activePreviewMode === "dark"
                    ? "bg-[#10202D]/90 border-accent/40 text-white shadow-black/40"
                    : "bg-white/95 border-border/80 text-slate-900 shadow-slate-200/80"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#C09C5A] to-[#A8823E] text-white flex items-center justify-center font-bold shadow-xs">
                    <Building className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm">فيلا فاخرة للإيجار التمويلي</h4>
                    <p className="text-[11px] opacity-75">القاهرة الجديدة • التجمع الخامس</p>
                  </div>
                </div>
                <div className="mt-3 pt-2.5 border-t border-current/10 flex items-center justify-between text-xs">
                  <span className="font-bold text-accent">5,200,000 ج.م</span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-accent/20 text-accent font-semibold">
                    معاينة حية فوق النمط
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Save & Reset Actions */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
        <Button
          onClick={onSave}
          disabled={saving}
          className="bg-accent text-accent-foreground hover:bg-accent/90 gap-2 px-6 font-bold shadow-md"
        >
          <Save className="h-4 w-4" />
          {saving ? "جارٍ الحفظ..." : "حفظ إعدادات الخلفيات"}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={handleResetDefaults}
          className="gap-2 text-muted-foreground hover:text-foreground text-xs"
        >
          <RotateCcw className="h-3.5 w-3.5" />
          استعادة القيم الافتراضية الموصى بها
        </Button>
      </div>
    </div>
  );
}
