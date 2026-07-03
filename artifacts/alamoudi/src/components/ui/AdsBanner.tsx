import { useState, useEffect, useCallback, useRef } from "react";
import { cn } from "@/lib/utils";
import type { Ad } from "@/context/DataContext";
import { useData } from "@/context/DataContext";

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

// ─── AdSlot: صندوق إعلان واحد ──────────────────────────────────────────────

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
  onView?: () => void;
  onClick?: () => void;
}) {
  const ref     = useRef<HTMLDivElement>(null);
  const viewed  = useRef(false);

  useEffect(() => {
    if (!onView || viewed.current) return;
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting && !viewed.current) {
          viewed.current = true;
          onView();
          io.disconnect();
        }
      },
      { threshold: 0.5 }
    );
    if (ref.current) io.observe(ref.current);
    return () => io.disconnect();
  }, [onView]);

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
      onClick={onClick}
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
  onView: (id: string) => void;
  onClick: (ad: Ad) => void;
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
      {/* جوال + تابلت: نسبة 16:9 ← يستخدم mobileImageUrl أو يرجع للـ desktop */}
      <div className="lg:hidden">
        <AdSlot
          ad={ad}
          aspectRatio="16/9"
          priority
          onView={() => onView(ad.id)}
          onClick={() => onClick(ad)}
        />
      </div>
      {/* ديسكتوب: نسبة 21:9 ← يستخدم desktopImageUrl */}
      <div className="hidden lg:block">
        <AdSlot
          ad={ad}
          aspectRatio="21/9"
          priority
          onView={() => onView(ad.id)}
          onClick={() => onClick(ad)}
        />
      </div>

      {/* نقاط التنقل — تظهر فقط إذا وُجد أكثر من إعلان premium */}
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

  const active = getActiveAds(ads);
  if (active.length === 0) return null;

  // فصل الإعلانات حسب النوع — مع fallback للبيانات القديمة التي ليس لها type
  const premiums    = active.filter(a => (a.type ?? "premium") === "premium");
  const secondaries = active.filter(a =>  a.type               === "secondary").slice(0, 2);

  // إذا لم يوجد premium، استخدم الأول كـ premium والباقي كـ secondary
  const finalPremiums    = premiums.length    > 0 ? premiums    : [active[0]];
  const finalSecondaries = secondaries.length > 0 ? secondaries
    : active.filter(a => !finalPremiums.includes(a)).slice(0, 2);

  const handleClick = useCallback((ad: Ad) => {
    trackAdClick(ad.id);
    if (ad.linkUrl) window.open(ad.linkUrl, "_blank", "noopener,noreferrer");
  }, [trackAdClick]);

  return (
    <section className="container px-4 sm:px-6 pt-4 sm:pt-5 pb-8 space-y-3" aria-label="إعلانات">
      {/* الإعلان الرئيسي */}
      <PremiumSlot
        premiums={finalPremiums}
        onView={trackAdView}
        onClick={handleClick}
      />

      {/* الإعلانات الثانوية (جنب بعض على الديسكتوب، فوق بعض على الجوال) */}
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
              onView={() => trackAdView(ad.id)}
              onClick={() => handleClick(ad)}
            />
          ))}
        </div>
      )}
    </section>
  );
}
