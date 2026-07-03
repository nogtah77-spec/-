import { useState, useEffect, useCallback, useRef } from "react";
import { cn } from "@/lib/utils";
import type { Ad } from "@/context/DataContext";
import { useData } from "@/context/DataContext";
import { useAuth } from "@/context/AuthContext";
import { buildEventPayload } from "@/lib/adTracking";

// ─── helpers ────────────────────────────────────────────────────────────────

function getActiveAds(ads: Ad[]): Ad[] {
  const now = new Date();
  return [...ads]
    .filter(ad => {
      if (!ad.active) return false;
      if (ad.startDate && new Date(ad.startDate) > now) return false;
      if (ad.endDate   && new Date(ad.endDate)   < now) return false;
      return true;
    })
    .sort((a, b) => a.order - b.order);
}

function getDesktopSrc(ad: Ad): string {
  return ad.desktopImageUrl || ad.imageUrl || "";
}
function getMobileSrc(ad: Ad): string {
  return ad.mobileImageUrl || ad.desktopImageUrl || ad.imageUrl || "";
}

// ─── AdPicture: صورة متجاوبة باستخدام <picture> ────────────────────────────

function AdPicture({ ad, priority }: { ad: Ad; priority?: boolean }) {
  const desktop = getDesktopSrc(ad);
  const mobile  = getMobileSrc(ad);
  return (
    <picture className="absolute inset-0 w-full h-full">
      <source media="(min-width: 1024px)" srcSet={desktop} />
      <img
        src={mobile}
        alt={ad.title || "إعلان"}
        loading={priority ? "eager" : "lazy"}
        decoding="async"
        draggable={false}
        className="w-full h-full object-cover object-center"
      />
    </picture>
  );
}

// ─── AdSlot: صندوق إعلان واحد مع تتبع المشاهدة والنقرة ────────────────────

function AdSlot({
  ad,
  aspectRatio,
  className,
  priority,
  onView,
  onClick,
}: {
  ad: Ad;
  aspectRatio: string;
  className?: string;
  priority?: boolean;
  onView?: (viewDuration: number) => void;
  onClick?: (clickX: number, clickY: number) => void;
}) {
  const ref        = useRef<HTMLDivElement>(null);
  const viewed     = useRef(false);
  const viewStart  = useRef<number | null>(null);

  // تتبع وقت الدخول والخروج من الـ viewport
  useEffect(() => {
    if (!onView) return;
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting && !viewed.current) {
          viewed.current = true;
          viewStart.current = Date.now();
          // نُرسل حدث المشاهدة فوراً (مدة = 0 في البداية، ستُحدَّث عند المغادرة)
          onView(0);
          io.disconnect();
        }
      },
      { threshold: 0.5 }
    );
    if (ref.current) io.observe(ref.current);
    return () => io.disconnect();
  }, [onView]);

  const handleClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!onClick || !ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const clickX = (e.clientX - rect.left)  / rect.width;
    const clickY = (e.clientY - rect.top)   / rect.height;
    onClick(
      Math.min(1, Math.max(0, clickX)),
      Math.min(1, Math.max(0, clickY))
    );
  }, [onClick]);

  return (
    <div
      ref={ref}
      role={ad.linkUrl ? "link" : undefined}
      className={cn(
        "relative overflow-hidden rounded-2xl bg-neutral-200 shadow-sm",
        ad.linkUrl ? "cursor-pointer" : "cursor-default",
        className
      )}
      style={{ aspectRatio }}
      onClick={handleClick}
    >
      <AdPicture ad={ad} priority={priority} />
      {ad.title && (
        <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/65 via-black/20 to-transparent pointer-events-none px-4 pb-3 pt-10 z-10">
          <p className="text-white font-semibold text-sm leading-snug drop-shadow line-clamp-1 text-right">
            {ad.title}
          </p>
        </div>
      )}
    </div>
  );
}

// ─── PremiumSlot: الإعلان الرئيسي (مع تدوير تلقائي إذا وُجد أكثر من premium) ─

function PremiumSlot({
  premiums,
  onView,
  onClick,
}: {
  premiums: Ad[];
  onView: (id: string, viewDuration: number) => void;
  onClick: (ad: Ad, clickX: number, clickY: number) => void;
}) {
  const count             = premiums.length;
  const [current, setCur] = useState(0);
  const [paused, setPause]= useState(false);
  const ad                = premiums[current];

  const next = useCallback(() => setCur(i => (i + 1) % count), [count]);

  useEffect(() => { setCur(0); }, [count]);
  useEffect(() => {
    if (count <= 1 || paused) return;
    const ms = (ad?.duration ?? 6) * 1000;
    const t  = setTimeout(next, ms);
    return () => clearTimeout(t);
  }, [count, paused, current, ad, next]);

  if (!ad) return null;

  return (
    <div
      className="relative"
      onMouseEnter={() => setPause(true)}
      onMouseLeave={() => setPause(false)}
    >
      {/* جوال + تابلت: نسبة 16:9 */}
      <div className="lg:hidden">
        <AdSlot
          ad={ad}
          aspectRatio="16/9"
          priority
          onView={(d) => onView(ad.id, d)}
          onClick={(x, y) => onClick(ad, x, y)}
        />
      </div>
      {/* ديسكتوب: نسبة 21:9 */}
      <div className="hidden lg:block">
        <AdSlot
          ad={ad}
          aspectRatio="21/9"
          priority
          onView={(d) => onView(ad.id, d)}
          onClick={(x, y) => onClick(ad, x, y)}
        />
      </div>

      {count > 1 && (
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5 z-20">
          {premiums.map((_, i) => (
            <button
              key={i}
              onClick={e => { e.stopPropagation(); setCur(i); }}
              className={cn(
                "rounded-full transition-all duration-300",
                i === current
                  ? "w-5 h-1.5 bg-white shadow"
                  : "w-1.5 h-1.5 bg-white/50 hover:bg-white/80"
              )}
              aria-label={`إعلان رئيسي ${i + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// ─── المكوّن الرئيسي ────────────────────────────────────────────────────────

interface Props { ads: Ad[]; }

export function AdsBanner({ ads }: Props) {
  const { trackAdView, trackAdClick } = useData();
  const { isStaff } = useAuth();

  const active = getActiveAds(ads);
  if (active.length === 0) return null;

  const premiums    = active.filter(a => (a.type ?? "premium") === "premium");
  const secondaries = active.filter(a =>  a.type               === "secondary").slice(0, 2);

  const finalPremiums    = premiums.length    > 0 ? premiums    : [active[0]];
  const finalSecondaries = secondaries.length > 0 ? secondaries
    : active.filter(a => !finalPremiums.includes(a)).slice(0, 2);

  // لا نتتبع الأدمن والموظفين
  const onView = useCallback((id: string, viewDuration: number) => {
    if (isStaff) return;
    const payload = { ...buildEventPayload(), viewDuration };
    trackAdView(id, payload as Record<string, unknown>);
  }, [isStaff, trackAdView]);

  const onClick = useCallback((ad: Ad, clickX: number, clickY: number) => {
    if (!isStaff) {
      const payload = { ...buildEventPayload(), clickX, clickY };
      trackAdClick(ad.id, payload as Record<string, unknown>);
    }
    if (ad.linkUrl) window.open(ad.linkUrl, "_blank", "noopener,noreferrer");
  }, [isStaff, trackAdClick]);

  return (
    <section className="container px-4 sm:px-6 pt-4 sm:pt-5 pb-8 space-y-3" aria-label="إعلانات">
      <PremiumSlot
        premiums={finalPremiums}
        onView={onView}
        onClick={onClick}
      />
      {finalSecondaries.length > 0 && (
        <div className={cn(
          "grid gap-3",
          finalSecondaries.length === 1 ? "grid-cols-1" : "grid-cols-1 sm:grid-cols-2"
        )}>
          {finalSecondaries.map((ad, i) => (
            <AdSlot
              key={ad.id}
              ad={ad}
              aspectRatio="16/9"
              priority={i === 0}
              onView={(d) => onView(ad.id, d)}
              onClick={(x, y) => onClick(ad, x, y)}
            />
          ))}
        </div>
      )}
    </section>
  );
}
