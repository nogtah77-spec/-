// ─── AdsBanner — Public Display Component ────────────────────────────────────
//
// DISPLAY CONTRACT:
//   • Images are NEVER cropped, stretched, or modified.
//   • The correct image (desktop / mobile) is selected based on viewport width.
//   • Images scale proportionally (width: 100%; height: auto).
//   • Guide overlays are NEVER shown on the public site.

import { useState, useEffect, useCallback, useRef } from "react";
import { cn } from "@/lib/utils";
import type { Ad } from "@/context/DataContext";
import { useData } from "@/context/DataContext";
import { useAuth } from "@/context/AuthContext";
import { buildEventPayload } from "@/lib/adTracking";
import { SLOT_TEMPLATES } from "@/lib/adTemplates";

// نسب عرض Secondary مشتقة مباشرةً من التمبلتات — تتحدث تلقائياً عند تغيير الأبعاد
const SEC_DESKTOP_RATIO =
  `${SLOT_TEMPLATES.secondary.desktop.width}/${SLOT_TEMPLATES.secondary.desktop.height}` as const;
const SEC_MOBILE_RATIO  =
  `${SLOT_TEMPLATES.secondary.mobile.width}/${SLOT_TEMPLATES.secondary.mobile.height}`  as const;

// ─── helpers ─────────────────────────────────────────────────────────────────

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
// Serves desktop image (≥1024px) or mobile image (<1024px).
// mode="proportional" → width:100%; height:auto (Premium).
// mode="cover"        → fills a fixed aspect-ratio box via object-cover (Secondary).

function AdPicture({
  ad,
  priority,
  mode = "proportional",
  coverRatio = SEC_DESKTOP_RATIO,
}: {
  ad: Ad;
  priority?: boolean;
  mode?: "proportional" | "cover" | "fill";
  coverRatio?: string;
}) {
  const desktop = getDesktopSrc(ad);
  const mobile  = getMobileSrc(ad);

  if (mode === "fill") {
    return (
      <picture className="absolute inset-0 block w-full h-full">
        <source media="(min-width: 1024px)" srcSet={desktop} />
        <img
          src={mobile}
          alt={ad.title || "إعلان"}
          loading={priority ? "eager" : "lazy"}
          decoding="async"
          draggable={false}
          className="w-full h-full object-cover block"
        />
      </picture>
    );
  }

  if (mode === "cover") {
    return (
      <picture className="block w-full" style={{ aspectRatio: coverRatio }}>
        <source media="(min-width: 1024px)" srcSet={desktop} />
        <img
          src={mobile}
          alt={ad.title || "إعلان"}
          loading={priority ? "eager" : "lazy"}
          decoding="async"
          draggable={false}
          className="w-full h-full object-cover block"
        />
      </picture>
    );
  }

  return (
    <picture className="block">
      <source media="(min-width: 1024px)" srcSet={desktop} />
      <img
        src={mobile}
        alt={ad.title || "إعلان"}
        loading={priority ? "eager" : "lazy"}
        decoding="async"
        draggable={false}
        className="w-full h-auto block"
      />
    </picture>
  );
}

// ─── AdSlot ───────────────────────────────────────────────────────────────────
// Wraps one ad image with view / click tracking and optional title overlay.

function AdSlot({
  ad,
  className,
  priority,
  pictureMode = "proportional",
  coverRatio,
  onView,
  onClick,
}: {
  ad: Ad;
  className?: string;
  priority?: boolean;
  pictureMode?: "proportional" | "cover" | "fill";
  coverRatio?: string;
  onView?: (viewDuration: number) => void;
  onClick?: (clickX: number, clickY: number) => void;
}) {
  const ref       = useRef<HTMLDivElement>(null);
  const viewed    = useRef(false);

  useEffect(() => {
    if (!onView) return;
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting && !viewed.current) {
          viewed.current = true;
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
    const rect   = ref.current.getBoundingClientRect();
    const clickX = (e.clientX - rect.left)  / rect.width;
    const clickY = (e.clientY - rect.top)   / rect.height;
    onClick(
      Math.min(1, Math.max(0, clickX)),
      Math.min(1, Math.max(0, clickY)),
    );
  }, [onClick]);

  return (
    <div
      ref={ref}
      role={ad.linkUrl ? "link" : undefined}
      className={cn(
        "relative overflow-hidden bg-neutral-100 transition-opacity duration-300",
        ad.linkUrl ? "cursor-pointer" : "cursor-default",
        className,
      )}
      onClick={handleClick}
    >
      <AdPicture ad={ad} priority={priority} mode={pictureMode} coverRatio={coverRatio} />

      {/* Title overlay — positioned over bottom of fluid-height container */}
      {ad.title && (
        <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent pointer-events-none px-4 pb-3 pt-10 z-10">
          <p className="text-white font-semibold text-sm leading-snug drop-shadow line-clamp-1 text-right">
            {ad.title}
          </p>
        </div>
      )}

      {/* Subtle hover shimmer */}
      {ad.linkUrl && (
        <div className="absolute inset-0 bg-white/0 hover:bg-white/5 transition-colors duration-200 pointer-events-none" />
      )}
    </div>
  );
}

// ─── PremiumSlot ──────────────────────────────────────────────────────────────
// Auto-rotating carousel. Drag/swipe to navigate. Dot indicators only.
// Rounded box, no arrows, no progress bar.

function PremiumSlot({
  premiums,
  onView,
  onClick,
}: {
  premiums: Ad[];
  onView:  (id: string, d: number) => void;
  onClick: (ad: Ad, x: number, y: number) => void;
}) {
  const count                     = premiums.length;
  const [current, setCur]         = useState(0);
  const [paused,  setPause]       = useState(false);
  const [isDragging, setDragging] = useState(false);
  const [dragDelta,  setDelta]    = useState(0);
  const dragStartX                = useRef<number | null>(null);
  const containerRef              = useRef<HTMLDivElement>(null);
  const ad                        = premiums[current];

  const next = useCallback(() => setCur(i => (i + 1) % count), [count]);
  const prev = useCallback(() => setCur(i => (i - 1 + count) % count), [count]);

  useEffect(() => { setCur(0); }, [count]);
  useEffect(() => {
    if (count <= 1 || paused) return;
    const ms = (ad?.duration ?? 6) * 1000;
    const t  = setTimeout(next, ms);
    return () => clearTimeout(t);
  }, [count, paused, current, ad, next]);

  // ── Touch ──────────────────────────────────────────────────────────────────
  const handleTouchStart = (e: React.TouchEvent) => {
    dragStartX.current = e.touches[0].clientX;
    setDelta(0);
    setPause(true);
  };
  const handleTouchMove = (e: React.TouchEvent) => {
    if (dragStartX.current === null) return;
    setDelta(e.touches[0].clientX - dragStartX.current);
  };
  const handleTouchEnd = () => {
    if (dragStartX.current !== null) {
      if (dragDelta >  50) prev();
      else if (dragDelta < -50) next();
    }
    dragStartX.current = null;
    setDelta(0);
    setPause(false);
  };

  // ── Mouse ──────────────────────────────────────────────────────────────────
  const handleMouseDown = (e: React.MouseEvent) => {
    dragStartX.current = e.clientX;
    setDelta(0);
    setDragging(true);
    setPause(true);
    e.preventDefault();
  };
  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || dragStartX.current === null) return;
    setDelta(e.clientX - dragStartX.current);
  };
  const finishMouseDrag = () => {
    if (!isDragging) return;
    if (dragDelta >  50) prev();
    else if (dragDelta < -50) next();
    dragStartX.current = null;
    setDelta(0);
    setDragging(false);
    setPause(false);
  };

  if (!ad) return null;

  const trackStyle: React.CSSProperties = {
    transform:  `translateX(calc(-${current * 100}% + ${dragDelta}px))`,
    transition: isDragging ? "none" : "transform 520ms cubic-bezier(0.4, 0, 0.2, 1)",
  };

  return (
    <div
      className="relative"
      onMouseEnter={() => count > 1 && setPause(true)}
      onMouseLeave={() => { setPause(false); finishMouseDrag(); }}
    >
      {/* ── Track ── */}
      <div
        ref={containerRef}
        className={cn(
          "relative overflow-hidden rounded-2xl shadow-sm ring-1 ring-black/5 select-none",
          "aspect-[800/138] lg:aspect-[960/138]",
          count > 1 ? (isDragging ? "cursor-grabbing" : "cursor-grab") : "cursor-default",
        )}
        onTouchStart={count > 1 ? handleTouchStart : undefined}
        onTouchMove={count > 1 ? handleTouchMove   : undefined}
        onTouchEnd={count > 1 ? handleTouchEnd     : undefined}
        onMouseDown={count > 1 ? handleMouseDown   : undefined}
        onMouseMove={count > 1 ? handleMouseMove   : undefined}
        onMouseUp={count > 1 ? finishMouseDrag     : undefined}
      >
        <div dir="ltr" className="flex h-full" style={trackStyle}>
          {premiums.map((p, i) => (
            <div
              key={p.id}
              className="relative flex-shrink-0 w-full h-full overflow-hidden"
              onClick={(e) => {
                if (Math.abs(dragDelta) > 8) return;
                if (!containerRef.current) return;
                const rect = containerRef.current.getBoundingClientRect();
                const x = Math.min(1, Math.max(0, (e.clientX - rect.left) / rect.width));
                const y = Math.min(1, Math.max(0, (e.clientY - rect.top)  / rect.height));
                onClick(p, x, y);
              }}
            >
              <AdSlot
                ad={p}
                className="absolute inset-0"
                pictureMode="fill"
                priority={i === 0}
                onView={(d) => onView(p.id, d)}
              />
            </div>
          ))}
        </div>
      </div>

      {/* ── Dot indicators ── */}
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
    </div>
  );
}

// ─── SecondarySlide ───────────────────────────────────────────────────────────
// Single slide inside the SecondaryCarousel.
// Responsive aspect-ratio: mobile 800/400 → desktop 960/300.

function SecondarySlide({
  ad,
  priority,
  onClick,
}: {
  ad: Ad;
  priority?: boolean;
  onClick?: (e: React.MouseEvent) => void;
}) {
  const desktop = getDesktopSrc(ad);
  const mobile  = getMobileSrc(ad);

  return (
    // aspect-[800/400] on mobile (2:1) → aspect-[960/300] on desktop (16:5)
    <div
      role={ad.linkUrl ? "link" : undefined}
      className={cn(
        "relative w-full overflow-hidden bg-neutral-100 select-none aspect-[800/138] lg:aspect-[960/138]",
        ad.linkUrl ? "cursor-pointer" : "cursor-default",
      )}
      onClick={onClick}
    >
      <picture className="absolute inset-0 block w-full h-full">
        <source media="(min-width: 1024px)" srcSet={desktop} />
        <img
          src={mobile}
          alt={ad.title || "إعلان"}
          loading={priority ? "eager" : "lazy"}
          decoding="async"
          draggable={false}
          className="w-full h-full object-cover block"
        />
      </picture>

      {ad.title && (
        <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent pointer-events-none px-4 pb-3 pt-10 z-10">
          <p className="text-white font-semibold text-sm leading-snug drop-shadow line-clamp-1 text-right">
            {ad.title}
          </p>
        </div>
      )}
      {ad.linkUrl && (
        <div className="absolute inset-0 bg-white/0 hover:bg-white/5 transition-colors duration-200 pointer-events-none" />
      )}
    </div>
  );
}

// ─── SecondaryCarousel ────────────────────────────────────────────────────────
// Full-featured carousel: auto-play, touch drag, mouse drag, arrows, dots.
// Works identically on mobile and desktop.
// If 1 ad: no auto-play, no controls.

function SecondaryCarousel({
  ads,
  onView,
  onClick,
}: {
  ads:     Ad[];
  onView:  (id: string, d: number) => void;
  onClick: (ad: Ad, x: number, y: number) => void;
}) {
  const count                     = ads.length;
  const [current, setCurrent]     = useState(0);
  const [paused,  setPaused]      = useState(false);
  const [isDragging, setDragging] = useState(false);
  const [dragDelta,  setDelta]    = useState(0);
  const dragStartX                = useRef<number | null>(null);
  const containerRef              = useRef<HTMLDivElement>(null);
  const viewed                    = useRef<Set<string>>(new Set());

  const next = useCallback(() => setCurrent(i => (i + 1) % count), [count]);
  const prev = useCallback(() => setCurrent(i => (i - 1 + count) % count), [count]);

  useEffect(() => { setCurrent(0); }, [count]);

  // Auto-play
  useEffect(() => {
    if (count <= 1 || paused) return;
    const t = setInterval(next, 6000);
    return () => clearInterval(t);
  }, [count, paused, next]);

  // View tracking for current slide
  useEffect(() => {
    const ad = ads[current];
    if (!ad || viewed.current.has(ad.id)) return;
    viewed.current.add(ad.id);
    onView(ad.id, 0);
  }, [current, ads, onView]);

  // ── Touch ──────────────────────────────────────────────────────────────────
  const handleTouchStart = (e: React.TouchEvent) => {
    dragStartX.current = e.touches[0].clientX;
    setDelta(0);
    setPaused(true);
  };
  const handleTouchMove = (e: React.TouchEvent) => {
    if (dragStartX.current === null) return;
    setDelta(e.touches[0].clientX - dragStartX.current);
  };
  const handleTouchEnd = () => {
    if (dragStartX.current !== null) {
      if (dragDelta > 50) prev();
      else if (dragDelta < -50) next();
    }
    dragStartX.current = null;
    setDelta(0);
    setPaused(false);
  };

  // ── Mouse ──────────────────────────────────────────────────────────────────
  const handleMouseDown = (e: React.MouseEvent) => {
    dragStartX.current = e.clientX;
    setDelta(0);
    setDragging(true);
    setPaused(true);
    e.preventDefault();
  };
  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || dragStartX.current === null) return;
    setDelta(e.clientX - dragStartX.current);
  };
  const finishMouseDrag = () => {
    if (!isDragging) return;
    if (dragDelta > 50) prev();
    else if (dragDelta < -50) next();
    dragStartX.current = null;
    setDelta(0);
    setDragging(false);
    setPaused(false);
  };

  // ── Click tracking ────────────────────────────────────────────────────────
  const handleSlideClick = (ad: Ad) => (e: React.MouseEvent) => {
    if (Math.abs(dragDelta) > 8) return; // was a drag, not a click
    const el = containerRef.current;
    if (!el) return;
    const rect   = el.getBoundingClientRect();
    const clickX = Math.min(1, Math.max(0, (e.clientX - rect.left)  / rect.width));
    const clickY = Math.min(1, Math.max(0, (e.clientY - rect.top)   / rect.height));
    onClick(ad, clickX, clickY);
  };

  if (count === 0) return null;

  const trackStyle: React.CSSProperties = {
    transform: `translateX(calc(-${current * 100}% + ${dragDelta}px))`,
    transition: isDragging ? "none" : "transform 520ms cubic-bezier(0.4, 0, 0.2, 1)",
  };

  return (
    <div
      className="relative group"
      onMouseEnter={() => count > 1 && setPaused(true)}
      onMouseLeave={() => { setPaused(false); finishMouseDrag(); }}
    >
      {/* ── Track ─────────────────────────────────────────────────────── */}
      <div
        ref={containerRef}
        className={cn(
          "overflow-hidden rounded-2xl shadow-sm ring-1 ring-black/5 select-none",
          count > 1 ? (isDragging ? "cursor-grabbing" : "cursor-grab") : "cursor-default",
        )}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onMouseDown={count > 1 ? handleMouseDown : undefined}
        onMouseMove={count > 1 ? handleMouseMove : undefined}
        onMouseUp={count > 1 ? finishMouseDrag : undefined}
      >
        {/* dir=ltr: ensures translateX works correctly regardless of page RTL direction */}
        <div dir="ltr" className="flex" style={trackStyle}>
          {ads.map((ad, i) => (
            <div key={ad.id} className="flex-shrink-0 w-full">
              <SecondarySlide
                ad={ad}
                priority={i === 0}
                onClick={handleSlideClick(ad)}
              />
            </div>
          ))}
        </div>
      </div>

      {/* ── Dot indicators ────────────────────────────────────────────── */}
      {count > 1 && (
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5 z-20">
          {ads.map((_, i) => (
            <button
              key={i}
              onClick={e => { e.stopPropagation(); setCurrent(i); }}
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
    </div>
  );
}

// ─── Shared tracking factory ──────────────────────────────────────────────────

function useAdTracking() {
  const { trackAdView, trackAdClick } = useData();
  const { isStaff } = useAuth();

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

  return { onView, onClick };
}

// ─── PremiumBanner ────────────────────────────────────────────────────────────
// Renders only the premium ad carousel — exported for standalone placement.

interface BannerProps { ads: Ad[]; }

export function PremiumBanner({ ads }: BannerProps) {
  const { onView, onClick } = useAdTracking();

  const active   = getActiveAds(ads);
  const premiums = active.filter(a => (a.type ?? "premium") === "premium");
  if (premiums.length === 0) return null;

  return (
    <div className="w-full">
      <PremiumSlot premiums={premiums} onView={onView} onClick={onClick} />
    </div>
  );
}

// ─── SecondaryBanner ──────────────────────────────────────────────────────────
// Renders only the secondary ad carousel — exported for standalone placement.

export function SecondaryBanner({ ads }: BannerProps) {
  const { onView, onClick } = useAdTracking();

  const active      = getActiveAds(ads);
  const secondaries = active.filter(a => a.type === "secondary").slice(0, 6);
  if (secondaries.length === 0) return null;

  return (
    <div className="container px-4 sm:px-6">
      <SecondaryCarousel ads={secondaries} onView={onView} onClick={onClick} />
    </div>
  );
}

// ─── AdsBanner (Public Entry Point — backward compat) ─────────────────────────

interface Props { ads: Ad[]; }

export function AdsBanner({ ads }: Props) {
  const { onView, onClick } = useAdTracking();

  const active      = getActiveAds(ads);
  if (active.length === 0) return null;

  const premiums    = active.filter(a => (a.type ?? "premium") === "premium");
  const secondaries = active.filter(a =>  a.type               === "secondary").slice(0, 6);

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
