import { useState, useEffect, useRef, useCallback } from "react";
import { cn } from "@/lib/utils";
import type { Ad } from "@/context/DataContext";

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
    .sort((a, b) => a.order - b.order)
    .slice(0, 3);
}

// ─── single image slot ───────────────────────────────────────────────────────

function AdSlot({
  ad,
  allAds,
  currentIdx,
  onClick,
  className,
  crossfade = false,
}: {
  ad: Ad;
  allAds: Ad[];
  currentIdx: number;
  onClick: (ad: Ad) => void;
  className?: string;
  crossfade?: boolean;
}) {
  return (
    <div
      className={cn(
        "relative overflow-hidden",
        ad.linkUrl ? "cursor-pointer" : "cursor-default",
        className
      )}
      onClick={() => onClick(ad)}
    >
      {/* fallback bg while image loads */}
      <div className="absolute inset-0 bg-muted/60" />

      {crossfade ? (
        // Main slot: all images stacked, fade in/out
        allAds.map((a, i) => (
          <img
            key={a.id}
            src={a.imageUrl}
            alt={a.title || `إعلان ${i + 1}`}
            loading="lazy"
            draggable={false}
            className={cn(
              "absolute inset-0 w-full h-full object-cover object-center pointer-events-none",
              "transition-opacity duration-700",
              i === currentIdx ? "opacity-100" : "opacity-0"
            )}
          />
        ))
      ) : (
        <img
          src={ad.imageUrl}
          alt={ad.title || "إعلان"}
          loading="lazy"
          draggable={false}
          className="absolute inset-0 w-full h-full object-cover object-center pointer-events-none"
        />
      )}

      {/* title overlay */}
      {ad.title && (
        <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/60 to-transparent pointer-events-none px-4 py-2.5">
          <p className={cn(
            "text-white font-semibold leading-snug line-clamp-1",
            crossfade ? "text-sm" : "text-xs"
          )}>
            {ad.title}
          </p>
        </div>
      )}

      {/* clickable hover ring */}
      {ad.linkUrl && (
        <div className="absolute inset-0 ring-inset ring-2 ring-transparent hover:ring-white/20 transition-all rounded-[inherit]" />
      )}
    </div>
  );
}

// ─── main component ──────────────────────────────────────────────────────────

interface Props { ads: Ad[]; }

export function AdsBanner({ ads }: Props) {
  const active  = getActiveAds(ads);
  const count   = active.length;
  const [current, setCurrent] = useState(0);
  const [paused,  setPaused]  = useState(false);
  const dragStartX = useRef<number | null>(null);
  const isDragging = useRef(false);

  const go   = useCallback((i: number) => setCurrent(((i % count) + count) % count), [count]);
  const next = useCallback(() => go(current + 1), [go, current]);
  const prev = useCallback(() => go(current - 1), [go, current]);

  useEffect(() => { setCurrent(0); }, [count]);

  // كل إعلان له مدة ظهوره الخاصة (duration بالثانية، افتراضي 5)
  useEffect(() => {
    if (count <= 1 || paused) return;
    const ms = (active[current]?.duration ?? 5) * 1000;
    const id = setTimeout(next, ms);
    return () => clearTimeout(id);
  }, [count, paused, current, next, active]);

  const onDragStart = (x: number) => { dragStartX.current = x; isDragging.current = false; };
  const onDragMove  = (x: number) => {
    if (dragStartX.current !== null && Math.abs(x - dragStartX.current) > 8)
      isDragging.current = true;
  };
  const onDragEnd = (x: number) => {
    if (dragStartX.current === null) return;
    const diff = dragStartX.current - x;
    if (Math.abs(diff) > 50) diff > 0 ? next() : prev();
    dragStartX.current = null;
  };

  const handleClick = (ad: Ad) => {
    if (!isDragging.current && ad.linkUrl)
      window.open(ad.linkUrl, "_blank", "noopener,noreferrer");
  };

  if (count === 0) return null;

  const mainAd  = active[current];
  const sideAd1 = count >= 2 ? active[(current + 1) % count] : null;
  const sideAd2 = count >= 3 ? active[(current + 2) % count] : null;

  const wrapperEvents = {
    onMouseEnter: () => setPaused(true),
    onMouseLeave: () => { setPaused(false); dragStartX.current = null; isDragging.current = false; },
    onMouseDown:  (e: React.MouseEvent)  => onDragStart(e.clientX),
    onMouseMove:  (e: React.MouseEvent)  => onDragMove(e.clientX),
    onMouseUp:    (e: React.MouseEvent)  => onDragEnd(e.clientX),
    onTouchStart: (e: React.TouchEvent)  => onDragStart(e.touches[0].clientX),
    onTouchMove:  (e: React.TouchEvent)  => onDragMove(e.touches[0].clientX),
    onTouchEnd:   (e: React.TouchEvent)  => onDragEnd(e.changedTouches[0].clientX),
  };

  return (
    <section className="container px-4 sm:px-6 pt-4 sm:pt-5">
      <div className="select-none" {...wrapperEvents}>

        {/* ══ MOBILE + TABLET (< lg): carousel واحد ══════════════════════ */}
        <div className="lg:hidden">
          <AdSlot
            ad={mainAd} allAds={active} currentIdx={current}
            onClick={handleClick} crossfade
            className="h-28 sm:h-32 w-full rounded-2xl shadow-sm"
          />
        </div>

        {/* ══ DESKTOP — 1 إعلان: عرض كامل ════════════════════════════════ */}
        {count === 1 && (
          <div className="hidden lg:block">
            <AdSlot
              ad={mainAd} allAds={active} currentIdx={current}
              onClick={handleClick} crossfade
              className="h-40 w-full rounded-2xl shadow-sm"
            />
          </div>
        )}

        {/* ══ DESKTOP — 2 إعلانات: 60% + 40% ════════════════════════════ */}
        {count === 2 && (
          <div className="hidden lg:grid grid-cols-[3fr_2fr] gap-3 h-40">
            <AdSlot
              ad={mainAd} allAds={active} currentIdx={current}
              onClick={handleClick} crossfade
              className="rounded-2xl shadow-sm"
            />
            <AdSlot
              ad={sideAd1!} allAds={active} currentIdx={current}
              onClick={handleClick}
              className="rounded-2xl shadow-sm"
            />
          </div>
        )}

        {/* ══ DESKTOP — 3 إعلانات: رئيسي 60% + جانبيان 40% ══════════════
            الرئيسي يدور بين جميع الإعلانات بمدة كل منها.
            الجانبيان يعرضان الإعلانات التالية في الترتيب (معاينة قادمة).  */}
        {count === 3 && (
          <div className="hidden lg:grid grid-cols-[3fr_2fr] gap-3 h-40">
            {/* اللوحة الكبيرة — تتبدل بمدة كل إعلان */}
            <AdSlot
              ad={mainAd} allAds={active} currentIdx={current}
              onClick={handleClick} crossfade
              className="rounded-2xl shadow-md"
            />
            {/* اللوحتان الجانبيتان — تعرضان الإعلانات التالية */}
            <div className="flex flex-col gap-2 h-full">
              <AdSlot
                ad={sideAd1!} allAds={active} currentIdx={current}
                onClick={handleClick}
                className="flex-1 rounded-xl shadow-sm"
              />
              <AdSlot
                ad={sideAd2!} allAds={active} currentIdx={current}
                onClick={handleClick}
                className="flex-1 rounded-xl shadow-sm"
              />
            </div>
          </div>
        )}

        {/* ══ نقاط التنقل ══════════════════════════════════════════════════ */}
        {count > 1 && (
          <div className="flex justify-center gap-1.5 mt-2">
            {active.map((_, i) => (
              <button
                key={i}
                onClick={() => go(i)}
                className={cn(
                  "rounded-full transition-all duration-300",
                  i === current
                    ? "w-5 h-1.5 bg-accent"
                    : "w-1.5 h-1.5 bg-foreground/20 hover:bg-foreground/40"
                )}
                aria-label={`انتقل للإعلان ${i + 1}`}
              />
            ))}
          </div>
        )}

      </div>
    </section>
  );
}
