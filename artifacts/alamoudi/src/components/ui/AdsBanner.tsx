import { useState, useEffect, useRef, useCallback } from "react";
import { cn } from "@/lib/utils";
import type { Ad } from "@/context/DataContext";

function getActiveAds(ads: Ad[]): Ad[] {
  const now = new Date();
  return [...ads]
    .filter(ad => {
      if (!ad.active) return false;
      if (ad.startDate && new Date(ad.startDate) > now) return false;
      if (ad.endDate && new Date(ad.endDate) < now) return false;
      return true;
    })
    .sort((a, b) => a.order - b.order);
}

interface Props {
  ads: Ad[];
}

export function AdsBanner({ ads }: Props) {
  const active = getActiveAds(ads);
  const count = active.length;
  const [current, setCurrent] = useState(0);
  const [paused, setPaused] = useState(false);
  const dragStartX = useRef<number | null>(null);
  const isDragging = useRef(false);

  const go = useCallback(
    (i: number) => setCurrent(((i % count) + count) % count),
    [count]
  );
  const next = useCallback(() => go(current + 1), [go, current]);
  const prev = useCallback(() => go(current - 1), [go, current]);

  useEffect(() => {
    setCurrent(0);
  }, [count]);

  useEffect(() => {
    if (count <= 1 || paused) return;
    const id = setInterval(next, 5000);
    return () => clearInterval(id);
  }, [count, paused, next]);

  const onDragStart = (x: number) => {
    dragStartX.current = x;
    isDragging.current = false;
  };
  const onDragMove = (x: number) => {
    if (dragStartX.current !== null && Math.abs(x - dragStartX.current) > 8)
      isDragging.current = true;
  };
  const onDragEnd = (x: number) => {
    if (dragStartX.current === null) return;
    const diff = dragStartX.current - x;
    if (Math.abs(diff) > 50) diff > 0 ? next() : prev();
    dragStartX.current = null;
  };

  const handleAdClick = (ad: Ad) => {
    if (!isDragging.current && ad.linkUrl)
      window.open(ad.linkUrl, "_blank", "noopener,noreferrer");
  };

  if (count === 0) return null;

  const showGrid = count >= 3;
  const mainAd = active[current];
  const sideAds = showGrid
    ? [active[(current + 1) % count], active[(current + 2) % count]]
    : [];

  const wrapperProps = {
    onMouseEnter: () => setPaused(true),
    onMouseLeave: () => {
      setPaused(false);
      dragStartX.current = null;
      isDragging.current = false;
    },
    onMouseDown: (e: React.MouseEvent) => onDragStart(e.clientX),
    onMouseMove: (e: React.MouseEvent) => onDragMove(e.clientX),
    onMouseUp: (e: React.MouseEvent) => onDragEnd(e.clientX),
    onTouchStart: (e: React.TouchEvent) => onDragStart(e.touches[0].clientX),
    onTouchMove: (e: React.TouchEvent) => onDragMove(e.touches[0].clientX),
    onTouchEnd: (e: React.TouchEvent) =>
      onDragEnd(e.changedTouches[0].clientX),
  };

  return (
    <section className="container px-6 pt-5">
      <div className="select-none" {...wrapperProps}>

        {/* ── Desktop Grid: main (2/3) + two side ads (1/3) ── */}
        {showGrid && (
          <div className="hidden lg:grid grid-cols-[2fr_1fr] gap-3">
            {/* Main ad — crossfade between all ads */}
            <div
              className={cn(
                "relative aspect-[5/2] rounded-2xl overflow-hidden shadow-sm bg-muted",
                mainAd.linkUrl ? "cursor-pointer" : "cursor-default"
              )}
              onClick={() => handleAdClick(mainAd)}
            >
              {active.map((ad, i) => (
                <img
                  key={ad.id}
                  src={ad.imageUrl}
                  alt={ad.title || `إعلان ${i + 1}`}
                  loading="lazy"
                  draggable={false}
                  className={cn(
                    "absolute inset-0 w-full h-full object-cover transition-opacity duration-700 pointer-events-none",
                    i === current ? "opacity-100" : "opacity-0"
                  )}
                />
              ))}
              {mainAd.title && (
                <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/55 to-transparent px-5 py-3 pointer-events-none">
                  <p className="text-white text-sm font-semibold leading-snug">
                    {mainAd.title}
                  </p>
                </div>
              )}
            </div>

            {/* Two side ads */}
            <div className="grid grid-rows-2 gap-3">
              {sideAds.map((ad) => (
                <div
                  key={ad.id}
                  className={cn(
                    "relative rounded-xl overflow-hidden shadow-sm bg-muted group",
                    ad.linkUrl ? "cursor-pointer" : "cursor-default"
                  )}
                  onClick={() => handleAdClick(ad)}
                >
                  <img
                    src={ad.imageUrl}
                    alt={ad.title || "إعلان"}
                    loading="lazy"
                    draggable={false}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.03] pointer-events-none"
                  />
                  {ad.title && (
                    <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/55 to-transparent px-3 py-2 pointer-events-none">
                      <p className="text-white text-xs font-medium leading-snug">
                        {ad.title}
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── Mobile / < 3 ads: full-width carousel ── */}
        <div className={cn(showGrid ? "lg:hidden" : "")}>
          <div
            className={cn(
              "relative aspect-[5/2] rounded-2xl overflow-hidden shadow-sm bg-muted",
              mainAd.linkUrl ? "cursor-pointer" : "cursor-default"
            )}
            onClick={() => handleAdClick(mainAd)}
          >
            {active.map((ad, i) => (
              <img
                key={ad.id}
                src={ad.imageUrl}
                alt={ad.title || `إعلان ${i + 1}`}
                loading="lazy"
                draggable={false}
                className={cn(
                  "absolute inset-0 w-full h-full object-cover transition-opacity duration-700 pointer-events-none",
                  i === current ? "opacity-100" : "opacity-0"
                )}
              />
            ))}
            {mainAd.title && (
              <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/55 to-transparent px-4 py-3 pointer-events-none">
                <p className="text-white text-sm font-semibold leading-snug">
                  {mainAd.title}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* ── Navigation dots ── */}
        {count > 1 && (
          <div className="flex justify-center gap-1.5 mt-2.5">
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
