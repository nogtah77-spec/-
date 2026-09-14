import React, { useState } from "react";
import {
  Palette,
  Sparkles,
  Check,
  Eye,
  Search,
  Plus,
  Building2,
  CheckCircle2,
  RotateCcw,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useData, type SiteSettings } from "@/context/DataContext";

interface ThemeAppearanceManagerProps {
  form: SiteSettings;
  setForm: React.Dispatch<React.SetStateAction<SiteSettings>>;
  onSave?: () => Promise<void>;
  saving?: boolean;
}

export function ThemeAppearanceManager({
  form,
  setForm,
  onSave,
  saving = false,
}: ThemeAppearanceManagerProps) {
  const { toast } = useToast();
  const { updateSettings, settings } = useData();

  // Active theme is persisted in form, settings, or localStorage
  const currentActiveTheme = form.activeThemeId || settings.activeThemeId || (typeof window !== "undefined" ? localStorage.getItem("alm_active_theme") : null) || "charcoal";
  const [selectedTheme, setSelectedTheme] = useState<string>(currentActiveTheme);
  const [isApplying, setIsApplying] = useState(false);

  // Apply theme instantly and save to cloud & local storage
  const handleApplyTheme = async (themeId: "classic" | "charcoal") => {
    setIsApplying(true);
    setSelectedTheme(themeId);
    
    // 1. Instant DOM application with zero lag
    document.documentElement.setAttribute("data-theme", themeId);
    try {
      localStorage.setItem("alm_active_theme", themeId);
    } catch {}

    // 2. Update parent form state
    setForm((prev) => ({ ...prev, activeThemeId: themeId }));

    // 3. Persist to cloud settings
    try {
      await updateSettings({ ...form, activeThemeId: themeId });
      if (onSave) {
        await onSave();
      }
      toast({
        title: "تم تفعيل الثيم بنجاح ✓",
        description: themeId === "charcoal" 
          ? "تم تطبيق ثيم الفحم والبرونز والتركواز العصري على المنصة بالكامل."
          : "تم تطبيق الثيم الملكي الكلاسيكي (الكحلي والذهبي) على المنصة بالكامل.",
      });
    } catch {
      toast({
        title: "تم التطبيق محلياً",
        description: "تم تفعيل الثيم في المتصفح وجاري حفظه في السحابة.",
      });
    } finally {
      setIsApplying(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* ── 1. Top Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-gradient-to-r from-card to-background border border-border/80 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <Palette className="h-5 w-5 text-accent" />
            <h3 className="text-base font-bold text-foreground">إدارة الهوية اللونية ومحرك الثيمات المستقل</h3>
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">
            تبديل فوري وسلس بين الهويات اللونية المعتمدة للمنصة دون أي أثر جانبي على الوظائف أو المحتوى.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Badge variant="outline" className="px-3 py-1 bg-accent/10 border-accent/30 text-accent text-xs font-bold gap-1.5">
            <Sparkles className="h-3.5 w-3.5" />
            {currentActiveTheme === "charcoal" ? "ثيم الفحم والبرونز نشط" : "الثيم الملكي الكلاسيكي نشط"}
          </Badge>
        </div>
      </div>

      {/* ── 2. Theme Cards ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        
        {/* Theme 1: Modern Dark Charcoal & Deep Teal & Bronze */}
        <Card 
          className={`cursor-pointer transition-all duration-300 border-2 overflow-hidden relative ${
            selectedTheme === "charcoal" 
              ? "border-[#D97706] shadow-md ring-1 ring-[#D97706]/40 bg-card" 
              : "border-border/80 hover:border-border hover:shadow-xs bg-card/60 opacity-90"
          }`}
          onClick={() => setSelectedTheme("charcoal")}
        >
          {currentActiveTheme === "charcoal" && (
            <div className="absolute top-3 left-3 z-10 flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#D97706] text-white text-[11px] font-black shadow-xs">
              <Check className="h-3 w-3 stroke-[3]" />
              النشط حالياً
            </div>
          )}

          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-xl bg-[#181C20] border border-[#D97706]/50 flex items-center justify-center text-[#D97706] shadow-xs">
                <Palette className="h-4 w-4" />
              </div>
              <div>
                <CardTitle className="text-sm font-bold">ثيم الفحم والبرونز والتركواز العصري</CardTitle>
                <CardDescription className="text-xs text-muted-foreground">Dark Charcoal, Deep Teal & Bronze</CardDescription>
              </div>
            </div>
          </CardHeader>

          <CardContent className="space-y-3.5">
            <p className="text-xs text-muted-foreground leading-relaxed">
              هوية عصرية ملكية: خلفية فحمية حديدية هادئة، لوحة بحث وبطاقات فحمية زجاجية عميقة مريحة للعين (بدون بياض فاقع)، زر بحث تركوازي نيلي عميق، وأزرار نحاسية برونزية دافئة.
            </p>

            {/* Color Swatches */}
            <div className="space-y-1.5">
              <span className="text-[11px] font-bold text-foreground block">توزيع درجات الألوان:</span>
              <div className="grid grid-cols-4 gap-2">
                <div className="flex flex-col items-center gap-1 p-2 rounded-xl bg-[#181C20] border border-white/10 text-white">
                  <div className="w-4 h-4 rounded-full bg-[#181C20] border border-white/30" />
                  <span className="text-[10px] font-mono">#181C20</span>
                  <span className="text-[9px] text-gray-300">الخلفية</span>
                </div>
                <div className="flex flex-col items-center gap-1 p-2 rounded-xl bg-[#22272D] border border-[#333C46] text-white">
                  <div className="w-4 h-4 rounded-full bg-[#22272D] border border-white/20" />
                  <span className="text-[10px] font-mono">#22272D</span>
                  <span className="text-[9px] text-gray-300">لوحة البحث</span>
                </div>
                <div className="flex flex-col items-center gap-1 p-2 rounded-xl bg-[#0F766E] text-white shadow-xs">
                  <div className="w-4 h-4 rounded-full bg-[#0F766E] border border-white/30" />
                  <span className="text-[10px] font-mono">#0F766E</span>
                  <span className="text-[9px] text-emerald-100">زر البحث</span>
                </div>
                <div className="flex flex-col items-center gap-1 p-2 rounded-xl bg-[#D97706] text-white shadow-xs">
                  <div className="w-4 h-4 rounded-full bg-[#D97706] border border-white/30" />
                  <span className="text-[10px] font-mono">#D97706</span>
                  <span className="text-[9px] text-amber-100">أعرض عقارك</span>
                </div>
              </div>
            </div>
          </CardContent>

          <CardFooter className="pt-2 border-t border-border/40">
            <Button
              type="button"
              disabled={isApplying || saving || currentActiveTheme === "charcoal"}
              onClick={(e) => {
                e.stopPropagation();
                handleApplyTheme("charcoal");
              }}
              className="w-full h-9 rounded-xl bg-[#D97706] hover:bg-[#B45309] text-white font-bold text-xs gap-1.5 transition-all shadow-xs"
            >
              {currentActiveTheme === "charcoal" ? (
                <>
                  <CheckCircle2 className="h-4 w-4" />
                  هذا الثيم مفعّل حالياً في المنصة
                </>
              ) : (
                <>
                  <Palette className="h-4 w-4" />
                  تفعيل وتطبيق هذا الثيم على المنصة
                </>
              )}
            </Button>
          </CardFooter>
        </Card>

        {/* Theme 2: Classic Imperial Gold & Midnight Navy */}
        <Card 
          className={`cursor-pointer transition-all duration-300 border-2 overflow-hidden relative ${
            selectedTheme === "classic" 
              ? "border-[#C09C5A] shadow-md ring-1 ring-[#C09C5A]/40 bg-card" 
              : "border-border/80 hover:border-border hover:shadow-xs bg-card/60 opacity-90"
          }`}
          onClick={() => setSelectedTheme("classic")}
        >
          {currentActiveTheme === "classic" && (
            <div className="absolute top-3 left-3 z-10 flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#C09C5A] text-[#10202D] text-[11px] font-black shadow-xs">
              <Check className="h-3 w-3 stroke-[3]" />
              النشط حالياً
            </div>
          )}

          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-xl bg-[#10202D] border border-[#C09C5A]/40 flex items-center justify-center text-[#C09C5A] shadow-xs">
                <Sparkles className="h-4 w-4" />
              </div>
              <div>
                <CardTitle className="text-sm font-bold">الثيم الملكي الكلاسيكي</CardTitle>
                <CardDescription className="text-xs text-muted-foreground">Imperial Gold & Midnight Navy</CardDescription>
              </div>
            </div>
          </CardHeader>

          <CardContent className="space-y-3.5">
            <p className="text-xs text-muted-foreground leading-relaxed">
              الهوية الرسمية الكلاسيكية: خلفية كحلية ليلية عميقة، لمسات ذهبية ملكية راقية، نصوص عاجية دافئة، وتأثيرات زجاجية أصيلة.
            </p>

            {/* Color Swatches */}
            <div className="space-y-1.5">
              <span className="text-[11px] font-bold text-foreground block">توزيع درجات الألوان:</span>
              <div className="grid grid-cols-4 gap-2">
                <div className="flex flex-col items-center gap-1 p-2 rounded-xl bg-[#10202D] border border-white/10 text-white">
                  <div className="w-4 h-4 rounded-full bg-[#10202D] border border-white/30" />
                  <span className="text-[10px] font-mono">#10202D</span>
                  <span className="text-[9px] text-gray-300">الخلفية</span>
                </div>
                <div className="flex flex-col items-center gap-1 p-2 rounded-xl bg-[#173044] border border-white/10 text-white">
                  <div className="w-4 h-4 rounded-full bg-[#173044]" />
                  <span className="text-[10px] font-mono">#173044</span>
                  <span className="text-[9px] text-gray-300">لوحة البحث</span>
                </div>
                <div className="flex flex-col items-center gap-1 p-2 rounded-xl bg-[#10202D] border border-[#C09C5A]/40 text-[#C09C5A]">
                  <div className="w-4 h-4 rounded-full bg-[#C09C5A]" />
                  <span className="text-[10px] font-mono">#C09C5A</span>
                  <span className="text-[9px] text-[#E0CEB0]">الذهبي</span>
                </div>
                <div className="flex flex-col items-center gap-1 p-2 rounded-xl bg-slate-100 border border-slate-300 text-slate-900">
                  <div className="w-4 h-4 rounded-full bg-[#F5F3EE] border border-slate-300" />
                  <span className="text-[10px] font-mono">#F5F3EE</span>
                  <span className="text-[9px] text-slate-600">العاجي</span>
                </div>
              </div>
            </div>
          </CardContent>

          <CardFooter className="pt-2 border-t border-border/40">
            <Button
              type="button"
              disabled={isApplying || saving || currentActiveTheme === "classic"}
              onClick={(e) => {
                e.stopPropagation();
                handleApplyTheme("classic");
              }}
              className="w-full h-9 rounded-xl bg-[#10202D] hover:bg-[#183144] border border-[#C09C5A]/50 text-[#C09C5A] font-bold text-xs gap-1.5 transition-all shadow-xs"
            >
              {currentActiveTheme === "classic" ? (
                <>
                  <CheckCircle2 className="h-4 w-4" />
                  هذا الثيم مفعّل حالياً في المنصة
                </>
              ) : (
                <>
                  <RotateCcw className="h-4 w-4" />
                  تفعيل وتطبيق هذا الثيم على المنصة
                </>
              )}
            </Button>
          </CardFooter>
        </Card>
      </div>

      {/* ── 3. Live Simulator Preview (Non-Glare Luxury Presentation) ── */}
      <Card className="border-border/80 shadow-xs overflow-hidden">
        <CardHeader className="pb-3 border-b border-border/60 bg-muted/20">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Eye className="h-4 w-4 text-accent" />
              <CardTitle className="text-sm font-bold">المعاينة الحية الفورية لمظهر عناصر المنصة</CardTitle>
            </div>
            <span className="text-xs text-muted-foreground font-medium">
              {selectedTheme === "charcoal" ? "معاينة ثيم الفحم والبرونز العصري" : "معاينة الثيم الملكي الكلاسيكي"}
            </span>
          </div>
        </CardHeader>

        <CardContent className="p-5">
          {selectedTheme === "charcoal" ? (
            /* Modern Charcoal Theme Preview: Comfortable Deep Charcoal Glass (NO GLARE) */
            <div className="p-4 sm:p-6 rounded-2xl bg-[#181C20] border border-[#333C46] space-y-4 shadow-sm">
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <span className="text-xs font-bold text-[#F8FAFC]">الهيدر وشريط التنقل (#181C20)</span>
                <span className="text-[11px] text-[#94A3B8]">العمودي للتسويق العقاري</span>
              </div>

              {/* Action buttons */}
              <div className="grid grid-cols-3 gap-2">
                <div className="flex items-center justify-center gap-1.5 p-2 rounded-xl bg-gradient-to-br from-[#D97706] to-[#B45309] text-white text-xs font-bold shadow-sm border border-[#F59E0B]/40">
                  <Plus className="h-3.5 w-3.5 text-white stroke-[2.5]" />
                  <span>أعرض عقارك</span>
                </div>
                <div className="flex items-center justify-center gap-1.5 p-2 rounded-xl bg-[#22272D] border border-[#333C46] text-[#F8FAFC] text-xs font-bold">
                  <Building2 className="h-3.5 w-3.5 text-[#0F766E]" />
                  <span>خدمات التشطيبات</span>
                </div>
                <div className="flex items-center justify-center gap-1.5 p-2 rounded-xl bg-[#22272D] border border-[#333C46] text-[#F8FAFC] text-xs font-bold">
                  <span>اطرح استفسارك</span>
                </div>
              </div>

              {/* Deep Charcoal Glass Search Panel (#22272D) — Comfortable & Luxury */}
              <div className="p-4 rounded-2xl bg-[#22272D] border border-[#333C46] space-y-3 shadow-md">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#F8FAFC]">لوحة البحث والفلترة المركزية (#22272D — فحمية زجاجية مريحة للعين)</span>
                  <div className="flex gap-1.5">
                    <span className="px-2.5 py-0.5 rounded-full bg-[#0F766E] text-white text-[11px] font-bold shadow-xs">للبيع</span>
                    <span className="px-2.5 py-0.5 rounded-full bg-[#181C20] border border-[#333C46] text-[#94A3B8] text-[11px] font-bold">للإيجار</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 p-2 rounded-xl bg-[#181C20] border border-[#333C46] text-[#F8FAFC] text-xs">
                  <Search className="h-4 w-4 text-[#D97706] mr-1" />
                  <span className="text-[#94A3B8]">ابحث عن عقار، موقع، أو كود...</span>
                  <div className="mr-auto px-4 py-1.5 rounded-lg bg-[#0F766E] hover:bg-[#115E59] text-white font-bold text-xs shadow-xs">
                    بحث
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* Classic Theme Preview */
            <div className="p-4 sm:p-6 rounded-2xl bg-[#10202D] border border-[#C09C5A]/30 space-y-4 shadow-sm">
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <span className="text-xs font-bold text-[#C09C5A]">الهيدر وشريط التنقل (#10202D)</span>
                <span className="text-[11px] text-white/70">العمودي للتسويق العقاري</span>
              </div>

              {/* Action buttons */}
              <div className="grid grid-cols-3 gap-2">
                <div className="flex items-center justify-center gap-1.5 p-2 rounded-xl bg-gradient-to-br from-[#10202D] via-[#183144] to-[#10202D] border border-[#C09C5A]/40 text-white text-xs font-bold">
                  <Plus className="h-3.5 w-3.5 text-[#C09C5A] stroke-[2.5]" />
                  <span>أعرض عقارك</span>
                </div>
                <div className="flex items-center justify-center gap-1.5 p-2 rounded-xl bg-white/5 border border-white/10 text-white/80 text-xs font-bold">
                  <Building2 className="h-3.5 w-3.5 text-[#C09C5A]" />
                  <span>خدمات التشطيبات</span>
                </div>
                <div className="flex items-center justify-center gap-1.5 p-2 rounded-xl bg-white/5 border border-white/10 text-white/80 text-xs font-bold">
                  <span>اطرح استفسارك</span>
                </div>
              </div>

              {/* Search Widget */}
              <div className="p-4 rounded-2xl bg-[#173044]/90 border border-white/10 space-y-3">
                <div className="flex items-center gap-2 p-2 rounded-xl bg-[#10202D] border border-white/10 text-white/60 text-xs">
                  <Search className="h-4 w-4 text-[#C09C5A] mr-1" />
                  <span>ابحث عن عقار، موقع، أو كود...</span>
                  <div className="mr-auto px-4 py-1.5 rounded-lg bg-[#C09C5A] text-[#10202D] font-bold text-xs shadow-xs">
                    بحث
                  </div>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
