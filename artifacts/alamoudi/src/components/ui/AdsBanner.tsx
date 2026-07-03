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
    .slice(0, 3); // أقصى حد 3 إعلانات
}

// ─── single slot (image + optional overlay) ─────────────────────────────────

function AdSlot({
  ad,
  allAds,
  currentIdx,
  slotIdx,
  onClick,
  className,
  premium = false,
}: {
  ad: Ad;
  allAds: Ad[];
  currentIdx: number;
  slotIdx: number;
  onClick: (ad: Ad) => void;
  className?: string;
  premium?: boolean;
}) {
  // For the premium (main) slot we crossfade all images.
  // For side slots we just show the single image with a fade transition.
  return (
    <div
      className={cn(
        "relative overflow-hidden",
        ad.linkUrl ? "cursor-pointer" : "cursor-default",
        className
      )}
      onClick={() => onClick(ad)}
    >
      {/* background colour while loading */}
      <div className="absolute inset-0 bg-muted/60" />

      {premium ? (
        // Crossfade all three images in the main slot
        allAds.map((a, i) => (
          <img
            key={a.id}
            src={a.imageUrl}
            alt={a.title || `إعلان ${i + 1}`}
            loading="lazy"
            draggable={false}
            className={cn(
              "absolute inset-0 w-full h-full object-cover object-center",
              "transition-opacity duration-700 pointer-events-none",
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
          className="absolute inset-0 w-full h-full object-cover object-center pointer-events-none transition-opacity duration-500"
        />
      )}

      {/* title overlay */}
      {ad.title && (
        <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/60 to-transparent pointer-events-none px-4 py-2.5">
          <p className={cn(
            "text-white font-semibold leading-snug line-clamp-1",
            premium ? "text-sm" : "text-xs"
          )}>
            {ad.title}
          </p>
        </div>
      )}

      {/* premium badge */}
      {premium && (
        <div className="absolute top-2.5 right-2.5 pointer-events-none">
          <span className="inline-flex items-center gap-1 rounded-full bg-accent/90 backdrop-blur-sm px-2 py-0.5 text-[10px] font-bold text-white shadow">
            ★ مميّز
          </span>
        </div>
      )}

      {/* hover ring for clickable ads */}
      {ad.linkUrl && (
        <div className="absolute inset-0 ring-inset ring-2 ring-transparent hover:ring-white/20 transition-all rounded-[inherit]" />
      )}
    </div>
  );
}

// ─── main component ──────────────────────────────────────────────────────────

interface Props { ads: Ad[]; }

export function AdsBanner({ ads }: Props) {
  const active   = getActiveAds(ads);
  const count    = active.length;
  const [current, setCurrent] = useState(0);
  const [paused,  setPaused]  = useState(false);
  const dragStartX  = useRef<number | null>(null);
  const isDragging  = useRef(false);

  const go   = useCallback((i: number) => setCurrent(((i % count) + count) % count), [count]);
  const next = useCallback(() => go(current + 1), [go, current]);
  const prev = useCallback(() => go(current - 1), [go, current]);

  useEffect(() => { setCurrent(0); }, [count]);

  useEffect(() => {
    if (count <= 1 || paused) return;
    const id = setInterval(next, 5000);
    return () => clearInterval(id);
  }, [count, paused, next]);

  const onDragStart = (x: number) => { dragStartX.current = x; isDragging.current = false; };
  const onDragMove  = (x: number) => {
    if (dragStartX.current !== null && Math.abs(x - dragStartX.current) > 8) isDragging.current = true;
  };
  const onDragEnd = (x: number) => {
    if (dragStartX.current === null) return;
    const diff = dragStartX.current - x;
    if (Math.abs(diff) > 50) diff > 0 ? next() : prev();
    dragStartX.current = null;
  };

  const handleClick = (ad: Ad) => {
    if (!isDragging.current && ad.linkUrl) window.open(ad.linkUrl, "_blank", "noopener,noreferrer");
  };

  if (count === 0) return null;

  const mainAd  = active[current];
  const sideAd1 = count >= 2 ? active[(current + 1) % count] : null;
  const sideAd2 = count >= 3 ? active[(current + 2) % count] : null;

  // Heights (fixed, not aspect-ratio):
  //   Desktop:  h-40 = 160px total
  //   Mobile:   h-28 = 112px  |  sm: h-32 = 128px

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

        {/* ── MOBILE + TABLET (< lg): single carousel ─────────────────── */}
        <div className="lg:hidden">
          <AdSlot
            ad={mainAd}
            allAds={active}
            currentIdx={current}
            slotIdx={0}
            onClick={handleClick}
            premium
            className="h-28 sm:h-32 w-full rounded-2xl shadow-sm"
          />
        </div>

        {/* ── DESKTOP (≥ lg): 3-column premium layout ──────────────────── */}
        {count === 1 && (
          <div className="hidden lg:block">
            <AdSlot
              ad={mainAd} allAds={active} currentIdx={current} slotIdx={0}
              onClick={handleClick} premium
              className="h-40 w-full rounded-2xl shadow-sm"
            />
          </div>
        )}

        {count === 2 && (
          <div className="hidden lg:grid grid-cols-[3fr_2fr] gap-3 h-40">
            <AdSlot
              ad={mainAd} allAds={active} currentIdx={current} slotIdx={0}
              onClick={handleClick} premium
              className="rounded-2xl shadow-sm"
            />
            <AdSlot
              ad={sideAd1!} allAds={active} currentIdx={current} slotIdx={1}
              onClick={handleClick}
              className="rounded-2xl shadow-sm"
            />
          </div>
        )}

        {count === 3 && (
          <div className="hidden lg:grid grid-cols-[3fr_2fr] gap-3 h-40">
            {/* Main premium — left 60% */}
            <AdSlot
              ad={mainAd} allAds={active} currentIdx={current} slotIdx={0}
              onClick={handleClick} premium
              className="rounded-2xl shadow-md ring-1 ring-accent/20"
            />
            {/* Two side ads — right 40%, stacked */}
            <div className="flex flex-col gap-2 h-full">
              <AdSlot
                ad={sideAd1!} allAds={active} currentIdx={current} slotIdx={1}
                onClick={handleClick}
                className="flex-1 rounded-xl shadow-sm"
              />
              <AdSlot
                ad={sideAd2!} allAds={active} currentIdx={current} slotIdx={2}
                onClick={handleClick}
                className="flex-1 rounded-xl shadow-sm"
              />
            </div>
          </div>
        )}

        {/* ── Navigation dots ──────────────────────────────────────────── */}
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
