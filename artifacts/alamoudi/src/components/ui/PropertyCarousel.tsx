import { useRef, useEffect, useCallback, useState } from "react";
import useEmblaCarousel from "embla-carousel-react";
import { PropertyCard, type CardSize } from "./PropertyCard";
import { cn } from "@/lib/utils";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useData } from "@/context/DataContext";

export interface PropertyCarouselProps {
  properties: any[];
  size?: CardSize;
  layout?: "grid" | "list";
  emphasized?: boolean;
  detailsScale?: "home" | "city";
  className?: string;
  autoPlay?: boolean;
  /** Waiting time between slides in ms */
  autoPlayDelay?: number;
  /** Movement speed multiplier (0.25 = slower/cinematic, 1 = normal, 4 = faster) */
  motionSpeed?: number;
  infinite?: boolean;
  glass?: boolean;
  /** Show navigation arrows (defaults to true) */
  showArrows?: boolean;
}

export function PropertyCarousel({
  properties,
  size = "compact",
  layout = "grid",
  emphasized = false,
  detailsScale = "home",
  className,
  autoPlay = true,
  autoPlayDelay = 3500,
  motionSpeed = 1,
  infinite = true,
  glass = true,
  showArrows = true,
}: PropertyCarouselProps) {
  const { settings } = useData();

  // Unified auto-play check: enabled by default, paused when user disables the switch
  const isAutoPlay =
    autoPlay &&
    settings.carouselAutoPlayEnabled !== false &&
    settings.carouselEnabled !== false;

  const safeSpeed = Math.min(4, Math.max(0.25, Number(motionSpeed) || 1));

  // Ultra-Soft Silk Physics (Damped Smooth Glide)
  const emblaDuration = Math.round(38 / Math.sqrt(safeSpeed));

  const [emblaRef, emblaApi] = useEmblaCarousel({
    loop: infinite && properties.length > 1,
    align: "start",
    direction: "rtl",
    duration: emblaDuration,
    skipSnaps: false,
    dragFree: false,
  });

  const [canScrollPrev, setCanScrollPrev] = useState(true);
  const [canScrollNext, setCanScrollNext] = useState(true);

  const isInteractingRef = useRef(false);
  const timerRef = useRef<number | null>(null);

  const clearTimer = useCallback(() => {
    if (timerRef.current !== null) {
      window.clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const scheduleNext = useCallback(
    (delay: number) => {
      clearTimer();
      if (!isAutoPlay || isInteractingRef.current || !emblaApi || properties.length < 2) {
        return;
      }
      timerRef.current = window.setTimeout(() => {
        if (isInteractingRef.current || !emblaApi) return;
        emblaApi.scrollNext();
      }, delay);
    },
    [isAutoPlay, clearTimer, emblaApi, properties.length],
  );

  const onStart = useCallback(() => {
    isInteractingRef.current = true;
    clearTimer();
  }, [clearTimer]);

  const onEnd = useCallback(() => {
    isInteractingRef.current = false;
    clearTimer();
    if (!isAutoPlay || properties.length < 2) return;

    // Guaranteed full 4+ seconds grace period after removing mouse or finger
    const postInteractionDelay = Math.max(4000, Number(autoPlayDelay) || 4000);
    scheduleNext(postInteractionDelay);
  }, [isAutoPlay, autoPlayDelay, clearTimer, properties.length, scheduleNext]);

  // Hook into Embla's internal touch and pointer drag lifecycle + selection state
  useEffect(() => {
    if (!emblaApi) return;

    const updateScrollButtons = () => {
      setCanScrollPrev(emblaApi.canScrollPrev());
      setCanScrollNext(emblaApi.canScrollNext());
    };

    const handlePointerDown = () => {
      onStart();
    };

    const handlePointerUp = () => {
      onEnd();
    };

    const handleSettle = () => {
      updateScrollButtons();
      if (isInteractingRef.current) {
        clearTimer();
        return;
      }
      const standardDelay = Math.max(3500, Number(autoPlayDelay) || 3500);
      scheduleNext(standardDelay);
    };

    updateScrollButtons();
    emblaApi.on("select", updateScrollButtons);
    emblaApi.on("reInit", updateScrollButtons);
    emblaApi.on("pointerDown", handlePointerDown);
    emblaApi.on("pointerUp", handlePointerUp);
    emblaApi.on("settle", handleSettle);

    // Start autoplay only when enabled
    if (isAutoPlay) {
      const initialDelay = Math.max(3500, Number(autoPlayDelay) || 3500);
      scheduleNext(initialDelay);
    } else {
      clearTimer();
    }

    return () => {
      clearTimer();
      emblaApi.off("select", updateScrollButtons);
      emblaApi.off("reInit", updateScrollButtons);
      emblaApi.off("pointerDown", handlePointerDown);
      emblaApi.off("pointerUp", handlePointerUp);
      emblaApi.off("settle", handleSettle);
    };
  }, [emblaApi, isAutoPlay, autoPlayDelay, clearTimer, onStart, onEnd, scheduleNext]);

  const scrollPrev = useCallback(
    (e?: React.MouseEvent) => {
      e?.stopPropagation();
      if (!emblaApi) return;
      onStart();
      emblaApi.scrollPrev();
      window.setTimeout(() => {
        onEnd();
      }, 500);
    },
    [emblaApi, onStart, onEnd],
  );

  const scrollNext = useCallback(
    (e?: React.MouseEvent) => {
      e?.stopPropagation();
      if (!emblaApi) return;
      onStart();
      emblaApi.scrollNext();
      window.setTimeout(() => {
        onEnd();
      }, 500);
    },
    [emblaApi, onStart, onEnd],
  );

  if (!properties || properties.length === 0) return null;

  const hasMultiple = properties.length > 1;

  return (
    <div
      className={cn("relative group/carousel", className)}
      onPointerEnter={onStart}
      onPointerLeave={onEnd}
      onPointerDown={onStart}
      onPointerUp={onEnd}
      onPointerCancel={onEnd}
      onTouchStart={onStart}
      onTouchEnd={onEnd}
      onTouchCancel={onEnd}
      dir="rtl"
    >
      {/* Navigation Arrow: Right (Previous in RTL) */}
      {showArrows && hasMultiple && (
        <button
          type="button"
          onClick={scrollPrev}
          disabled={!infinite && !canScrollPrev}
          className={cn(
            "carousel-nav-btn carousel-nav-right absolute right-0.5 sm:-right-3.5 top-1/2 -translate-y-1/2 z-20",
            "w-5.5 sm:w-7 h-14 sm:h-20 rounded-[7px] sm:rounded-[8px]",
            "bg-background/50 dark:bg-[#101418]/60 hover:bg-background/85 dark:hover:bg-[#161B21]/90",
            "border border-[#C5A059]/45 hover:border-[#C5A059]",
            "text-[#C5A059] shadow-md shadow-black/20 hover:shadow-lg hover:shadow-black/40",
            "flex items-center justify-center backdrop-blur-md",
            "transition-all duration-200 hover:scale-105 active:scale-95",
            "cursor-pointer disabled:opacity-20 disabled:pointer-events-none select-none touch-manipulation",
            "group focus:outline-none focus:ring-2 focus:ring-[#C5A059]/50"
          )}
          aria-label="السابق (تمرير لليمين)"
          title="السابق"
        >
          <ChevronRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 stroke-[2.5] drop-shadow-xs group-hover:translate-x-0.5 transition-transform" />
        </button>
      )}

      {/* Navigation Arrow: Left (Next in RTL) */}
      {showArrows && hasMultiple && (
        <button
          type="button"
          onClick={scrollNext}
          disabled={!infinite && !canScrollNext}
          className={cn(
            "carousel-nav-btn carousel-nav-left absolute left-0.5 sm:-left-3.5 top-1/2 -translate-y-1/2 z-20",
            "w-5.5 sm:w-7 h-14 sm:h-20 rounded-[7px] sm:rounded-[8px]",
            "bg-background/50 dark:bg-[#101418]/60 hover:bg-background/85 dark:hover:bg-[#161B21]/90",
            "border border-[#C5A059]/45 hover:border-[#C5A059]",
            "text-[#C5A059] shadow-md shadow-black/20 hover:shadow-lg hover:shadow-black/40",
            "flex items-center justify-center backdrop-blur-md",
            "transition-all duration-200 hover:scale-105 active:scale-95",
            "cursor-pointer disabled:opacity-20 disabled:pointer-events-none select-none touch-manipulation",
            "group focus:outline-none focus:ring-2 focus:ring-[#C5A059]/50"
          )}
          aria-label="التالي (تمرير لليسار)"
          title="التالي"
        >
          <ChevronLeft className="w-3.5 h-3.5 sm:w-4 sm:h-4 stroke-[2.5] drop-shadow-xs group-hover:-translate-x-0.5 transition-transform" />
        </button>
      )}

      <div ref={emblaRef} className="overflow-hidden py-3">
        <div className="flex gap-2.5 sm:gap-4 -mr-2.5 sm:-mr-4">
          {properties.map((property, index) => (
            <div
              key={`${property.id}-${index}`}
              className="flex-shrink-0 pr-2.5 sm:pr-4 w-[90vw] sm:w-[48vw] md:w-[380px] lg:w-[415px]"
            >
              <PropertyCard
                property={property}
                size={size}
                layout={layout}
                emphasized={emphasized}
                detailsScale={detailsScale}
                glass={glass}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
