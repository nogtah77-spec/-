import { useState, useEffect, useCallback, useRef } from "react";
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

// ─── AdImage: صندوق داخل صندوق (مُصدَّر للاستخدام في الأدمن) ─────────────────
//
//  طبقة blur (نفس ألوان الصورة) + الصورة الكاملة والواضحة داخلها.
//  blurSize = 0  →  صورة عادية بدون إطار

export function AdImage({
  src,
  alt,
  blurSize,
  opacity = 1,
}: {
  src: string;
  alt: string;
  blurSize: number;
  opacity?: number;
}) {
  const inset      = blurSize === 0 ? 0 : Math.max(4, blurSize * 2);
  const blurPx     = blurSize === 0 ? 0 : Math.max(6, blurSize * 2.5);
  const outerR     = 16;
  const innerR     = blurSize === 0 ? 0 : Math.max(2, outerR - inset);

  return (
    <div
      className="absolute inset-0 w-full h-full"
      style={{ opacity, transition: "opacity 0.7s ease" }}
    >
      {blurSize > 0 && (
        <img
          src={src} alt="" aria-hidden draggable={false}
          className="absolute object-cover object-center"
          style={{
            inset:  `-${blurPx * 0.4}px`,
            width:  `calc(100% + ${blurPx * 0.8}px)`,
            height: `calc(100% + ${blurPx * 0.8}px)`,
            filter: `blur(${blurPx}px) brightness(0.85)`,
          }}
        />
      )}
      <img
        src={src} alt={alt} draggable={false} loading="lazy"
        className="absolute object-cover object-center"
        style={{
          inset:        `${inset}px`,
          width:        `calc(100% - ${inset * 2}px)`,
          height:       `calc(100% - ${inset * 2}px)`,
          borderRadius: `${innerR}px`,
          boxShadow:    blurSize > 0 ? "0 2px 12px rgba(0,0,0,0.18)" : undefined,
        }}
      />
    </div>
  );
}

// ─── AdSlot ─────────────────────────────────────────────────────────────────

function AdSlot({
  ad, allAds, currentIdx, blurSize, onClick, className, crossfade = false,
}: {
  ad: Ad; allAds: Ad[]; currentIdx: number; blurSize: number;
  onClick: (ad: Ad) => void; className?: string; crossfade?: boolean;
}) {
  return (
    <div
      className={cn(
        "relative overflow-hidden bg-neutral-900",
        ad.linkUrl ? "cursor-pointer" : "cursor-default",
        className
      )}
      onClick={() => onClick(ad)}
    >
      {crossfade
        ? allAds.map((a, i) => (
            <AdImage key={a.id} src={a.imageUrl} alt={a.title || `إعلان ${i + 1}`}
              blurSize={blurSize} opacity={i === currentIdx ? 1 : 0} />
          ))
        : <AdImage src={ad.imageUrl} alt={ad.title || "إعلان"} blurSize={blurSize} />
      }
      {ad.title && (
        <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/55 to-transparent pointer-events-none px-4 py-3 z-20">
          <p className={cn("text-white font-semibold leading-snug line-clamp-1 drop-shadow-sm",
            crossfade ? "text-sm" : "text-xs")}>
            {ad.title}
          </p>
        </div>
      )}
    </div>
  );
}

// ─── المكوّن الرئيسي ────────────────────────────────────────────────────────

interface Props { ads: Ad[]; blurSize?: number; }

export function AdsBanner({ ads, blurSize = 6 }: Props) {
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
  useEffect(() => {
    if (count <= 1 || paused) return;
    const ms = (active[current]?.duration ?? 6) * 1000;
    const id = setTimeout(next, ms);
    return () => clearTimeout(id);
  }, [count, paused, current, next, active]);

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
    if (!isDragging.current && ad.linkUrl)
      window.open(ad.linkUrl, "_blank", "noopener,noreferrer");
  };

  if (count === 0) return null;

  const mainAd  = active[current];
  const sideAd1 = count >= 2 ? active[(current + 1) % count] : null;
  const sideAd2 = count >= 3 ? active[(current + 2) % count] : null;

  const events = {
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
      <div className="select-none" {...events}>

        {/* ══ جوال + تابلت: 16:9 ══ */}
        <div className="lg:hidden w-full" style={{ aspectRatio: "16/9" }}>
          <AdSlot ad={mainAd} allAds={active} currentIdx={current}
            blurSize={blurSize} onClick={handleClick} crossfade
            className="w-full h-full rounded-2xl shadow-md" />
        </div>

        {/* ══ ديسكتوب ══
            الفكرة: wrapper واحد بارتفاع ثابت = 38vw (يتوافق مع 21:9 تقريباً)
            ثم grid بداخله بحيث كل شيء يتكيّف معه */}
        <div
          className="hidden lg:grid gap-3"
          style={{
            gridTemplateColumns: count >= 2 ? "3fr 2fr" : "1fr",
            height: "260px",
          }}
        >
          {/* الرئيسي */}
          <AdSlot ad={mainAd} allAds={active} currentIdx={current}
            blurSize={blurSize} onClick={handleClick} crossfade
            className="w-full h-full rounded-2xl shadow-md" />

          {/* جانبي واحد */}
          {count === 2 && sideAd1 && (
            <AdSlot ad={sideAd1} allAds={active} currentIdx={current}
              blurSize={blurSize} onClick={handleClick}
              className="w-full h-full rounded-2xl shadow-sm" />
          )}

          {/* جانبيان — يتقاسمان الارتفاع مناصفةً */}
          {count === 3 && (
            <div className="flex flex-col gap-2.5 h-full">
              {sideAd1 && (
                <AdSlot ad={sideAd1} allAds={active} currentIdx={current}
                  blurSize={blurSize} onClick={handleClick}
                  className="flex-1 rounded-xl shadow-sm" />
              )}
              {sideAd2 && (
                <AdSlot ad={sideAd2} allAds={active} currentIdx={current}
                  blurSize={blurSize} onClick={handleClick}
                  className="flex-1 rounded-xl shadow-sm" />
              )}
            </div>
          )}
        </div>

        {/* نقاط التنقل */}
        {count > 1 && (
          <div className="flex justify-center gap-1.5 mt-2.5">
            {active.map((_, i) => (
              <button key={i} onClick={() => go(i)}
                className={cn("rounded-full transition-all duration-300",
                  i === current
                    ? "w-5 h-1.5 bg-accent"
                    : "w-1.5 h-1.5 bg-foreground/20 hover:bg-foreground/40")}
                aria-label={`انتقل للإعلان ${i + 1}`} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
