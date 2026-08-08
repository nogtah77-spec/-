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
  /** Movement multiplier: 1 is the natural speed, 4 is four times faster. */
  motionSpeed?: number;
  infinite?: boolean;
  randomStart?: boolean;
}

export function PropertyCarousel({
  properties,
  size = "compact",
  className,

  autoPlay = false,
  autoPlayDelay = 3500,
  motionSpeed = 1,
  infinite = false,
  randomStart = false,
}: PropertyCarouselProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canPrev, setCanPrev] = useState(false);
  const [canNext, setCanNext] = useState(false);
  const autoPlayRef = useRef<number | null>(null);
  const motionRef = useRef<number | null>(null);
  const safeMotionSpeed = Math.min(4, Math.max(0.25, Number(motionSpeed) || 1));

  const stopMotion = useCallback(() => {
    if (motionRef.current !== null) {
      cancelAnimationFrame(motionRef.current);
      motionRef.current = null;
    }
  }, []);

  const animateScrollTo = useCallback(
    (target: number) => {
      const el = scrollRef.current;
      if (!el) return;

      stopMotion();
      const start = el.scrollLeft;
      const maxScroll = Math.max(0, el.scrollWidth - el.clientWidth);
      const end = Math.min(maxScroll, Math.max(0, target));
      const distance = Math.abs(end - start);
      if (distance < 1) return;

      // A fixed base velocity makes the setting a real speed control rather
      // than another delay setting. The duration also scales with card distance.
      const duration = Math.max(120, Math.min(2200, (distance / (700 * safeMotionSpeed)) * 1000));
      const startedAt = performance.now();
      const tick = (now: number) => {
        const progress = Math.min(1, (now - startedAt) / duration);
        const eased = progress < 0.5
          ? 2 * progress * progress
          : 1 - Math.pow(-2 * progress + 2, 2) / 2;
        el.scrollLeft = start + (end - start) * eased;
        if (progress < 1) {
          motionRef.current = requestAnimationFrame(tick);
        } else {
          motionRef.current = null;
          updateArrows();
        }
      };
      motionRef.current = requestAnimationFrame(tick);
    },
    [safeMotionSpeed, stopMotion],
  );

  const scrollNext = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;

    const amount = el.clientWidth * 0.78;

    if (el.scrollLeft + el.clientWidth >= el.scrollWidth - 8) {
      if (infinite) {
        animateScrollTo(0);
      }
      return;
    }

    animateScrollTo(el.scrollLeft + amount);
  }, [animateScrollTo, infinite]);

  const stopAutoPlay = () => {
    if (autoPlayRef.current) {
      clearInterval(autoPlayRef.current);
      autoPlayRef.current = null;
    }
  };

  const startAutoPlay = () => {
    if (!autoPlay) return;

    stopAutoPlay();

    autoPlayRef.current = window.setInterval(() => {
      scrollNext();
    }, autoPlayDelay);
  };
  const updateArrows = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    setCanPrev(el.scrollLeft > 4);
    setCanNext(el.scrollLeft < el.scrollWidth - el.clientWidth - 4);
  }, []);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    // Delay slightly so layout is settled
    const timer = setTimeout(updateArrows, 120);
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

    return () => {
      stopAutoPlay();
    };
  }, [autoPlay, autoPlayDelay, scrollNext]);
  useEffect(() => () => stopMotion(), [stopMotion]);
  useEffect(() => {
    if (!randomStart) return;

    const el = scrollRef.current;
    if (!el) return;

    setTimeout(() => {
      const maxScroll = Math.max(0, el.scrollWidth - el.clientWidth);
      console.log("maxScroll =", maxScroll);

      const random = Math.random() * maxScroll;

      el.scrollTo({
        left: random,
        behavior: "auto",
      });

      updateArrows();
    }, 300);
  }, [randomStart, properties.length, updateArrows]);

  const scroll = (dir: "prev" | "next") => {
    const el = scrollRef.current;
    if (!el) return;

    stopAutoPlay();
    stopMotion();

    // Scroll roughly one "page" worth of cards
    const amount = el.clientWidth * 0.78;
    animateScrollTo(el.scrollLeft + (dir === "next" ? amount : -amount));
  };

  if (properties.length === 0) return null;

  return (
    <div
      className={cn("relative", className)}
      onMouseEnter={() => {
        stopAutoPlay();
        stopMotion();
      }}
      onTouchStart={() => {
        stopAutoPlay();
        stopMotion();
      }}
      onMouseLeave={() => {
        if (!autoPlay) return;

        startAutoPlay();
      }}
      onTouchEnd={() => {
        if (!autoPlay) return;

        stopAutoPlay();

        window.setTimeout(() => {
          startAutoPlay();
        }, 5000);
      }}
    >
      {/* Previous arrow — always visible when not at start */}
      {canPrev && (
        <button
          onClick={() => {
            stopAutoPlay();
            autoPlayRef.current = null;
            scroll("prev");

            window.setTimeout(() => {
              startAutoPlay();
            }, 5000);
          }}
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

      {/* Scrollable strip — dir=ltr so scrollLeft is predictable across browsers */}
      <div
        ref={scrollRef}
        dir="ltr"
        className="flex gap-4 overflow-x-auto pb-2
          [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        style={{ scrollSnapType: "x mandatory", scrollBehavior: "auto" }}
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

      {/* Next arrow — always visible when not at end */}
      {canNext && (
        <button
          onClick={() => {
            stopAutoPlay();
            autoPlayRef.current = null;
            scroll("next");

            window.setTimeout(() => {
              startAutoPlay();
            }, 5000);
          }}
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