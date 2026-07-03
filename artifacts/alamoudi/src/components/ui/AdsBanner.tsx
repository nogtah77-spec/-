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

// ─── AdImage: يعرض الصورة كاملة بدون قطع + خلفية blur ──────────────────────
//
//  الفكرة: طبقتان فوق بعض:
//   1) خلفية blur  — نفس الصورة بـ object-cover + blur لملء المساحات
//   2) الصورة الفعلية — بـ object-contain لعرض التفاصيل كاملة
//
//  هكذا لا يُقطع أي جزء من الإعلان بغض النظر عن حجم الشاشة.

// حجم الإطار البلر من كل الجهات (بكسل)
const BLUR_INSET = 10;

function AdImage({
  src,
  alt,
  opacity = 1,
}: {
  src: string;
  alt: string;
  opacity?: number;
}) {
  return (
    <>
      {/* ① خلفية blur من كل الجهات — تُكبَّر قليلاً لتغطية الحواف */}
      <img
        src={src}
        alt=""
        aria-hidden
        draggable={false}
        className="absolute inset-0 w-full h-full object-cover pointer-events-none"
        style={{
          opacity: opacity * 0.9,
          filter: "blur(14px) brightness(0.45) saturate(1.25)",
          transform: "scale(1.08)",
          transition: "opacity 0.7s ease",
        }}
      />

      {/* ② الصورة الفعلية — كاملة بلا قطع، مع إطار موحّد من كل الجهات */}
      <img
        src={src}
        alt={alt}
        draggable={false}
        loading="lazy"
        className="absolute object-contain pointer-events-none"
        style={{
          inset: BLUR_INSET,
          width:  `calc(100% - ${BLUR_INSET * 2}px)`,
          height: `calc(100% - ${BLUR_INSET * 2}px)`,
          opacity,
          transition: "opacity 0.7s ease",
        }}
      />
    </>
  );
}

// ─── AdSlot: حاوية الإعلان الواحد ──────────────────────────────────────────

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
        "relative overflow-hidden bg-black",
        ad.linkUrl ? "cursor-pointer" : "cursor-default",
        className
      )}
      onClick={() => onClick(ad)}
    >
      {crossfade ? (
        // الـ slot الرئيسي: جميع الصور مكدّسة — تتلاشى بالـ opacity
        allAds.map((a, i) => (
          <AdImage
            key={a.id}
            src={a.imageUrl}
            alt={a.title || `إعلان ${i + 1}`}
            opacity={i === currentIdx ? 1 : 0}
          />
        ))
      ) : (
        <AdImage src={ad.imageUrl} alt={ad.title || "إعلان"} />
      )}

      {/* عنوان الإعلان — شريط سفلي شفّاف */}
      {ad.title && (
        <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/70 to-transparent pointer-events-none px-4 py-3">
          <p className={cn(
            "text-white font-semibold leading-snug line-clamp-1 drop-shadow",
            crossfade ? "text-sm" : "text-xs"
          )}>
            {ad.title}
          </p>
        </div>
      )}

      {/* حلقة hover للروابط */}
      {ad.linkUrl && (
        <div className="absolute inset-0 ring-inset ring-2 ring-transparent hover:ring-white/25 transition-all rounded-[inherit] pointer-events-none" />
      )}
    </div>
  );
}

// ─── المكوّن الرئيسي ────────────────────────────────────────────────────────

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

  // مدة ظهور مستقلة لكل إعلان (duration بالثانية)
  useEffect(() => {
    if (count <= 1 || paused) return;
    const ms = (active[current]?.duration ?? 6) * 1000;
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

        {/* ══ جوال + تابلت (< lg) ══════════════════════════════════════════ */}
        <div className="lg:hidden">
          <AdSlot
            ad={mainAd} allAds={active} currentIdx={current}
            onClick={handleClick} crossfade
            className="h-36 sm:h-44 w-full rounded-2xl shadow-md"
          />
        </div>

        {/* ══ ديسكتوب — إعلان واحد ═══════════════════════════════════════ */}
        {count === 1 && (
          <div className="hidden lg:block">
            <AdSlot
              ad={mainAd} allAds={active} currentIdx={current}
              onClick={handleClick} crossfade
              className="h-52 w-full rounded-2xl shadow-md"
            />
          </div>
        )}

        {/* ══ ديسكتوب — إعلانان ══════════════════════════════════════════ */}
        {count === 2 && (
          <div className="hidden lg:grid grid-cols-[3fr_2fr] gap-3 h-52">
            <AdSlot
              ad={mainAd} allAds={active} currentIdx={current}
              onClick={handleClick} crossfade
              className="rounded-2xl shadow-md"
            />
            <AdSlot
              ad={sideAd1!} allAds={active} currentIdx={current}
              onClick={handleClick}
              className="rounded-2xl shadow-sm"
            />
          </div>
        )}

        {/* ══ ديسكتوب — ثلاثة إعلانات ════════════════════════════════════
            الرئيسي (60%) يدور بمدة كل إعلان.
            الجانبيان (40%) يعرضان الإعلانات التالية معاينةً.           */}
        {count === 3 && (
          <div className="hidden lg:grid grid-cols-[3fr_2fr] gap-3 h-52">
            <AdSlot
              ad={mainAd} allAds={active} currentIdx={current}
              onClick={handleClick} crossfade
              className="rounded-2xl shadow-md"
            />
            <div className="flex flex-col gap-2.5 h-full">
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
