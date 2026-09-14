import React, { useState } from "react";
import {
  Palette,
  Sparkles,
  Check,
  CheckCircle2,
  Info,
  Eye,
  Sliders,
  Layers,
  Search,
  Plus,
  Building2,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import type { SiteSettings } from "@/context/DataContext";

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
  const [selectedTheme, setSelectedTheme] = useState<"classic" | "charcoal-pearl">("classic");

  return (
    <div className="space-y-6">
      {/* ── 1. Top Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-gradient-to-r from-card to-background border border-border/80 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <Palette className="h-5 w-5 text-accent" />
            <h3 className="text-base font-bold text-foreground">إدارة الهوية اللونية والثيمات</h3>
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">
            تخصيص النمط اللوني العام للمنصة، لوحة البحث المركزية، والأزرار التفاعلية لتوفير أفضل تجربة بصرية.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Badge variant="outline" className="px-3 py-1 bg-accent/10 border-accent/30 text-accent text-xs font-bold gap-1.5">
            <Sparkles className="h-3.5 w-3.5" />
            مظهر متقدم
          </Badge>
        </div>
      </div>

      {/* ── 2. Theme Selection Cards ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        
        {/* Theme 1: Classic Imperial Gold & Midnight Navy */}
        <Card 
          className={`cursor-pointer transition-all duration-300 border-2 overflow-hidden relative ${
            selectedTheme === "classic" 
              ? "border-[#C09C5A] shadow-md ring-1 ring-[#C09C5A]/30 bg-card" 
              : "border-border/80 hover:border-border hover:shadow-xs bg-card/60 opacity-90"
          }`}
          onClick={() => setSelectedTheme("classic")}
        >
          {selectedTheme === "classic" && (
            <div className="absolute top-3 left-3 z-10 flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#C09C5A] text-[#10202D] text-[11px] font-black shadow-xs">
              <Check className="h-3 w-3 stroke-[3]" />
              النشط حالياً
            </div>
          )}

          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-[#10202D] border border-[#C09C5A]/40 flex items-center justify-center text-[#C09C5A]">
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
              الهوية الرسمية الكلاسيكية المعتمدة للمنصة: خلفية كحلية ليلية عميقة مع لمسات ذهبية ملكية وتأثيرات زجاجية راقية.
            </p>

            {/* Color Palette Preview */}
            <div className="space-y-1.5">
              <span className="text-[11px] font-bold text-foreground block">لوحة الألوان الأساسية:</span>
              <div className="grid grid-cols-4 gap-2">
                <div className="flex flex-col items-center gap-1 p-2 rounded-xl bg-[#10202D] border border-white/10 text-white">
                  <div className="w-4 h-4 rounded-full bg-[#10202D] border border-white/30" />
                  <span className="text-[10px] font-mono">#10202D</span>
                  <span className="text-[9px] text-gray-300">الخلفية</span>
                </div>
                <div className="flex flex-col items-center gap-1 p-2 rounded-xl bg-[#183144] border border-white/10 text-white">
                  <div className="w-4 h-4 rounded-full bg-[#183144]" />
                  <span className="text-[10px] font-mono">#183144</span>
                  <span className="text-[9px] text-gray-300">البطاقات</span>
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
        </Card>

        {/* Theme 2: Modern Dark Charcoal & Pearl UI */}
        <Card 
          className={`cursor-pointer transition-all duration-300 border-2 overflow-hidden relative ${
            selectedTheme === "charcoal-pearl" 
              ? "border-[#0F766E] shadow-md ring-1 ring-[#0F766E]/30 bg-card" 
              : "border-border/80 hover:border-border hover:shadow-xs bg-card/60 opacity-90"
          }`}
          onClick={() => setSelectedTheme("charcoal-pearl")}
        >
          {selectedTheme === "charcoal-pearl" && (
            <div className="absolute top-3 left-3 z-10 flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#0F766E] text-white text-[11px] font-black shadow-xs">
              <Check className="h-3 w-3 stroke-[3]" />
              محدد
            </div>
          )}

          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-[#181C20] border border-[#0F766E]/50 flex items-center justify-center text-[#0F766E]">
                <Palette className="h-4 w-4" />
              </div>
              <div>
                <CardTitle className="text-sm font-bold">ثيم الفحم واللؤلؤ العصري</CardTitle>
                <CardDescription className="text-xs text-muted-foreground">Dark Charcoal & Pearl UI</CardDescription>
              </div>
            </div>
          </CardHeader>

          <CardContent className="space-y-3.5">
            <p className="text-xs text-muted-foreground leading-relaxed">
              الهوية العصرية الجديدة: دمج الخلفية الفحمية الهادئة مع لوحة بحث لؤلؤية مطفأة تمنع السطوع وتمنح تباينًا وقراءة فائقة النقاء.
            </p>

            {/* Color Palette Preview */}
            <div className="space-y-1.5">
              <span className="text-[11px] font-bold text-foreground block">لوحة الألوان الأساسية:</span>
              <div className="grid grid-cols-4 gap-2">
                <div className="flex flex-col items-center gap-1 p-2 rounded-xl bg-[#181C20] border border-white/10 text-white">
                  <div className="w-4 h-4 rounded-full bg-[#181C20] border border-white/30" />
                  <span className="text-[10px] font-mono">#181C20</span>
                  <span className="text-[9px] text-gray-300">فحمي</span>
                </div>
                <div className="flex flex-col items-center gap-1 p-2 rounded-xl bg-[#E2E8F0] border border-slate-300 text-[#0F172A]">
                  <div className="w-4 h-4 rounded-full bg-[#E2E8F0] border border-slate-400" />
                  <span className="text-[10px] font-mono">#E2E8F0</span>
                  <span className="text-[9px] text-slate-700">لؤلؤي</span>
                </div>
                <div className="flex flex-col items-center gap-1 p-2 rounded-xl bg-[#0F766E] text-white">
                  <div className="w-4 h-4 rounded-full bg-[#0F766E] border border-white/30" />
                  <span className="text-[10px] font-mono">#0F766E</span>
                  <span className="text-[9px] text-emerald-100">تركواز</span>
                </div>
                <div className="flex flex-col items-center gap-1 p-2 rounded-xl bg-[#D97706] text-white">
                  <div className="w-4 h-4 rounded-full bg-[#D97706] border border-white/30" />
                  <span className="text-[10px] font-mono">#D97706</span>
                  <span className="text-[9px] text-amber-100">نحاسي</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ── 3. Interactive Preview Box of Selected Theme ── */}
      <Card className="border-border/80 shadow-xs overflow-hidden">
        <CardHeader className="pb-3 border-b border-border/60 bg-muted/20">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Eye className="h-4 w-4 text-accent" />
              <CardTitle className="text-sm font-bold">معاينة تفاعلية حية لمظهر العناصر</CardTitle>
            </div>
            <span className="text-xs text-muted-foreground font-medium">
              {selectedTheme === "classic" ? "الثيم الملكي الكلاسيكي" : "ثيم الفحم واللؤلؤ العصري"}
            </span>
          </div>
        </CardHeader>

        <CardContent className="p-5">
          {selectedTheme === "classic" ? (
            /* Classic Theme Preview Mockup */
            <div className="p-4 sm:p-6 rounded-2xl bg-[#10202D] border border-[#C09C5A]/30 space-y-4">
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <span className="text-xs font-bold text-[#C09C5A]">شريط التنقل والهيدر</span>
                <span className="text-[11px] text-white/70">العمودي للتسويق العقاري</span>
              </div>

              {/* Action buttons */}
              <div className="grid grid-cols-3 gap-2">
                <div className="flex items-center justify-center gap-1.5 p-2 rounded-xl bg-gradient-to-br from-[#10202D] to-[#183144] border border-[#C09C5A]/40 text-white text-xs font-bold">
                  <Plus className="h-3.5 w-3.5 text-[#C09C5A]" />
                  <span>أعرض عقارك</span>
                </div>
                <div className="flex items-center justify-center gap-1.5 p-2 rounded-xl bg-white/5 border border-white/10 text-white/80 text-xs font-bold">
                  <Building2 className="h-3.5 w-3.5 text-[#C09C5A]" />
                  <span>التشطيبات</span>
                </div>
                <div className="flex items-center justify-center gap-1.5 p-2 rounded-xl bg-white/5 border border-white/10 text-white/80 text-xs font-bold">
                  <span>الاستشارات</span>
                </div>
              </div>

              {/* Search Widget */}
              <div className="p-3.5 rounded-xl bg-[#173044]/90 border border-white/10 space-y-3">
                <div className="flex items-center gap-2 p-2 rounded-lg bg-[#10202D] border border-white/10 text-white/60 text-xs">
                  <Search className="h-3.5 w-3.5 text-[#C09C5A]" />
                  <span>ابحث عن عقار، موقع، أو كود...</span>
                  <div className="mr-auto px-3 py-1 rounded bg-[#C09C5A] text-[#10202D] font-bold text-[11px]">
                    بحث
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* Modern Dark Charcoal & Pearl Theme Preview Mockup */
            <div className="p-4 sm:p-6 rounded-2xl bg-[#181C20] border border-[#94A3B8]/30 space-y-4">
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <span className="text-xs font-bold text-[#F8FAFC]">شريط التنقل والهيدر (خلفية فحمية #181C20)</span>
                <span className="text-[11px] text-[#CBD5E1]">العمودي للتسويق العقاري</span>
              </div>

              {/* Action buttons */}
              <div className="grid grid-cols-3 gap-2">
                <div className="flex items-center justify-center gap-1.5 p-2 rounded-xl bg-[#D97706] text-white text-xs font-bold shadow-sm">
                  <Plus className="h-3.5 w-3.5 text-white" />
                  <span>أعرض عقارك</span>
                </div>
                <div className="flex items-center justify-center gap-1.5 p-2 rounded-xl bg-[#23272C] border border-[#94A3B8]/30 text-[#F8FAFC] text-xs font-bold">
                  <Building2 className="h-3.5 w-3.5 text-[#0F766E]" />
                  <span>التشطيبات</span>
                </div>
                <div className="flex items-center justify-center gap-1.5 p-2 rounded-xl bg-[#23272C] border border-[#94A3B8]/30 text-[#F8FAFC] text-xs font-bold">
                  <span>الاستشارات</span>
                </div>
              </div>

              {/* Search Widget - Pearl Panel #E2E8F0 */}
              <div className="p-3.5 rounded-xl bg-[#E2E8F0] border border-[#94A3B8] space-y-3 shadow-sm">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#0F172A]">لوحة البحث اللؤلؤية (#E2E8F0 - مريحة للعين)</span>
                  <div className="flex gap-1">
                    <span className="px-2 py-0.5 rounded-full bg-[#0F766E] text-white text-[10px] font-bold">للبيع</span>
                    <span className="px-2 py-0.5 rounded-full bg-[#CBD5E1] text-[#0F172A] text-[10px] font-bold">للإيجار</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 p-2 rounded-lg bg-[#CBD5E1] border border-[#94A3B8] text-[#0F172A] text-xs">
                  <Search className="h-3.5 w-3.5 text-[#0F766E]" />
                  <span className="text-[#64748B]">ابحث عن عقار، موقع، أو كود...</span>
                  <div className="mr-auto px-3.5 py-1 rounded-md bg-[#0F766E] hover:bg-[#115E59] text-white font-bold text-[11px] shadow-xs">
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
