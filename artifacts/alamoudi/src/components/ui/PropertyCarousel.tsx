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

  // In Embla Carousel, duration determines the transition animation speed (physics).
  // At 0.25x -> duration is 55 (slow, calm, majestic).
  // At 1.0x -> duration is 28 (smooth standard).
  // At 2.0x -> duration is 18 (faster).
  const emblaDuration = Math.round(28 / Math.sqrt(safeSpeed));

  const [emblaRef, emblaApi] = useEmblaCarousel({
    loop: infinite && properties.length > 1,
    align: "start",
    direction: "rtl",
    duration: emblaDuration,
    skipSnaps: false,
    dragFree: false,
  });

  const isPausedRef = useRef(false);

  // Auto-play interval with pause on hover/touch
  useEffect(() => {
    if (!emblaApi || !autoPlay || properties.length < 2) return;

    const intervalTime = Math.max(1200, autoPlayDelay);
    const interval = setInterval(() => {
      if (!isPausedRef.current && emblaApi) {
        emblaApi.scrollNext();
      }
    }, intervalTime);

    return () => clearInterval(interval);
  }, [emblaApi, autoPlay, autoPlayDelay, properties.length]);

  const onMouseEnter = useCallback(() => {
    isPausedRef.current = true;
  }, []);

  const onMouseLeave = useCallback(() => {
    isPausedRef.current = false;
  }, []);

  if (!properties || properties.length === 0) return null;

  return (
    <div
      className={cn("relative overflow-hidden", className)}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
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
