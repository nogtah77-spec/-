import { useRef, useState, useEffect, useCallback } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { PropertyCard, type CardSize } from "./PropertyCard";
import { cn } from "@/lib/utils";

interface PropertyCarouselProps {
  properties: any[];
  size?: CardSize;
  className?: string;
}

export function PropertyCarousel({ properties, size = "medium", className }: PropertyCarouselProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canPrev, setCanPrev] = useState(false);
  const [canNext, setCanNext] = useState(false);

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

  const scroll = (dir: "prev" | "next") => {
    const el = scrollRef.current;
    if (!el) return;
    // Scroll roughly one "page" worth of cards
    const amount = el.clientWidth * 0.78;
    el.scrollBy({ left: dir === "next" ? amount : -amount, behavior: "smooth" });
  };

  if (properties.length === 0) return null;

  return (
    <div className={cn("relative", className)}>
      {/* Previous arrow — on desktop only, appears when not at start */}
      {canPrev && (
        <button
          onClick={() => scroll("prev")}
          aria-label="السابق"
          className="absolute -right-3 top-1/2 -translate-y-1/2 z-10 hidden md:flex w-8 h-8 rounded-full
            bg-background border border-border shadow-md
            items-center justify-center text-muted-foreground
            hover:text-accent hover:border-accent/40 transition-all duration-150"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      )}

      {/* Scrollable strip — dir=ltr so scrollLeft is predictable across browsers */}
      <div
        ref={scrollRef}
        dir="ltr"
        className="flex gap-4 overflow-x-auto scroll-smooth pb-2
          [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        style={{ scrollSnapType: "x mandatory" }}
      >
        {properties.map(p => (
          <div
            key={p.id}
            className="flex-shrink-0 w-[82vw] sm:w-[46vw] md:w-[268px] lg:w-[280px]"
            style={{ scrollSnapAlign: "start" }}
          >
            <PropertyCard property={p} size={size} />
          </div>
        ))}
      </div>

      {/* Next arrow — on desktop only, appears when not at end */}
      {canNext && (
        <button
          onClick={() => scroll("next")}
          aria-label="التالي"
          className="absolute -left-3 top-1/2 -translate-y-1/2 z-10 hidden md:flex w-8 h-8 rounded-full
            bg-background border border-border shadow-md
            items-center justify-center text-muted-foreground
            hover:text-accent hover:border-accent/40 transition-all duration-150"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}
