import { useRef, useState, useEffect, useCallback } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { PropertyCard, type CardSize } from "./PropertyCard";
import { cn } from "@/lib/utils";

interface PropertyCarouselProps {
  properties: any[];
  size?: CardSize;
  className?: string;
  autoPlay?: boolean;
  /** Waiting time between the end of one movement and the next movement, in ms. */
  autoPlayDelay?: number;
  /** Movement multiplier: 1 is the natural speed, 4 is four times faster. */
  motionSpeed?: number;
  infinite?: boolean;
}

export function PropertyCarousel({
  properties,
  size = "compact",
  className,
  autoPlay = false,
  autoPlayDelay = 3500,
  motionSpeed = 1,
  infinite = false,
}: PropertyCarouselProps) {
  const viewportRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const [canPrev, setCanPrev] = useState(false);
  const [canNext, setCanNext] = useState(false);
  const autoPlayTimerRef = useRef<number | null>(null);
  const resumeTimerRef = useRef<number | null>(null);
  const motionRef = useRef<number | null>(null);
  const currentIndexRef = useRef(0);
  const isAnimatingRef = useRef(false);
  const autoPlayEnabledRef = useRef(autoPlay);
  const pausedRef = useRef(false);
  const safeMotionSpeed = Math.min(4, Math.max(0.25, Number(motionSpeed) || 1));
  const propertyCount = properties.length;

  // Three copies keep enough real card content around the viewport to make
  // the loop visually seamless. The cards themselves are still the original
  // property cards; only the rendered sequence is duplicated for looping.
  const trackProperties = infinite
    ? [...properties, ...properties, ...properties]
    : properties;
  const middleStart = infinite ? propertyCount : 0;

  useEffect(() => {
    autoPlayEnabledRef.current = autoPlay;
  }, [autoPlay]);

  const stopAutoPlay = useCallback(() => {
    if (autoPlayTimerRef.current !== null) {
      window.clearTimeout(autoPlayTimerRef.current);
      autoPlayTimerRef.current = null;
    }
  }, []);

  const stopMotion = useCallback(() => {
    if (motionRef.current !== null) {
      cancelAnimationFrame(motionRef.current);
      motionRef.current = null;
    }
    isAnimatingRef.current = false;
  }, []);

  const getOffsetForIndex = useCallback((index: number) => {
    const track = trackRef.current;
    const item = track?.children[index] as HTMLElement | undefined;
    return item?.offsetLeft ?? 0;
  }, []);

  const jumpToIndex = useCallback(
    (index: number) => {
      const viewport = viewportRef.current;
      if (!viewport) return;
      viewport.scrollLeft = getOffsetForIndex(index);
      currentIndexRef.current = index;
    },
    [getOffsetForIndex],
  );

  const updateArrows = useCallback(() => {
    const hasMultipleProperties = propertyCount > 1;
    if (!infinite) {
      const viewport = viewportRef.current;
      setCanPrev(hasMultipleProperties && !!viewport && viewport.scrollLeft > 4);
      setCanNext(
        hasMultipleProperties &&
          !!viewport &&
          viewport.scrollLeft < viewport.scrollWidth - viewport.clientWidth - 4,
      );
      return;
    }
    setCanPrev(hasMultipleProperties);
    setCanNext(hasMultipleProperties);
  }, [infinite, propertyCount]);

  const nearestIndex = useCallback(() => {
    const viewport = viewportRef.current;
    const track = trackRef.current;
    if (!viewport || !track || track.children.length === 0) return currentIndexRef.current;

    let closest = 0;
    let closestDistance = Number.POSITIVE_INFINITY;
    Array.from(track.children).forEach((child, index) => {
      const distance = Math.abs((child as HTMLElement).offsetLeft - viewport.scrollLeft);
      if (distance < closestDistance) {
        closest = index;
        closestDistance = distance;
      }
    });
    return closest;
  }, []);

  const normaliseLoopPosition = useCallback(
    (index: number) => {
      if (!infinite || propertyCount < 2) return index;
      if (index < middleStart) {
        const equivalent = middleStart + ((index % propertyCount) + propertyCount) % propertyCount;
        jumpToIndex(equivalent);
        return equivalent;
      }
      if (index >= middleStart + propertyCount) {
        const equivalent = middleStart + (index % propertyCount);
        jumpToIndex(equivalent);
        return equivalent;
      }
      return index;
    },
    [infinite, jumpToIndex, middleStart, propertyCount],
  );

  const animateToIndex = useCallback(
    (requestedIndex: number, onComplete?: () => void) => {
      const viewport = viewportRef.current;
      if (!viewport || trackProperties.length < 2) {
        onComplete?.();
        return;
      }

      let targetIndex = requestedIndex;
      if (!infinite) {
        targetIndex = Math.min(propertyCount - 1, Math.max(0, requestedIndex));
      } else {
        targetIndex = Math.min(trackProperties.length - 1, Math.max(0, requestedIndex));
      }

      stopMotion();
      const start = viewport.scrollLeft;
      const end = getOffsetForIndex(targetIndex);
      const distance = Math.abs(end - start);
      if (distance < 1) {
        currentIndexRef.current = targetIndex;
        const normalised = normaliseLoopPosition(targetIndex);
        currentIndexRef.current = normalised;
        updateArrows();
        onComplete?.();
        return;
      }

      // One card movement has a natural duration. The admin speed multiplier
      // changes only this duration; the autoplay wait remains independent.
      const duration = Math.max(
        260,
        Math.min(2600, (distance / (640 * safeMotionSpeed)) * 1000),
      );
      const startedAt = performance.now();
      isAnimatingRef.current = true;

      const finish = () => {
        motionRef.current = null;
        isAnimatingRef.current = false;
        currentIndexRef.current = targetIndex;
        const normalised = normaliseLoopPosition(targetIndex);
        currentIndexRef.current = normalised;
        updateArrows();
        onComplete?.();
      };

      const tick = (now: number) => {
        const progress = Math.min(1, (now - startedAt) / duration);
        const eased =
          progress < 0.5
            ? 4 * progress * progress * progress
            : 1 - Math.pow(-2 * progress + 2, 3) / 2;
        viewport.scrollLeft = start + (end - start) * eased;

        if (progress < 1) {
          motionRef.current = requestAnimationFrame(tick);
        } else {
          finish();
        }
      };

      motionRef.current = requestAnimationFrame(tick);
    },
    [
      getOffsetForIndex,
      infinite,
      normaliseLoopPosition,
      propertyCount,
      safeMotionSpeed,
      stopMotion,
      trackProperties.length,
      updateArrows,
    ],
  );

  const scheduleAutoPlay = useCallback(() => {
    stopAutoPlay();
    if (
      !autoPlayEnabledRef.current ||
      pausedRef.current ||
      propertyCount < 2
    ) {
      return;
    }

    autoPlayTimerRef.current = window.setTimeout(() => {
      if (pausedRef.current || !autoPlayEnabledRef.current) return;
      const nextIndex = currentIndexRef.current + 1;
      animateToIndex(nextIndex, scheduleAutoPlay);
    }, Math.max(250, autoPlayDelay));
  }, [animateToIndex, autoPlayDelay, propertyCount, stopAutoPlay]);

  const scroll = useCallback(
    (direction: "prev" | "next") => {
      if (propertyCount < 2) return;
      stopAutoPlay();
      stopMotion();

      let current = currentIndexRef.current;
      if (!isAnimatingRef.current) {
        current = nearestIndex();
      }

      if (infinite) {
        if (current < middleStart || current >= middleStart + propertyCount) {
          current = normaliseLoopPosition(current);
        }
      }

      const nextIndex = current + (direction === "next" ? 1 : -1);
      animateToIndex(nextIndex, () => {
        if (!pausedRef.current && autoPlayEnabledRef.current) {
          scheduleAutoPlay();
        }
      });
    },
    [
      animateToIndex,
      infinite,
      middleStart,
      nearestIndex,
      normaliseLoopPosition,
      propertyCount,
      scheduleAutoPlay,
      stopAutoPlay,
      stopMotion,
    ],
  );

  const pauseForInteraction = useCallback(() => {
    pausedRef.current = true;
    stopAutoPlay();
    stopMotion();
    if (resumeTimerRef.current !== null) {
      window.clearTimeout(resumeTimerRef.current);
      resumeTimerRef.current = null;
    }
  }, [stopAutoPlay, stopMotion]);

  const resumeAfterInteraction = useCallback(
    (delay = 1000) => {
      pausedRef.current = false;
      if (!autoPlayEnabledRef.current) return;
      if (resumeTimerRef.current !== null) {
        window.clearTimeout(resumeTimerRef.current);
      }
      resumeTimerRef.current = window.setTimeout(() => {
        resumeTimerRef.current = null;
        scheduleAutoPlay();
      }, delay);
    },
    [scheduleAutoPlay],
  );

  useEffect(() => {
    const viewport = viewportRef.current;
    if (!viewport || propertyCount === 0) return;

    const frame = requestAnimationFrame(() => {
      jumpToIndex(infinite ? middleStart : 0);
      updateArrows();
    });

    return () => cancelAnimationFrame(frame);
  }, [infinite, jumpToIndex, middleStart, propertyCount, updateArrows]);

  useEffect(() => {
    const viewport = viewportRef.current;
    if (!viewport) return;

    const onScroll = () => {
      updateArrows();
      if (!isAnimatingRef.current) {
        currentIndexRef.current = nearestIndex();
      }
    };

    viewport.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", updateArrows, { passive: true });
    return () => {
      viewport.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", updateArrows);
    };
  }, [nearestIndex, updateArrows]);

  useEffect(() => {
    pausedRef.current = false;
    scheduleAutoPlay();
    return () => {
      stopAutoPlay();
      stopMotion();
      if (resumeTimerRef.current !== null) {
        window.clearTimeout(resumeTimerRef.current);
        resumeTimerRef.current = null;
      }
    };
  }, [scheduleAutoPlay, stopAutoPlay, stopMotion]);

  useEffect(() => {
    return () => stopMotion();
  }, [stopMotion]);

  if (properties.length === 0) return null;

  return (
    <div
      className={cn("relative", className)}
      onMouseEnter={pauseForInteraction}
      onMouseLeave={() => resumeAfterInteraction(1000)}
      onTouchStart={pauseForInteraction}
      onTouchEnd={() => resumeAfterInteraction(5000)}
    >
      {canPrev && (
        <button
          onClick={() => scroll("prev")}
          aria-label="السابق"
          className="absolute right-2 top-1/2 -translate-y-1/2 z-10 flex w-8 h-8 md:w-9 md:h-9 rounded-full
            bg-black/25 dark:bg-black/30 backdrop-blur-md border border-white/20
            items-center justify-center text-white/80
            hover:text-white hover:bg-black/45 hover:border-white/35
            transition-all duration-200 shadow-sm"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      )}

      <div
        ref={viewportRef}
        dir="ltr"
        className="overflow-x-auto pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        style={{ scrollSnapType: "x mandatory", scrollBehavior: "auto" }}
      >
        <div ref={trackRef} className="flex gap-4 w-max">
          {trackProperties.map((property, index) => (
            <div
              key={`${property.id}-${index}`}
              className="flex-shrink-0 w-[88vw] sm:w-[54vw] md:w-[380px] lg:w-[400px]"
              style={{ scrollSnapAlign: "start" }}
            >
              <PropertyCard property={property} size={size} />
            </div>
          ))}
        </div>
      </div>

      {canNext && (
        <button
          onClick={() => scroll("next")}
          aria-label="التالي"
          className="absolute left-2 top-1/2 -translate-y-1/2 z-10 flex w-8 h-8 md:w-9 md:h-9 rounded-full
            bg-black/25 dark:bg-black/30 backdrop-blur-md border border-white/20
            items-center justify-center text-white/80
            hover:text-white hover:bg-black/45 hover:border-white/35
            transition-all duration-200 shadow-sm"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}