import { useState, useRef, useCallback } from "react";
import { ChevronRight, ChevronLeft } from "lucide-react";
import { cn } from "@/lib/utils";

interface PropertyGalleryProps {
  images: string[];
  title?: string;
  onClickImage?: (index: number) => void;
  className?: string;
}

export function PropertyGallery({ images, title, onClickImage, className }: PropertyGalleryProps) {
  const [current, setCurrent] = useState(0);
  const dragRef = useRef<{ startX: number; startY: number; dragging: boolean; moved: boolean }>({
    startX: 0, startY: 0, dragging: false, moved: false,
  });

  const prev = useCallback(() => setCurrent(i => (i - 1 + images.length) % images.length), [images.length]);
  const next = useCallback(() => setCurrent(i => (i + 1) % images.length), [images.length]);

  const DRAG_THRESHOLD = 35;
  const AXIS_LOCK = 10;

  const onPointerDown = (e: React.PointerEvent) => {
    dragRef.current = { startX: e.clientX, startY: e.clientY, dragging: true, moved: false };
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  };

  const onPointerMove = (e: React.PointerEvent) => {
    if (!dragRef.current.dragging) return;
    const dx = Math.abs(e.clientX - dragRef.current.startX);
    const dy = Math.abs(e.clientY - dragRef.current.startY);
    if (dx > AXIS_LOCK || dy > AXIS_LOCK) dragRef.current.moved = true;
  };

  const onPointerUp = (e: React.PointerEvent) => {
    if (!dragRef.current.dragging) return;
    dragRef.current.dragging = false;
    const dx = e.clientX - dragRef.current.startX;
    const dy = e.clientY - dragRef.current.startY;
    if (Math.abs(dx) >= DRAG_THRESHOLD && Math.abs(dx) > Math.abs(dy)) {
      if (dx > 0) prev();
      else next();
    }
  };

  const handleClick = () => {
    if (!dragRef.current.moved) onClickImage?.(current);
  };

  if (images.length === 0) return null;

  const showNav = images.length > 1;

  return (
    <div className={cn("rounded-2xl overflow-hidden bg-muted select-none", className)}>
      {/* Main row: [prev] [image] [next] */}
      <div className="flex items-stretch">
        {/* Prev arrow (RTL: right side = previous) */}
        {showNav ? (
          <button
            onClick={prev}
            className="w-10 flex-shrink-0 flex items-center justify-center bg-black/10 hover:bg-black/20 active:bg-black/30 transition-colors z-10"
            aria-label="الصورة السابقة"
          >
            <ChevronRight className="h-6 w-6 text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]" />
          </button>
        ) : (
          <div className="w-0" />
        )}

        {/* Image area */}
        <div
          className="flex-1 relative h-[280px] sm:h-[400px] cursor-pointer touch-pan-y overflow-hidden"
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onClick={handleClick}
          draggable={false}
        >
          {/* Blurred background fill */}
          <img
            src={images[current]}
            aria-hidden
            draggable={false}
            className="absolute inset-0 w-full h-full object-cover scale-110 blur-2xl opacity-40 pointer-events-none"
          />
          {/* Main image — object-contain, never clipped */}
          <img
            src={images[current]}
            alt={title}
            draggable={false}
            className="relative w-full h-full object-contain pointer-events-none"
          />

          {/* Dots (bottom of image) */}
          {showNav && (
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5 pointer-events-none">
              {images.length <= 12 && images.map((_, i) => (
                <span
                  key={i}
                  className={cn(
                    "block rounded-full transition-all duration-200",
                    i === current
                      ? "w-4 h-1.5 bg-white shadow"
                      : "w-1.5 h-1.5 bg-white/50"
                  )}
                />
              ))}
              {images.length > 12 && (
                <span className="bg-black/50 backdrop-blur-sm text-white text-xs font-medium px-2.5 py-0.5 rounded-full">
                  {current + 1} / {images.length}
                </span>
              )}
            </div>
          )}
        </div>

        {/* Next arrow (RTL: left side = next) */}
        {showNav ? (
          <button
            onClick={next}
            className="w-10 flex-shrink-0 flex items-center justify-center bg-black/10 hover:bg-black/20 active:bg-black/30 transition-colors z-10"
            aria-label="الصورة التالية"
          >
            <ChevronLeft className="h-6 w-6 text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]" />
          </button>
        ) : (
          <div className="w-0" />
        )}
      </div>

      {/* Thumbnail strip */}
      {showNav && (
        <div className="flex gap-1.5 p-2 bg-black/25 backdrop-blur-sm overflow-x-auto scrollbar-none">
          {/* counter chip */}
          <div className="flex-shrink-0 flex items-center px-2 text-white/70 text-xs font-medium">
            {current + 1}/{images.length}
          </div>
          {images.map((img, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              className={cn(
                "flex-shrink-0 h-14 w-20 rounded overflow-hidden border-2 transition-all",
                i === current ? "border-white opacity-100 scale-105" : "border-transparent opacity-55 hover:opacity-85"
              )}
            >
              <img src={img} alt="" className="w-full h-full object-cover" draggable={false} />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
