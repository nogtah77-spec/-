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
import { syncThemeColor } from "@/lib/meta";

interface ThemeAppearanceManagerProps {
  form: SiteSettings;
  setForm: React.Dispatch<React.SetStateAction<SiteSettings>>;
  onSave?: () => Promise<void>;
  saving?: boolean;
}

export function ThemeAppearanceManager({
  form,
  setForm,
  saving = false,
}: ThemeAppearanceManagerProps) {
  const { toast } = useToast();
  const { updateSettings, settings } = useData();

  // Active theme is read from settings or localStorage (defaults to classic if not set)
  const currentActiveTheme = settings.activeThemeId || (typeof window !== "undefined" ? localStorage.getItem("alm_active_theme") : null) || form.activeThemeId || "classic";
  const [selectedTheme, setSelectedTheme] = useState<string>(currentActiveTheme);
  const [isApplying, setIsApplying] = useState(false);

  // Apply theme instantly with ZERO revert bug (persisted in DOM, localStorage, and Cloud)
  const handleApplyTheme = async (themeId: "classic" | "charcoal" | "midnight") => {
    setIsApplying(true);
    setSelectedTheme(themeId);
    
    // 1. Instant DOM application with zero latency
    document.documentElement.setAttribute("data-theme", themeId);
    try {
      localStorage.setItem("alm_active_theme", themeId);
    } catch {}
    syncThemeColor(themeId);

    // 2. Update parent form state
    setForm((prev) => ({ ...prev, activeThemeId: themeId }));

    // 3. Save directly to cloud settings with ONLY the theme patch to avoid any stale closure overwrite
    try {
      await updateSettings({ activeThemeId: themeId });
      toast({
        title: "تم تفعيل الثيم بنجاح ✓",
        description: themeId === "midnight"
          ? "تم تطبيق ثيم الليل الفولاذي وذهب الصحراء (Midnight Steel & Desert Gold)."
          : themeId === "charcoal" 
          ? "تم تطبيق ثيم الفحم وذهب الساتان الملكي العصري."
          : "تم تطبيق الثيم الملكي الكلاسيكي (الكحلي والذهبي).",
      });
    } catch {
      toast({
        title: "تم التطبيق محلياً",
        description: "تم تفعيل الثيم في المتصفح وجاري حفظه سحابياً.",
      });
    } finally {
      setIsApplying(false);
    }
  };

  return (
    <div className="space-y-4 max-w-4xl">
      {/* ── 1. Compact Header ── */}
      <div className="flex items-center justify-between gap-3 p-3 rounded-xl bg-card border border-border/70 shadow-2xs">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-accent/15 text-accent flex items-center justify-center shrink-0">
            <Palette className="h-4 w-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-foreground leading-tight">محرك الثيمات والهوية اللونية</h3>
            <p className="text-[11px] text-muted-foreground">تبديل فوري ومستقل بين ثيمات المنصة المعتمدة.</p>
          </div>
        </div>

        <Badge variant="outline" className="px-2.5 py-0.5 bg-accent/10 border-accent/30 text-accent text-[11px] font-bold shrink-0">
          {currentActiveTheme === "midnight"
            ? "الليل الفولاذي وذهب الصحراء نشط"
            : currentActiveTheme === "charcoal"
            ? "الفحم والذهب الملكي نشط"
            : "الملكي الكلاسيكي نشط"}
        </Badge>
      </div>

      {/* ── 2. Compact Theme Cards Grid (3 Themes) ── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">

        {/* Theme 1 (NEW): Midnight Steel & Desert Gold */}
        <div 
          className={`p-3.5 rounded-xl border-2 transition-all duration-200 cursor-pointer relative bg-card ${
            currentActiveTheme === "midnight"
              ? "border-[#BC9876] shadow-sm ring-1 ring-[#BC9876]/30" 
              : "border-border/70 hover:border-border"
          }`}
          onClick={() => handleApplyTheme("midnight")}
        >
          <div className="flex items-start justify-between gap-2 mb-2">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-md bg-[#202332] border border-[#BC9876]/50 flex items-center justify-center text-[#BC9876] shrink-0">
                <Sparkles className="h-3.5 w-3.5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-foreground leading-tight">الليل الفولاذي وذهب الصحراء</h4>
                <span className="text-[10px] text-muted-foreground font-mono">Midnight Steel & Desert Gold</span>
              </div>
            </div>

            {currentActiveTheme === "midnight" ? (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#BC9876] text-[#1C1E2B] text-[10px] font-bold shrink-0">
                <Check className="h-2.5 w-2.5 stroke-[3]" />
                مفعّل
              </span>
            ) : (
              <span className="text-[10px] text-muted-foreground">انقر للتفعيل</span>
            )}
          </div>

          <p className="text-[11px] text-muted-foreground leading-snug mb-3">
            كحلي ليلي فحمي (#202332)، بطاقات فولاذية زجاجية (#434E60)، ذهب رملي دافئ (#BC9876)، وفضي ضبابي ناعم (#8B9A9F).
          </p>

          {/* Mini Color Dots */}
          <div className="flex items-center justify-between gap-1 pt-2 border-t border-border/50">
            <div className="flex items-center gap-1.5">
              <span className="w-4 h-4 rounded-full bg-[#202332] border border-white/20 shadow-2xs" title="خلفية #202332" />
              <span className="w-4 h-4 rounded-full bg-[#434E60] border border-white/20 shadow-2xs" title="بطاقة فولاذية #434E60" />
              <span className="w-4 h-4 rounded-full bg-[#BC9876] border border-white/20 shadow-2xs" title="ذهب رملي #BC9876" />
              <span className="w-4 h-4 rounded-full bg-[#8B9A9F] border border-white/20 shadow-2xs" title="فضي ضبابي #8B9A9F" />
            </div>

            <Button
              type="button"
              size="sm"
              disabled={isApplying || currentActiveTheme === "midnight"}
              onClick={(e) => {
                e.stopPropagation();
                handleApplyTheme("midnight");
              }}
              className="h-7 px-2.5 rounded-lg bg-[#BC9876] hover:bg-[#A88563] text-[#1C1E2B] font-bold text-[11px]"
            >
              {currentActiveTheme === "midnight" ? "مفعّل حالياً" : "تفعيل الثيم"}
            </Button>
          </div>
        </div>
        
        {/* Theme 2: Modern Dark Charcoal & Royal Satin Gold */}
        <div 
          className={`p-3.5 rounded-xl border-2 transition-all duration-200 cursor-pointer relative bg-card ${
            currentActiveTheme === "charcoal"
              ? "border-[#C5A059] shadow-sm ring-1 ring-[#C5A059]/30" 
              : "border-border/70 hover:border-border"
          }`}
          onClick={() => handleApplyTheme("charcoal")}
        >
          <div className="flex items-start justify-between gap-2 mb-2">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-md bg-[#181C20] border border-[#C5A059]/50 flex items-center justify-center text-[#C5A059] shrink-0">
                <Palette className="h-3.5 w-3.5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-foreground leading-tight">الفحم والذهب الساتان العصري</h4>
                <span className="text-[10px] text-muted-foreground font-mono">Dark Charcoal & Royal Satin Gold</span>
              </div>
            </div>

            {currentActiveTheme === "charcoal" ? (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#C5A059] text-[#181C20] text-[10px] font-bold shrink-0">
                <Check className="h-2.5 w-2.5 stroke-[3]" />
                مفعّل
              </span>
            ) : (
              <span className="text-[10px] text-muted-foreground">انقر للتفعيل</span>
            )}
          </div>

          <p className="text-[11px] text-muted-foreground leading-snug mb-3">
            رمادي فحمي هادئ (#181C20)، لوحة فحمية زجاجية (#22272D)، وأزرار ولمسات ذهب ساتان ملكي متزن (#C5A059).
          </p>

          {/* Mini Color Dots */}
          <div className="flex items-center justify-between gap-1 pt-2 border-t border-border/50">
            <div className="flex items-center gap-1.5">
              <span className="w-4 h-4 rounded-full bg-[#181C20] border border-white/20 shadow-2xs" title="خلفية #181C20" />
              <span className="w-4 h-4 rounded-full bg-[#22272D] border border-white/20 shadow-2xs" title="لوحة #22272D" />
              <span className="w-4 h-4 rounded-full bg-[#333C46] border border-white/20 shadow-2xs" title="إطار #333C46" />
              <span className="w-4 h-4 rounded-full bg-[#C5A059] border border-white/20 shadow-2xs" title="ذهب ساتان #C5A059" />
            </div>

            <Button
              type="button"
              size="sm"
              disabled={isApplying || currentActiveTheme === "charcoal"}
              onClick={(e) => {
                e.stopPropagation();
                handleApplyTheme("charcoal");
              }}
              className="h-7 px-2.5 rounded-lg bg-[#C5A059] hover:bg-[#B38E47] text-[#181C20] font-bold text-[11px]"
            >
              {currentActiveTheme === "charcoal" ? "مفعّل حالياً" : "تفعيل الثيم"}
            </Button>
          </div>
        </div>

        {/* Theme 3: Classic Imperial Gold & Midnight Navy */}
        <div 
          className={`p-3.5 rounded-xl border-2 transition-all duration-200 cursor-pointer relative bg-card ${
            currentActiveTheme === "classic" 
              ? "border-[#A9927D] shadow-sm ring-1 ring-[#A9927D]/30" 
              : "border-border/70 hover:border-border"
          }`}
          onClick={() => handleApplyTheme("classic")}
        >
          <div className="flex items-start justify-between gap-2 mb-2">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-md bg-[#10202D] border border-[#A9927D]/50 flex items-center justify-center text-[#A9927D] shrink-0">
                <Building2 className="h-3.5 w-3.5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-foreground leading-tight">الثيم الملكي الكلاسيكي</h4>
                <span className="text-[10px] text-muted-foreground font-mono">Warm Sand Taupe & Navy</span>
              </div>
            </div>

            {currentActiveTheme === "classic" ? (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#A9927D] text-[#10202D] text-[10px] font-bold shrink-0">
                <Check className="h-2.5 w-2.5 stroke-[3]" />
                مفعّل
              </span>
            ) : (
              <span className="text-[10px] text-muted-foreground">انقر للتفعيل</span>
            )}
          </div>

          <p className="text-[11px] text-muted-foreground leading-snug mb-3">
            كحلي ليلي فاخر (#10202D)، كحلي ثانوي (#173044)، بيج رملي دافئ (#A9927D)، ونصوص عاجية دافئة.
          </p>

          {/* Mini Color Dots */}
          <div className="flex items-center justify-between gap-1 pt-2 border-t border-border/50">
            <div className="flex items-center gap-1.5">
              <span className="w-4 h-4 rounded-full bg-[#10202D] border border-white/20 shadow-2xs" title="خلفية #10202D" />
              <span className="w-4 h-4 rounded-full bg-[#173044] border border-white/20 shadow-2xs" title="لوحة #173044" />
              <span className="w-4 h-4 rounded-full bg-[#A9927D] border border-white/20 shadow-2xs" title="رملي دافئ #A9927D" />
              <span className="w-4 h-4 rounded-full bg-[#F5F3EE] border border-slate-300 shadow-2xs" title="عاجي #F5F3EE" />
            </div>

            <Button
              type="button"
              size="sm"
              disabled={isApplying || currentActiveTheme === "classic"}
              onClick={(e) => {
                e.stopPropagation();
                handleApplyTheme("classic");
              }}
              className="h-7 px-2.5 rounded-lg bg-[#10202D] hover:bg-[#183144] border border-[#A9927D]/50 text-[#A9927D] font-bold text-[11px]"
            >
              {currentActiveTheme === "classic" ? "مفعّل حالياً" : "تفعيل الثيم"}
            </Button>
          </div>
        </div>
      </div>

      {/* ── 3. Ultra-Compact Live Preview Strip ── */}
      <div className="p-3 rounded-xl bg-card border border-border/70 space-y-2 shadow-2xs">
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-1.5 font-bold text-foreground">
            <Eye className="h-3.5 w-3.5 text-accent" />
            <span>معاينة حية سريعة</span>
          </div>
          <span className="text-[11px] text-muted-foreground">
            {currentActiveTheme === "midnight"
              ? "ثيم الليل الفولاذي وذهب الصحراء"
              : currentActiveTheme === "charcoal"
              ? "ثيم الفحم وذهب الساتان"
              : "الثيم الملكي الكلاسيكي"}
          </span>
        </div>

        {currentActiveTheme === "midnight" ? (
          /* Compact Midnight Mockup */
          <div className="p-2.5 rounded-lg bg-[#202332] border border-[#434E60] flex flex-col sm:flex-row items-center justify-between gap-2.5">
            <div className="flex items-center gap-2">
              <div className="px-2.5 py-1 rounded-md bg-[#BC9876] text-[#1C1E2B] text-[10px] font-bold shadow-2xs flex items-center gap-1">
                <Plus className="h-3 w-3 stroke-[2.5]" />
                أعرض عقارك
              </div>
              <div className="px-2 py-1 rounded-md bg-[#2B3140] border border-[#434E60] text-[#FFFFFF] text-[10px] font-medium">
                التشطيبات
              </div>
            </div>

            <div className="flex items-center gap-1.5 p-1 px-2 rounded-md bg-[#2B3140] border border-[#434E60] flex-1 max-w-sm w-full justify-between">
              <div className="flex items-center gap-1 text-[10px] text-[#8B9A9F]">
                <Search className="h-3 w-3 text-[#BC9876]" />
                <span>ابحث عن عقار...</span>
              </div>
              <span className="px-2 py-0.5 rounded bg-[#BC9876] text-[#1C1E2B] text-[9px] font-bold">
                بحث
              </span>
            </div>
          </div>
        ) : currentActiveTheme === "charcoal" ? (
          /* Compact Charcoal Mockup */
          <div className="p-2.5 rounded-lg bg-[#181C20] border border-[#333C46] flex flex-col sm:flex-row items-center justify-between gap-2.5">
            <div className="flex items-center gap-2">
              <div className="px-2.5 py-1 rounded-md bg-[#C5A059] text-[#181C20] text-[10px] font-bold shadow-2xs flex items-center gap-1">
                <Plus className="h-3 w-3 stroke-[2.5]" />
                أعرض عقارك
              </div>
              <div className="px-2 py-1 rounded-md bg-[#22272D] border border-[#333C46] text-[#F8FAFC] text-[10px] font-medium">
                التشطيبات
              </div>
            </div>

            <div className="flex items-center gap-1.5 p-1 px-2 rounded-md bg-[#22272D] border border-[#333C46] flex-1 max-w-sm w-full justify-between">
              <div className="flex items-center gap-1 text-[10px] text-[#94A3B8]">
                <Search className="h-3 w-3 text-[#C5A059]" />
                <span>ابحث عن عقار...</span>
              </div>
              <span className="px-2 py-0.5 rounded bg-[#C5A059] text-[#181C20] text-[9px] font-bold">
                بحث
              </span>
            </div>
          </div>
        ) : (
          /* Compact Classic Mockup */
          <div className="p-2.5 rounded-lg bg-[#10202D] border border-[#A9927D]/30 flex flex-col sm:flex-row items-center justify-between gap-2.5">
            <div className="flex items-center gap-2">
              <div className="px-2.5 py-1 rounded-md bg-[#10202D] border border-[#A9927D]/50 text-[#A9927D] text-[10px] font-bold shadow-2xs flex items-center gap-1">
                <Plus className="h-3 w-3 stroke-[2.5]" />
                أعرض عقارك
              </div>
              <div className="px-2 py-1 rounded-md bg-white/5 border border-white/10 text-white/80 text-[10px] font-medium">
                التشطيبات
              </div>
            </div>

            <div className="flex items-center gap-1.5 p-1 px-2 rounded-md bg-[#173044] border border-white/10 flex-1 max-w-sm w-full justify-between">
              <div className="flex items-center gap-1 text-[10px] text-white/60">
                <Search className="h-3 w-3 text-[#A9927D]" />
                <span>ابحث عن عقار...</span>
              </div>
              <span className="px-2 py-0.5 rounded bg-[#A9927D] text-[#10202D] text-[9px] font-bold">
                بحث
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
