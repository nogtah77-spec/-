import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { FileEdit, ArrowLeft, Bookmark, X, Clock, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn, formatNumber } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import {
  loadPropertyDraft,
  clearPropertyDraft,
  dismissDraftBanner,
  isDraftBannerDismissed,
  formatArabicRelativeTime,
  type PropertyDraftData,
} from "@/lib/propertyDraftService";

export function DraftRecoveryBanner() {
  const [draft, setDraft] = useState<PropertyDraftData | null>(null);
  const [location, setLocation] = useLocation();
  const { toast } = useToast();

  const isFormPage =
    location === "/admin/properties/new" ||
    (location.startsWith("/admin/properties/") && location.endsWith("/edit"));

  const checkDraft = () => {
    if (isDraftBannerDismissed()) {
      setDraft(null);
      return;
    }
    const currentDraft = loadPropertyDraft();
    setDraft(currentDraft);
  };

  useEffect(() => {
    checkDraft();

    const handleDraftChanged = () => {
      checkDraft();
    };

    window.addEventListener("alm-property-draft-changed", handleDraftChanged);
    window.addEventListener("storage", handleDraftChanged);

    return () => {
      window.removeEventListener("alm-property-draft-changed", handleDraftChanged);
      window.removeEventListener("storage", handleDraftChanged);
    };
  }, [location]);

  if (!draft || isFormPage) {
    return null;
  }

  const handleResume = () => {
    if (draft.isEdit && draft.editPropertyId) {
      setLocation(`/admin/properties/${draft.editPropertyId}/edit`);
    } else {
      setLocation("/admin/properties/new");
    }
  };

  const handleKeepInDrafts = () => {
    dismissDraftBanner();
    setDraft(null);
    toast({
      title: "تم حفظ المسودة بأمان ✓",
      description: "يمكنك العودة وإكمال إدخال العقار في أي وقت من لوحة التحكم.",
      duration: 3000,
    });
  };

  const handleDiscard = () => {
    if (window.confirm("هل أنت متأكد من رغبتك في حذف مسودة العقار هذه والبدء من جديد؟")) {
      clearPropertyDraft();
      setDraft(null);
      toast({
        title: "تم حذف المسودة",
        description: "تم مسح البيانات غير المكتملة بنجاح.",
        duration: 2500,
      });
    }
  };

  const codeOrTitle = draft.previewTitle || draft.form.code || "عقار جديد";
  const price = Number(draft.form.price);
  const timeAgo = formatArabicRelativeTime(draft.updatedAt);

  return (
    <div
      dir="rtl"
      className="fixed bottom-4 inset-x-2 sm:bottom-6 sm:inset-x-auto sm:right-6 sm:max-w-xl z-50 animate-in slide-in-from-bottom-5 fade-in duration-300"
    >
      <div className="relative overflow-hidden rounded-[14px] bg-gradient-to-b from-[#22272D]/98 via-[#181C20]/98 to-[#14171A]/98 border border-[#C5A059]/40 shadow-[0_16px_40px_rgba(0,0,0,0.65)] p-3 sm:p-4 backdrop-blur-2xl">
        {/* Luxury Top Ambient Glow Line */}
        <div className="absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-transparent via-[#C5A059] to-transparent pointer-events-none" />

        <div className="flex items-start justify-between gap-3">
          {/* Right Icon + Text */}
          <div className="flex items-start gap-2.5 sm:gap-3 flex-1 min-w-0">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-[#C5A059]/15 border border-[#C5A059]/30 flex items-center justify-center shrink-0 text-[#C5A059] shadow-inner mt-0.5">
              <FileEdit className="w-5 h-5 animate-pulse" />
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h4 className="text-xs sm:text-sm font-black text-white leading-tight">
                  لديك عقار قيد الإدخال لم يكتمل
                </h4>
                <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-[#C5A059] bg-[#C5A059]/10 px-1.5 py-0.5 rounded border border-[#C5A059]/20">
                  <Clock className="w-3 h-3" />
                  {timeAgo}
                </span>
              </div>

              {/* Preview Details */}
              <p className="text-[11px] sm:text-xs text-muted-foreground line-clamp-1 mt-1 font-medium">
                <span className="text-[#F8FAFC] font-bold">{codeOrTitle}</span>
                {price > 0 && (
                  <>
                    <span className="mx-1.5 text-white/30">•</span>
                    <span className="text-[#C5A059] font-mono font-bold">{formatNumber(price)} EGP</span>
                  </>
                )}
                {draft.images && draft.images.length > 0 && (
                  <>
                    <span className="mx-1.5 text-white/30">•</span>
                    <span>{draft.images.length} صور مرفوعة</span>
                  </>
                )}
              </p>
            </div>
          </div>

          {/* Quick Discard X button */}
          <button
            type="button"
            onClick={handleDiscard}
            className="text-muted-foreground/60 hover:text-red-400 p-1 rounded-md hover:bg-white/5 transition-colors shrink-0"
            title="حذف المسودة نهائياً"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Action Buttons Row (The 2 Buttons Requested) */}
        <div className="flex items-center gap-2 mt-3 pt-2.5 border-t border-white/10">
          {/* Button 1: Resume Editing */}
          <Button
            type="button"
            onClick={handleResume}
            className="flex-1 h-8.5 sm:h-9 text-xs sm:text-sm font-bold bg-[#C5A059] hover:bg-[#b08e4d] text-[#10202D] shadow-sm hover:shadow transition-all duration-200 gap-1.5 rounded-lg active:scale-98"
          >
            <span>إكمال الإدخال</span>
            <ArrowLeft className="w-3.5 h-3.5" />
          </Button>

          {/* Button 2: Save to Drafts / Dismiss */}
          <Button
            type="button"
            variant="outline"
            onClick={handleKeepInDrafts}
            className="flex-1 h-8.5 sm:h-9 text-xs sm:text-sm font-semibold bg-white/5 hover:bg-white/10 text-white/90 border-white/15 hover:border-white/25 rounded-lg gap-1.5 transition-colors"
          >
            <Bookmark className="w-3.5 h-3.5 text-[#C5A059]" />
            <span>حفظ في المسودة</span>
          </Button>
        </div>
      </div>
    </div>
  );
}
