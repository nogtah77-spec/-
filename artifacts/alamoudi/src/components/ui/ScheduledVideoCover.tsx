import { Video, Clock, Play, ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";

interface ScheduledVideoCoverProps {
  variant?: "card-compact" | "card-grid" | "detail";
  videoUrl?: string | null;
  className?: string;
  onOpenReminder?: (e: React.MouseEvent) => void;
}

export function ScheduledVideoCover({
  variant = "card-grid",
  videoUrl,
  className,
  onOpenReminder,
}: ScheduledVideoCoverProps) {
  // ── 1. COMPACT CARD (List layout on mobile / carousels) ──
  if (variant === "card-compact") {
    return (
      <div
        className={cn(
          "absolute inset-0 w-full h-full bg-gradient-to-br from-[#1C232B] via-[#12161A] to-[#0A0D10] flex flex-col items-center justify-center p-2 text-center select-none overflow-hidden",
          className
        )}
      >
        {/* Soft radial champagne glow in background */}
        <div className="absolute w-24 h-24 bg-[#C5A059]/15 rounded-full blur-xl pointer-events-none" />

        {/* Golden emblem with pulsing dot */}
        <div className="relative w-9 h-9 rounded-full bg-gradient-to-b from-[#C5A059]/25 via-black/60 to-black border border-[#C5A059]/40 flex items-center justify-center shadow-md mb-1.5 shrink-0">
          <Video className="h-4 w-4 text-[#C5A059]" />
          <span className="absolute -top-0.5 -right-0.5 flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#C5A059] opacity-75" />
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#C5A059]" />
          </span>
        </div>

        {/* Clear, concise text */}
        <span className="text-[11px] font-black text-white leading-tight drop-shadow-[0_1px_2px_rgba(0,0,0,0.9)]">
          فيديو المعاينة
        </span>
        <span className="text-[10px] font-bold text-[#DFC184] mt-0.5 leading-tight">
          قريباً
        </span>
        <span className="text-[8.5px] text-white/60 mt-1 leading-tight line-clamp-2 px-1">
          في الموعد المحدد
        </span>
      </div>
    );
  }

  // ── 2. GRID CARD (16:10 standard property card) ──
  if (variant === "card-grid") {
    return (
      <div
        className={cn(
          "absolute inset-0 w-full h-full bg-gradient-to-br from-[#1C232B] via-[#12161A] to-[#0A0D10] flex flex-col items-center justify-center p-4 text-center select-none overflow-hidden",
          className
        )}
      >
        {/* Soft radial glow */}
        <div className="absolute w-44 h-44 bg-[#C5A059]/15 rounded-full blur-2xl pointer-events-none" />

        {/* Center luxury emblem */}
        <div className="relative w-13 h-13 rounded-full bg-gradient-to-b from-[#C5A059]/25 via-black/60 to-black border border-[#C5A059]/50 flex items-center justify-center shadow-xl mb-2.5 shrink-0">
          <Video className="h-6 w-6 text-[#C5A059]" />
          <span className="absolute -top-0.5 -right-0.5 flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#C5A059] opacity-75" />
            <span className="relative inline-flex rounded-full h-3 w-3 bg-[#C5A059]" />
          </span>
        </div>

        {/* Typography */}
        <span className="text-sm font-black text-white tracking-wide drop-shadow-[0_1px_3px_rgba(0,0,0,0.9)]">
          فيديو المعاينة قريباً
        </span>
        <span className="text-[11px] text-[#DFC184] font-medium mt-1">
          سيتم نشر الفيديو في الموعد المحدد
        </span>
      </div>
    );
  }

  // ── 3. DETAIL PAGE (Property Details Hero) ──
  return (
    <div
      className={cn(
        "relative w-full h-[300px] sm:h-[380px] rounded-xl overflow-hidden bg-gradient-to-b from-[#1C232B] via-[#12161A] to-[#0A0D10] border border-[#C5A059]/40 shadow-[0_16px_48px_rgba(0,0,0,0.6)] flex flex-col items-center justify-center p-6 text-center mb-10 select-none",
        className
      )}
    >
      {/* Top subtle golden hairline */}
      <div className="absolute inset-x-0 top-0 h-[1.5px] bg-gradient-to-r from-transparent via-[#C5A059]/70 to-transparent pointer-events-none" />

      {/* Floating background aura */}
      <div className="absolute w-72 h-72 bg-[#C5A059]/15 rounded-full blur-3xl pointer-events-none" />

      {/* Premiere Pill Badge */}
      <div className="relative z-10 inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-[#C5A059]/15 border border-[#C5A059]/40 text-[#DFC184] text-xs font-bold mb-3.5 backdrop-blur-md shadow-xs">
        <Clock className="h-3.5 w-3.5" />
        <span>عرض أول مجدول على يوتيوب</span>
      </div>

      {/* Center Emblem */}
      <div className="relative z-10 w-20 h-20 rounded-full bg-gradient-to-b from-[#C5A059]/25 via-black/70 to-black border-2 border-[#C5A059]/50 flex items-center justify-center shadow-[0_0_30px_rgba(197,160,89,0.25)] mb-3">
        <Video className="h-9 w-9 text-[#C5A059]" />
      </div>

      {/* Heading & Details */}
      <h3 className="relative z-10 text-xl sm:text-2xl font-black text-white mb-2 tracking-wide">
        فيديو المعاينة لهذا العقار قريباً
      </h3>
      <p className="relative z-10 text-xs sm:text-sm text-white/70 max-w-md leading-relaxed mb-5">
        تمت جدولة موعد عرض الفيديو على قناتنا في يوتيوب، وسيظهر الفيديو تلقائياً في الموعد المحدد.
      </p>

      {/* Watch / Set reminder button */}
      {videoUrl && (
        <a
          href={videoUrl}
          target="_blank"
          rel="noopener noreferrer"
          onClick={(e) => {
            e.stopPropagation();
            if (onOpenReminder) onOpenReminder(e);
          }}
          className="relative z-10 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#C5A059] to-[#9E7D3B] hover:brightness-110 text-[#10202D] font-bold text-xs sm:text-sm shadow-xl transition-all active:scale-95"
        >
          <Play className="h-4 w-4 fill-current" />
          <span>مشاهدة وتفعيل التذكير على يوتيوب</span>
          <ExternalLink className="h-3.5 w-3.5" />
        </a>
      )}
    </div>
  );
}
