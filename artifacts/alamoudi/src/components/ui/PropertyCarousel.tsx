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
  const animationRef = useRef<number | null>(null);
  const [canPrev, setCanPrev] = useState(false);
  const [canNext, setCanNext] = useState(false);
  const autoPlayRef = useRef<number | null>(null);

  const cancelScrollAnimation = useCallback(() => {
    if (animationRef.current !== null) {
      cancelAnimationFrame(animationRef.current);
      animationRef.current = null;
    }
  }, []);

  const animateScrollTo = useCallback(
    (target: number, duration = 1200) => {
      const el = scrollRef.current;
      if (!el) return;

      cancelScrollAnimation();
      const start = el.scrollLeft;
      const distance = target - start;
      const startedAt = performance.now();
      const easeInOut = (value: number) =>
        value < 0.5
          ? 2 * value * value
          : 1 - Math.pow(-2 * value + 2, 2) / 2;

      const frame = (now: number) => {
        const progress = Math.min(1, (now - startedAt) / duration);
        el.scrollLeft = start + distance * easeInOut(progress);
        if (progress < 1) {
          animationRef.current = requestAnimationFrame(frame);
        } else {
          animationRef.current = null;
        }
      };

      animationRef.current = requestAnimationFrame(frame);
    },
    [cancelScrollAnimation],
  );

  const scrollNext = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;

    const amount = el.clientWidth * 0.78;
    const maxScroll = Math.max(0, el.scrollWidth - el.clientWidth);

    if (el.scrollLeft + el.clientWidth >= el.scrollWidth - 8) {
      if (infinite) {
        // Keep the original track and smoothly glide back to the first card.
        // No duplicated cards or data swapping are used.
        animateScrollTo(0, 1700);
      }
      return;
    }

    animateScrollTo(Math.min(el.scrollLeft + amount, maxScroll), 1200);
  }, [animateScrollTo, infinite]);

  const stopAutoPlay = useCallback(() => {
    if (autoPlayRef.current !== null) {
      clearInterval(autoPlayRef.current);
      autoPlayRef.current = null;
    }
    cancelScrollAnimation();
  }, [cancelScrollAnimation]);

  const startAutoPlay = useCallback(() => {
    if (!autoPlay) return;

    stopAutoPlay();
    autoPlayRef.current = window.setInterval(scrollNext, autoPlayDelay);
  }, [autoPlay, autoPlayDelay, scrollNext, stopAutoPlay]);

  const updateArrows = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    setCanPrev(el.scrollLeft > 4);
    setCanNext(el.scrollLeft < el.scrollWidth - el.clientWidth - 4);
  }, []);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    const timer = window.setTimeout(updateArrows, 120);
    el.addEventListener("scroll", updateArrows, { passive: true });
    window.addEventListener("resize", updateArrows, { passive: true });

    return () => {
      clearTimeout(timer);
      el.removeEventListener("scroll", updateArrows);
      window.removeEventListener("resize", updateArrows);
    };
  }, [updateArrows, properties.length]);

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
      const maxScroll = Math.max(0, el.scrollWidth - el.clientWidth);
      const random = Math.random() * maxScroll;
      el.scrollLeft = random;
      updateArrows();
    }, 300);

    return () => clearTimeout(timer);
  }, [randomStart, properties.length, updateArrows]);

  useEffect(() => () => cancelScrollAnimation(), [cancelScrollAnimation]);

  const scroll = (dir: "prev" | "next") => {
    const el = scrollRef.current;
    if (!el) return;

    stopAutoPlay();
    const amount = el.clientWidth * 0.78;
    const maxScroll = Math.max(0, el.scrollWidth - el.clientWidth);
    const target = Math.max(
      0,
      Math.min(maxScroll, el.scrollLeft + (dir === "next" ? amount : -amount)),
    );
    animateScrollTo(target, 1200);
  };

  if (properties.length === 0) return null;

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
        {properties.map((p) => (
          <div
            key={p.id}
            className="flex-shrink-0 w-[88vw] sm:w-[54vw] md:w-[380px] lg:w-[400px]"
            style={{ scrollSnapAlign: "start" }}
          >
            <PropertyCard property={p} size={size} />
          </div>
        ))}
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