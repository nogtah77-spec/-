import { useRef, useState, useEffect, useCallback } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { PropertyCard, type CardSize } from "./PropertyCard";
import { cn } from "@/lib/utils";

interface PropertyCarouselProps {
  properties: any[];
  size?: CardSize;
  className?: string;
  autoPlay?: boolean;
  autoPlayDelay?: number;
  infinite?: boolean;
  randomStart?: boolean;
}

export function PropertyCarousel({
  properties,
  size = "compact",
  className,
  autoPlay = false,
  autoPlayDelay = 3500,
  infinite = false,
  randomStart = false,
}: PropertyCarouselProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canPrev, setCanPrev] = useState(false);
  const [canNext, setCanNext] = useState(false);
  const autoPlayRef = useRef<number | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const isAnimatingRef = useRef(false);
  const loopWidthRef = useRef(0);

  const updateArrows = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;

    if (infinite) {
      const hasMultipleCards = properties.length > 1;
      setCanPrev(hasMultipleCards);
      setCanNext(hasMultipleCards);
      return;
    }

    setCanPrev(el.scrollLeft > 4);
    setCanNext(el.scrollLeft < el.scrollWidth - el.clientWidth - 4);
  }, [infinite, properties.length]);

  const updateLoopWidth = useCallback(() => {
    const el = scrollRef.current;
    if (!el || !infinite) return;

    const secondCopy = el.querySelector<HTMLElement>(
      '[data-carousel-copy="1"]',
    );
    if (secondCopy) loopWidthRef.current = secondCopy.offsetLeft;
  }, [infinite]);

  const normalizeLoopPosition = useCallback(() => {
    const el = scrollRef.current;
    const loopWidth = loopWidthRef.current;
    if (!el || !infinite || !loopWidth) return;

    // The three copies are visually identical. Move between copies only
    // after an animation has finished, so the user never sees a jump.
    if (el.scrollLeft >= loopWidth * 2) {
      el.scrollLeft -= loopWidth;
    } else if (el.scrollLeft < loopWidth) {
      el.scrollLeft += loopWidth;
    }
  }, [infinite]);

  const cancelAnimation = useCallback(() => {
    if (animationFrameRef.current !== null) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    isAnimatingRef.current = false;
  }, []);

  const smoothScrollTo = useCallback(
    (target: number, duration = 1300) => {
      const el = scrollRef.current;
      if (!el) return;

      cancelAnimation();
      const start = el.scrollLeft;
      const distance = target - start;
      const startedAt = performance.now();
      const easeInOut = (value: number) =>
        value < 0.5
          ? 2 * value * value
          : 1 - Math.pow(-2 * value + 2, 2) / 2;

      isAnimatingRef.current = true;
      const frame = (now: number) => {
        const progress = Math.min(1, (now - startedAt) / duration);
        el.scrollLeft = start + distance * easeInOut(progress);

        if (progress < 1) {
          animationFrameRef.current = requestAnimationFrame(frame);
        } else {
          animationFrameRef.current = null;
          isAnimatingRef.current = false;
          normalizeLoopPosition();
          updateArrows();
        }
      };

      animationFrameRef.current = requestAnimationFrame(frame);
    },
    [cancelAnimation, normalizeLoopPosition, updateArrows],
  );

  const scrollNext = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;

    const amount = el.clientWidth * 0.78;
    if (!infinite && el.scrollLeft + el.clientWidth >= el.scrollWidth - 8) {
      return;
    }

    smoothScrollTo(el.scrollLeft + amount);
  }, [infinite, smoothScrollTo]);

  const stopAutoPlay = useCallback(() => {
    if (autoPlayRef.current !== null) {
      clearInterval(autoPlayRef.current);
      autoPlayRef.current = null;
    }
    cancelAnimation();
  }, [cancelAnimation]);

  const startAutoPlay = useCallback(() => {
    if (!autoPlay) return;

    stopAutoPlay();
    autoPlayRef.current = window.setInterval(scrollNext, autoPlayDelay);
  }, [autoPlay, autoPlayDelay, scrollNext, stopAutoPlay]);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    const timer = window.setTimeout(() => {
      updateLoopWidth();
      if (infinite && loopWidthRef.current) {
        el.scrollLeft = loopWidthRef.current;
      }
      updateArrows();
    }, 120);

    const onScroll = () => {
      if (infinite && !isAnimatingRef.current) normalizeLoopPosition();
      updateArrows();
    };

    el.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", updateArrows, { passive: true });

    return () => {
      clearTimeout(timer);
      el.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", updateArrows);
    };
  }, [
    infinite,
    normalizeLoopPosition,
    properties.length,
    updateArrows,
    updateLoopWidth,
  ]);

  useEffect(() => {
    if (!autoPlay) return;
    startAutoPlay();
    return stopAutoPlay;
  }, [autoPlay, startAutoPlay, stopAutoPlay]);

  useEffect(() => {
    if (!randomStart) return;

    const el = scrollRef.current;
    if (!el) return;

    const timer = window.setTimeout(() => {
      updateLoopWidth();
      const loopWidth = loopWidthRef.current;
      const maxScroll = infinite
        ? Math.max(0, loopWidth - el.clientWidth)
        : Math.max(0, el.scrollWidth - el.clientWidth);
      const random = Math.random() * maxScroll;
      el.scrollLeft = infinite ? loopWidth + random : random;
      updateArrows();
    }, 300);

    return () => clearTimeout(timer);
  }, [
    infinite,
    properties.length,
    randomStart,
    updateArrows,
    updateLoopWidth,
  ]);

  useEffect(() => () => cancelAnimation(), [cancelAnimation]);

  const scroll = (dir: "prev" | "next") => {
    const el = scrollRef.current;
    if (!el) return;

    stopAutoPlay();
    const amount = el.clientWidth * 0.78;
    smoothScrollTo(el.scrollLeft + (dir === "next" ? amount : -amount));
  };

  if (properties.length === 0) return null;

  const copies = infinite ? [0, 1, 2] : [0];

  return (
    <div
      className={cn("relative", className)}
      onMouseEnter={stopAutoPlay}
      onTouchStart={stopAutoPlay}
      onMouseLeave={startAutoPlay}
      onTouchEnd={() => {
        if (!autoPlay) return;
        stopAutoPlay();
        window.setTimeout(startAutoPlay, 5000);
      }}
    >
      {canPrev && (
        <button
          onClick={() => {
            scroll("prev");
            window.setTimeout(startAutoPlay, 5000);
          }}
          aria-label="السابق"
          className="absolute right-2 top-1/2 -translate-y-1/2 z-10 flex w-8 h-8 md:w-9 md:h-9 rounded-full
            bg-black/25 dark:bg-black/30 backdrop-blur-md border border-white/20
            items-center justify-center text-white/80 hover:text-white hover:bg-black/45
            hover:border-white/35 transition-all duration-200 shadow-sm"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      )}

      <div
        ref={scrollRef}
        dir="ltr"
        className="flex gap-4 overflow-x-auto pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        style={{ scrollSnapType: "x mandatory" }}
      >
        {copies.flatMap((copy) =>
          properties.map((p) => (
            <div
              key={`${copy}-${p.id}`}
              className="flex-shrink-0 w-[88vw] sm:w-[54vw] md:w-[380px] lg:w-[400px]"
              style={{ scrollSnapAlign: "start" }}
              data-carousel-copy={copy}
            >
              <PropertyCard property={p} size={size} />
            </div>
          )),
        )}
      </div>

      {canNext && (
        <button
          onClick={() => {
            scroll("next");
            window.setTimeout(startAutoPlay, 5000);
          }}
          aria-label="التالي"
          className="absolute left-2 top-1/2 -translate-y-1/2 z-10 flex w-8 h-8 md:w-9 md:h-9 rounded-full
            bg-black/25 dark:bg-black/30 backdrop-blur-md border border-white/20
            items-center justify-center text-white/80 hover:text-white hover:bg-black/45
            hover:border-white/35 transition-all duration-200 shadow-sm"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}