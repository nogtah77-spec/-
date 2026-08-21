import { useRef, useEffect, useCallback } from "react";
import useEmblaCarousel from "embla-carousel-react";
import { PropertyCard, type CardSize } from "./PropertyCard";
import { cn } from "@/lib/utils";

interface PropertyCarouselProps {
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
}

export function PropertyCarousel({
  properties,
  size = "compact",
  layout = "grid",
  emphasized = false,
  detailsScale = "home",
  className,
  autoPlay = false,
  autoPlayDelay = 3500,
  motionSpeed = 1,
  infinite = true,
}: PropertyCarouselProps) {
  const safeSpeed = Math.min(4, Math.max(0.25, Number(motionSpeed) || 1));

  // Ultra-Soft Silk Physics (Damped Smooth Glide):
  // At 0.25x -> duration is ~76 (calm, velvet, cinematic glide)
  // At 0.50x -> duration is ~54
  // At 1.00x -> duration is ~38 (luxury smooth)
  // At 2.00x -> duration is ~27
  const emblaDuration = Math.round(38 / Math.sqrt(safeSpeed));

  const [emblaRef, emblaApi] = useEmblaCarousel({
    loop: infinite && properties.length > 1,
    align: "start",
    direction: "rtl",
    duration: emblaDuration,
    skipSnaps: false,
    dragFree: false,
  });

  const isInteractingRef = useRef(false);
  const autoPlayTimerRef = useRef<number | null>(null);
  const resumeTimerRef = useRef<number | null>(null);

  const clearAllTimers = useCallback(() => {
    if (autoPlayTimerRef.current !== null) {
      window.clearTimeout(autoPlayTimerRef.current);
      autoPlayTimerRef.current = null;
    }
    if (resumeTimerRef.current !== null) {
      window.clearTimeout(resumeTimerRef.current);
      resumeTimerRef.current = null;
    }
  }, []);

  const scheduleNextSlide = useCallback(() => {
    clearAllTimers();
    if (!autoPlay || isInteractingRef.current || !emblaApi || properties.length < 2) {
      return;
    }

    const waitTime = Math.max(1500, autoPlayDelay);
    autoPlayTimerRef.current = window.setTimeout(() => {
      if (isInteractingRef.current || !emblaApi) return;
      emblaApi.scrollNext();
    }, waitTime);
  }, [autoPlay, autoPlayDelay, clearAllTimers, emblaApi, properties.length]);

  const handleInteractionStart = useCallback(() => {
    isInteractingRef.current = true;
    clearAllTimers();
  }, [clearAllTimers]);

  const handleInteractionEnd = useCallback((gracePeriodMs = 3500) => {
    isInteractingRef.current = false;
    clearAllTimers();
    if (!autoPlay || properties.length < 2) return;

    // Grace period gives user ample time to read after letting go of touch or hover
    resumeTimerRef.current = window.setTimeout(() => {
      resumeTimerRef.current = null;
      scheduleNextSlide();
    }, Math.max(1500, gracePeriodMs));
  }, [autoPlay, clearAllTimers, properties.length, scheduleNextSlide]);

  // Hook into Embla's internal touch and pointer drag lifecycle
  useEffect(() => {
    if (!emblaApi) return;

    const onPointerDown = () => {
      handleInteractionStart();
    };

    const onPointerUp = () => {
      handleInteractionEnd(3500);
    };

    const onSettle = () => {
      if (!isInteractingRef.current) {
        scheduleNextSlide();
      }
    };

    emblaApi.on("pointerDown", onPointerDown);
    emblaApi.on("pointerUp", onPointerUp);
    emblaApi.on("settle", onSettle);

    // Initial schedule
    scheduleNextSlide();

    return () => {
      clearAllTimers();
      emblaApi.off("pointerDown", onPointerDown);
      emblaApi.off("pointerUp", onPointerUp);
      emblaApi.off("settle", onSettle);
    };
  }, [emblaApi, clearAllTimers, handleInteractionStart, handleInteractionEnd, scheduleNextSlide]);

  if (!properties || properties.length === 0) return null;

  return (
    <div
      className={cn("relative overflow-hidden", className)}
      onMouseEnter={handleInteractionStart}
      onMouseLeave={() => handleInteractionEnd(3000)}
      onTouchStart={handleInteractionStart}
      onTouchEnd={() => handleInteractionEnd(3500)}
      dir="rtl"
    >
      <div ref={emblaRef} className="overflow-hidden py-3">
        <div className="flex gap-3 sm:gap-4 -mr-3 sm:-mr-4">
          {properties.map((property, index) => (
            <div
              key={`${property.id}-${index}`}
              className="flex-shrink-0 pr-3 sm:pr-4 w-[84vw] sm:w-[58vw] md:w-[380px] lg:w-[420px]"
            >
              <PropertyCard
                property={property}
                size={size}
                layout={layout}
                emphasized={emphasized}
                detailsScale={detailsScale}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
