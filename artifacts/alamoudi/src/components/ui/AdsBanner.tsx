import { useState, useEffect, useCallback, useRef } from "react";
import { cn } from "@/lib/utils";
import type { Ad } from "@/context/DataContext";
import { useData } from "@/context/DataContext";
import { useAuth } from "@/context/AuthContext";
import { buildEventPayload } from "@/lib/adTracking";
import { ChevronLeft, ChevronRight } from "lucide-react";

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

function getDesktopSrc(ad: Ad) { return ad.desktopImageUrl || ad.imageUrl || ""; }
function getMobileSrc(ad: Ad)  { return ad.mobileImageUrl  || ad.desktopImageUrl || ad.imageUrl || ""; }

// ─── AdPicture ────────────────────────────────────────────────────────────────

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

// ─── AdSlot: صندوق إعلان واحد مع تتبع المشاهدة والنقرة ─────────────────────

function AdSlot({
  ad,
  className,
  style,
  priority,
  onView,
  onClick,
}: {
  ad: Ad;
  className?: string;
  style?: React.CSSProperties;
  priority?: boolean;
  onView?: (viewDuration: number) => void;
  onClick?: (clickX: number, clickY: number) => void;
}) {
  const ref       = useRef<HTMLDivElement>(null);
  const viewed    = useRef(false);
  const viewStart = useRef<number | null>(null);

  useEffect(() => {
    if (!onView) return;
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting && !viewed.current) {
          viewed.current = true;
          viewStart.current = Date.now();
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
    onClick(Math.min(1, Math.max(0, clickX)), Math.min(1, Math.max(0, clickY)));
  }, [onClick]);

  return (
    <div
      ref={ref}
      role={ad.linkUrl ? "link" : undefined}
      className={cn(
        "relative overflow-hidden bg-neutral-100 transition-opacity duration-300",
        ad.linkUrl ? "cursor-pointer" : "cursor-default",
        className
      )}
      style={style}
      onClick={handleClick}
    >
      <AdPicture ad={ad} priority={priority} />
      {/* تدرج سفلي + عنوان */}
      {ad.title && (
        <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent pointer-events-none px-4 pb-3 pt-10 z-10">
          <p className="text-white font-semibold text-sm leading-snug drop-shadow line-clamp-1 text-right">
            {ad.title}
          </p>
        </div>
      )}
      {/* shimmer overlay on hover لإعطاء لمسة تفاعلية */}
      {ad.linkUrl && (
        <div className="absolute inset-0 bg-white/0 hover:bg-white/5 transition-colors duration-200 pointer-events-none" />
      )}
    </div>
  );
}

// ─── PremiumSlot ─────────────────────────────────────────────────────────────
// ارتفاع ثابت + أوفر لطيف + مؤشرات + توقف عند hover

function PremiumSlot({
  premiums,
  onView,
  onClick,
}: {
  premiums: Ad[];
  onView: (id: string, d: number) => void;
  onClick: (ad: Ad, x: number, y: number) => void;
}) {
  const count             = premiums.length;
  const [current, setCur] = useState(0);
  const [paused, setPause]= useState(false);
  const ad                = premiums[current];

  const next = useCallback(() => setCur(i => (i + 1) % count), [count]);
  const prev = useCallback(() => setCur(i => (i - 1 + count) % count), [count]);

  useEffect(() => { setCur(0); }, [count]);
  useEffect(() => {
    if (count <= 1 || paused) return;
    const ms = (ad?.duration ?? 6) * 1000;
    const t  = setTimeout(next, ms);
    return () => clearTimeout(t);
  }, [count, paused, current, ad, next]);

  if (!ad) return null;

  // ارتفاعات: ضيقة واحترافية
  const DESKTOP_H = "h-[240px] xl:h-[280px]";
  const MOBILE_H  = "h-[200px] sm:h-[220px]";

  return (
    <div
      className="relative rounded-2xl overflow-hidden shadow-sm ring-1 ring-black/5 group"
      onMouseEnter={() => setPause(true)}
      onMouseLeave={() => setPause(false)}
    >
      {/* جوال + تابلت */}
      <div className={cn("lg:hidden", MOBILE_H)}>
        <AdSlot
          ad={ad}
          className="h-full rounded-none"
          priority
          onView={(d) => onView(ad.id, d)}
          onClick={(x, y) => onClick(ad, x, y)}
        />
      </div>
      {/* ديسكتوب */}
      <div className={cn("hidden lg:block", DESKTOP_H)}>
        <AdSlot
          ad={ad}
          className="h-full rounded-none"
          priority
          onView={(d) => onView(ad.id, d)}
          onClick={(x, y) => onClick(ad, x, y)}
        />
      </div>

      {/* أزرار السهم — تظهر عند hover فقط */}
      {count > 1 && (
        <>
          <button
            onClick={e => { e.stopPropagation(); prev(); }}
            className="absolute right-3 top-1/2 -translate-y-1/2 z-20 bg-black/40 hover:bg-black/60 text-white rounded-full w-8 h-8 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 backdrop-blur-sm"
            aria-label="السابق"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
          <button
            onClick={e => { e.stopPropagation(); next(); }}
            className="absolute left-3 top-1/2 -translate-y-1/2 z-20 bg-black/40 hover:bg-black/60 text-white rounded-full w-8 h-8 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 backdrop-blur-sm"
            aria-label="التالي"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
        </>
      )}

      {/* مؤشرات النقاط */}
      {count > 1 && (
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5 z-20">
          {premiums.map((_, i) => (
            <button
              key={i}
              onClick={e => { e.stopPropagation(); setCur(i); }}
              className={cn(
                "rounded-full transition-all duration-300 shadow-sm",
                i === current
                  ? "w-5 h-1.5 bg-white"
                  : "w-1.5 h-1.5 bg-white/50 hover:bg-white/80"
              )}
              aria-label={`إعلان ${i + 1}`}
            />
          ))}
        </div>
      )}

      {/* شريط تقدم التدوير */}
      {count > 1 && !paused && (
        <div className="absolute bottom-0 left-0 right-0 h-0.5 z-20 bg-white/20">
          <div
            key={current}
            className="h-full bg-white/70 origin-left animate-[progress_linear_forwards]"
            style={{
              animation: `progress ${(ad?.duration ?? 6)}s linear forwards`,
            }}
          />
        </div>
      )}
    </div>
  );
}

// ─── SecondaryCarousel: كاروسيل على الجوال + جانبًا على الديسكتوب ───────────

function SecondaryCarousel({
  ads,
  onView,
  onClick,
}: {
  ads: Ad[];
  onView: (id: string, d: number) => void;
  onClick: (ad: Ad, x: number, y: number) => void;
}) {
  const scrollRef   = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);

  // تتبع البطاقة النشطة عند التمرير
  const onScroll = useCallback(() => {
    if (!scrollRef.current) return;
    const el    = scrollRef.current;
    const idx   = Math.round(el.scrollLeft / (el.offsetWidth * 0.88));
    setActive(Math.min(Math.max(idx, 0), ads.length - 1));
  }, [ads.length]);

  const scrollTo = (i: number) => {
    if (!scrollRef.current) return;
    scrollRef.current.scrollTo({ left: scrollRef.current.offsetWidth * 0.88 * i, behavior: "smooth" });
  };

  if (ads.length === 0) return null;

  const SECONDARY_H = "h-[170px] sm:h-[190px]";

  return (
    <>
      {/* ─ ديسكتوب: عمودان جنباً إلى جنب ─ */}
      <div
        className={cn(
          "hidden sm:grid gap-3",
          ads.length === 1 ? "grid-cols-1 max-w-xl" : "grid-cols-2",
          SECONDARY_H
        )}
      >
        {ads.map((ad, i) => (
          <AdSlot
            key={ad.id}
            ad={ad}
            className={cn("h-full rounded-2xl shadow-sm ring-1 ring-black/5")}
            priority={i === 0}
            onView={(d) => onView(ad.id, d)}
            onClick={(x, y) => onClick(ad, x, y)}
          />
        ))}
      </div>

      {/* ─ جوال: كاروسيل أفقي بـ scroll-snap ─ */}
      <div className="sm:hidden">
        <div
          ref={scrollRef}
          onScroll={onScroll}
          className="ads-carousel flex gap-3 overflow-x-auto snap-x snap-mandatory scroll-smooth pb-1"
          style={{ scrollbarWidth: "none" } as React.CSSProperties}
        >
          {ads.map((ad, i) => (
            <div
              key={ad.id}
              className="snap-start shrink-0"
              style={{ width: "calc(88% - 6px)", height: "180px" }}
            >
              <AdSlot
                ad={ad}
                className="h-full rounded-2xl shadow-sm ring-1 ring-black/5"
                priority={i === 0}
                onView={(d) => onView(ad.id, d)}
                onClick={(x, y) => onClick(ad, x, y)}
              />
            </div>
          ))}
        </div>

        {/* مؤشرات النقاط للكاروسيل على الجوال */}
        {ads.length > 1 && (
          <div className="flex justify-center gap-1.5 mt-2">
            {ads.map((_, i) => (
              <button
                key={i}
                onClick={() => scrollTo(i)}
                className={cn(
                  "rounded-full transition-all duration-300",
                  i === active
                    ? "w-5 h-1.5 bg-accent"
                    : "w-1.5 h-1.5 bg-muted-foreground/30 hover:bg-muted-foreground/50"
                )}
                aria-label={`إعلان ${i + 1}`}
              />
            ))}
          </div>
        )}
      </div>
    </>
  );
}

// ─── المكوّن الرئيسي ──────────────────────────────────────────────────────────

interface Props { ads: Ad[]; }

export function AdsBanner({ ads }: Props) {
  const { trackAdView, trackAdClick } = useData();
  const { isStaff } = useAuth();

  const active = getActiveAds(ads);
  if (active.length === 0) return null;

  // كل نوع يظهر في مكانه فقط — لا يوجد fallback بين النوعين
  const premiums    = active.filter(a => (a.type ?? "premium") === "premium");
  const secondaries = active.filter(a =>  a.type               === "secondary").slice(0, 2);

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
    <section
      className="container px-4 sm:px-6 pt-4 sm:pt-5 pb-6 space-y-3"
      aria-label="إعلانات"
    >
      {premiums.length > 0 && (
        <PremiumSlot premiums={premiums} onView={onView} onClick={onClick} />
      )}

      {secondaries.length > 0 && (
        <SecondaryCarousel ads={secondaries} onView={onView} onClick={onClick} />
      )}
    </section>
  );
}
