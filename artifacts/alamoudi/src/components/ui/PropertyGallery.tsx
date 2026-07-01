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
  const dragRef = useRef<{ startX: number; dragging: boolean; moved: boolean }>({ startX: 0, dragging: false, moved: false });

  const prev = useCallback(() => setCurrent(i => (i - 1 + images.length) % images.length), [images.length]);
  const next = useCallback(() => setCurrent(i => (i + 1) % images.length), [images.length]);

  const DRAG_THRESHOLD = 40;

  const onPointerDown = (e: React.PointerEvent) => {
    dragRef.current = { startX: e.clientX, dragging: true, moved: false };
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  };

  const onPointerMove = (e: React.PointerEvent) => {
    if (!dragRef.current.dragging) return;
    const dx = e.clientX - dragRef.current.startX;
    if (Math.abs(dx) > 8) dragRef.current.moved = true;
  };

  const onPointerUp = (e: React.PointerEvent) => {
    if (!dragRef.current.dragging) return;
    dragRef.current.dragging = false;
    const dx = e.clientX - dragRef.current.startX;
    if (Math.abs(dx) >= DRAG_THRESHOLD) {
      // RTL: swipe right (positive dx) = go to previous; swipe left (negative dx) = go to next
      if (dx > 0) prev();
      else next();
    }
  };

  const handleClick = () => {
    if (!dragRef.current.moved) onClickImage?.(current);
  };

  if (images.length === 0) return null;

  return (
    <div className={cn("relative rounded-2xl overflow-hidden bg-muted select-none", className)}>
      {/* Main image */}
      <div
        className="relative h-[300px] sm:h-[400px] cursor-pointer touch-pan-y"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onClick={handleClick}
        draggable={false}
      >
        {/* Blurred background */}
        <img
          src={images[current]}
          aria-hidden
          draggable={false}
          className="absolute inset-0 w-full h-full object-cover scale-110 blur-2xl opacity-40 pointer-events-none"
        />
        {/* Main image */}
        <img
          src={images[current]}
          alt={title}
          draggable={false}
          className="relative w-full h-full object-contain pointer-events-none"
        />
      </div>

      {/* Navigation arrows */}
      {images.length > 1 && (
        <>
          {/* RTL: right arrow = go to previous image (earlier) */}
          <button
            onClick={(e) => { e.stopPropagation(); prev(); }}
            className="absolute right-3 top-1/2 -translate-y-1/2 z-10 h-9 w-9 rounded-full bg-white/90 hover:bg-white shadow-lg flex items-center justify-center transition-all hover:scale-110 active:scale-95"
            aria-label="الصورة السابقة"
          >
            <ChevronRight className="h-5 w-5 text-gray-700" />
          </button>
          {/* RTL: left arrow = go to next image (later) */}
          <button
            onClick={(e) => { e.stopPropagation(); next(); }}
            className="absolute left-3 top-1/2 -translate-y-1/2 z-10 h-9 w-9 rounded-full bg-white/90 hover:bg-white shadow-lg flex items-center justify-center transition-all hover:scale-110 active:scale-95"
            aria-label="الصورة التالية"
          >
            <ChevronLeft className="h-5 w-5 text-gray-700" />
          </button>

          {/* Counter */}
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 bg-black/55 backdrop-blur-sm text-white text-xs font-medium px-3 py-1 rounded-full pointer-events-none">
            {current + 1} / {images.length}
          </div>

          {/* Dot indicators */}
          <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex gap-1.5 pointer-events-none">
            {images.map((_, i) => (
              <span
                key={i}
                className={cn(
                  "block rounded-full transition-all duration-200",
                  i === current
                    ? "w-4 h-1.5 bg-white"
                    : "w-1.5 h-1.5 bg-white/50"
                )}
              />
            ))}
          </div>
        </>
      )}

      {/* Thumbnail strip — shown when 2+ images */}
      {images.length > 1 && (
        <div className="flex gap-1.5 p-2 bg-black/20 backdrop-blur-sm overflow-x-auto scrollbar-none">
          {images.map((img, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              className={cn(
                "flex-shrink-0 h-14 w-20 rounded overflow-hidden border-2 transition-all",
                i === current ? "border-white opacity-100" : "border-transparent opacity-60 hover:opacity-90"
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
