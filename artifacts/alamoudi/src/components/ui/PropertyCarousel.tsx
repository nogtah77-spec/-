import { useRef, useState, useEffect, useCallback } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { PropertyCard, type CardSize } from "./PropertyCard";
import { cn } from "@/lib/utils";

interface PropertyCarouselProps {
  properties: any[];
  size?: CardSize;
  layout?: "grid" | "list";
  emphasized?: boolean;
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
  layout = "grid",
  emphasized = false,
  className,
  autoPlay = false,
  autoPlayDelay = 3500,
  motionSpeed = 1,
  infinite = false,
}: PropertyCarouselProps) {
  const viewportRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const [trackOffset, setTrackOffset] = useState(0);
  const [transitionEnabled, setTransitionEnabled] = useState(false);
  const [transitionDuration, setTransitionDuration] = useState(0);
  const [canPrev, setCanPrev] = useState(false);
  const [canNext, setCanNext] = useState(false);

  const autoPlayTimerRef = useRef<number | null>(null);
  const resumeTimerRef = useRef<number | null>(null);
  const motionTimerRef = useRef<number | null>(null);
  const motionFrameRef = useRef<number | null>(null);
  const currentIndexRef = useRef(0);
  const trackOffsetRef = useRef(0);
  const isAnimatingRef = useRef(false);
  const autoPlayEnabledRef = useRef(autoPlay);
  const pausedRef = useRef(false);
  const safeMotionSpeed = Math.min(4, Math.max(0.25, Number(motionSpeed) || 1));
  const propertyCount = properties.length;
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
    if (motionFrameRef.current !== null) {
      cancelAnimationFrame(motionFrameRef.current);
      motionFrameRef.current = null;
    }
    if (motionTimerRef.current !== null) {
      window.clearTimeout(motionTimerRef.current);
      motionTimerRef.current = null;
    }
    isAnimatingRef.current = false;
    setTransitionEnabled(false);
    setTransitionDuration(0);
  }, []);

  const getOffsetForIndex = useCallback((index: number) => {
    const item = trackRef.current?.children[index] as HTMLElement | undefined;
    return item?.offsetLeft ?? 0;
  }, []);

  const setTrackPosition = useCallback(
    (index: number, animated: boolean) => {
      const nextOffset = getOffsetForIndex(index);
      trackOffsetRef.current = nextOffset;
      currentIndexRef.current = index;
      setTransitionEnabled(animated);
      setTrackOffset(nextOffset);
    },
    [getOffsetForIndex],
  );

  const updateArrows = useCallback(() => {
    const active = propertyCount > 1;
    setCanPrev(active);
    setCanNext(active);
  }, [propertyCount]);

  const normaliseIndex = useCallback(
    (index: number) => {
      if (!infinite || propertyCount < 2) return index;
      if (index < middleStart) {
        return middleStart + ((index % propertyCount) + propertyCount) % propertyCount;
      }
      if (index >= middleStart + propertyCount) {
        return middleStart + (index % propertyCount);
      }
      return index;
    },
    [infinite, middleStart, propertyCount],
  );

  const finishMovement = useCallback(
    (targetIndex: number, onComplete?: () => void) => {
      motionTimerRef.current = null;
      isAnimatingRef.current = false;

      const normalisedIndex = normaliseIndex(targetIndex);
      if (normalisedIndex !== targetIndex) {
        // The third copy is identical to the first copy. Disable the
        // transition for this invisible bookkeeping jump, so the user sees
        // one continuous card-to-card loop instead of a snap.
        const normalisedOffset = getOffsetForIndex(normalisedIndex);
        setTransitionEnabled(false);
        setTransitionDuration(0);
        trackOffsetRef.current = normalisedOffset;
        currentIndexRef.current = normalisedIndex;
        setTrackOffset(normalisedOffset);
      } else {
        currentIndexRef.current = targetIndex;
      }

      updateArrows();
      onComplete?.();
    },
    [getOffsetForIndex, normaliseIndex, updateArrows],
  );

  const animateToIndex = useCallback(
    (requestedIndex: number, onComplete?: () => void) => {
      if (trackProperties.length < 2 || !trackRef.current) {
        onComplete?.();
        return;
      }

      const targetIndex = infinite
        ? Math.min(trackProperties.length - 1, Math.max(0, requestedIndex))
        : Math.min(propertyCount - 1, Math.max(0, requestedIndex));
      const startOffset = trackOffsetRef.current;
      const targetOffset = getOffsetForIndex(targetIndex);
      const distance = Math.abs(targetOffset - startOffset);

      if (distance < 1) {
        finishMovement(targetIndex, onComplete);
        return;
      }

      if (motionTimerRef.current !== null) {
        window.clearTimeout(motionTimerRef.current);
      }

      // This duration controls the visible slide only. It never changes the
      // independent waiting time before the next automatic movement.
      const duration = Math.max(
        260,
        Math.min(2600, (distance / (640 * safeMotionSpeed)) * 1000),
      );

      isAnimatingRef.current = true;
      setTransitionDuration(duration);
      setTransitionEnabled(true);

      // First render the transition property while the track is still at its
      // current position. On the next frame change the transform. If both
      // happen in one render, browsers can apply the new transform instantly
      // because the transition did not exist in the previous style snapshot.
      motionFrameRef.current = requestAnimationFrame(() => {
        motionFrameRef.current = null;
        if (!isAnimatingRef.current) return;
        trackOffsetRef.current = targetOffset;
        setTrackOffset(targetOffset);
        motionTimerRef.current = window.setTimeout(
          () => finishMovement(targetIndex, onComplete),
          duration + 45,
        );
      });
    },
    [
      finishMovement,
      getOffsetForIndex,
      infinite,
      propertyCount,
      safeMotionSpeed,
      trackProperties.length,
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
      animateToIndex(currentIndexRef.current + 1, scheduleAutoPlay);
    }, Math.max(250, autoPlayDelay));
  }, [animateToIndex, autoPlayDelay, propertyCount, stopAutoPlay]);

  const scroll = useCallback(
    (direction: "prev" | "next") => {
      if (propertyCount < 2 || isAnimatingRef.current) return;
      stopAutoPlay();

      let currentIndex = currentIndexRef.current;
      if (infinite) {
        currentIndex = normaliseIndex(currentIndex);
      }

      animateToIndex(
        currentIndex + (direction === "next" ? 1 : -1),
        () => {
          if (!pausedRef.current && autoPlayEnabledRef.current) {
            scheduleAutoPlay();
          }
        },
      );
    },
    [
      animateToIndex,
      infinite,
      normaliseIndex,
      propertyCount,
      scheduleAutoPlay,
      stopAutoPlay,
    ],
  );

  const pauseForInteraction = useCallback(() => {
    pausedRef.current = true;
    // Keep an already-started visual movement running to completion. Only
    // the next automatic movement is paused, matching the original behavior.
    stopAutoPlay();
    if (resumeTimerRef.current !== null) {
      window.clearTimeout(resumeTimerRef.current);
      resumeTimerRef.current = null;
    }
  }, [stopAutoPlay]);

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
    if (propertyCount === 0) return;
    const frame = requestAnimationFrame(() => {
      setTrackPosition(infinite ? middleStart : 0, false);
      updateArrows();
    });
    return () => cancelAnimationFrame(frame);
  }, [
    infinite,
    middleStart,
    propertyCount,
    setTrackPosition,
    updateArrows,
  ]);

  useEffect(() => {
    const frame = requestAnimationFrame(() => scheduleAutoPlay());
    return () => {
      cancelAnimationFrame(frame);
      stopAutoPlay();
      if (motionTimerRef.current !== null) {
        window.clearTimeout(motionTimerRef.current);
        motionTimerRef.current = null;
      }
      if (motionFrameRef.current !== null) {
        cancelAnimationFrame(motionFrameRef.current);
        motionFrameRef.current = null;
      }
      if (resumeTimerRef.current !== null) {
        window.clearTimeout(resumeTimerRef.current);
        resumeTimerRef.current = null;
      }
    };
  }, [scheduleAutoPlay, stopAutoPlay]);

  useEffect(() => {
    const onResize = () => {
      const index = normaliseIndex(currentIndexRef.current);
      const offset = getOffsetForIndex(index);
      trackOffsetRef.current = offset;
      setTransitionEnabled(false);
      setTransitionDuration(0);
      setTrackOffset(offset);
    };
    window.addEventListener("resize", onResize, { passive: true });
    return () => window.removeEventListener("resize", onResize);
  }, [getOffsetForIndex, normaliseIndex]);

  useEffect(() => {
    return () => stopMotion();
  }, [stopMotion]);

  if (properties.length === 0) return null;

  return (
    <div
      className={cn("relative overflow-visible", className)}
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
        className="overflow-hidden pb-3 pt-3"
        style={{ touchAction: "pan-y" }}
      >
        <div
          ref={trackRef}
          className="flex gap-2 sm:gap-3 w-max"
          style={{
            transform: `translate3d(${-trackOffset}px, 0, 0)`,
            transition: transitionEnabled
              ? `transform ${transitionDuration}ms cubic-bezier(0.22, 1, 0.36, 1)`
              : "none",
            willChange: "transform",
          }}
        >
          {trackProperties.map((property, index) => (
            <div
              key={`${property.id}-${index}`}
              className="flex-shrink-0 w-[100vw] sm:w-[64vw] md:w-[450px] lg:w-[450px]"
            >
              <PropertyCard property={property} size={size} layout={layout} emphasized={emphasized} />
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