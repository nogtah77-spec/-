import { useState, useRef, useEffect, useCallback } from "react";
import { X, ChevronRight, ChevronLeft } from "lucide-react";
import { cn } from "@/lib/utils";

interface ZoomableLightboxProps {
  images: string[];
  currentIndex: number | null;
  onClose: () => void;
  onChangeIndex: (index: number) => void;
}

export function ZoomableLightbox({
  images,
  currentIndex,
  onClose,
  onChangeIndex,
}: ZoomableLightboxProps) {
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isInteracting, setIsInteracting] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const touchState = useRef<{
    initialDistance: number;
    initialScale: number;
    startX: number;
    startY: number;
    initialPosX: number;
    initialPosY: number;
    lastTapTime: number;
    isTwoFingers: boolean;
    moved: boolean;
  }>({
    initialDistance: 0,
    initialScale: 1,
    startX: 0,
    startY: 0,
    initialPosX: 0,
    initialPosY: 0,
    lastTapTime: 0,
    isTwoFingers: false,
    moved: false,
  });

  const resetZoom = useCallback(() => {
    setScale(1);
    setPosition({ x: 0, y: 0 });
  }, []);

  // Reset zoom when index changes or closes
  useEffect(() => {
    resetZoom();
  }, [currentIndex, resetZoom]);

  const prev = useCallback(() => {
    if (currentIndex === null || images.length <= 1) return;
    resetZoom();
    onChangeIndex((currentIndex - 1 + images.length) % images.length);
  }, [currentIndex, images.length, onChangeIndex, resetZoom]);

  const next = useCallback(() => {
    if (currentIndex === null || images.length <= 1) return;
    resetZoom();
    onChangeIndex((currentIndex + 1) % images.length);
  }, [currentIndex, images.length, onChangeIndex, resetZoom]);

  // Keyboard navigation
  useEffect(() => {
    if (currentIndex === null) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      else if (e.key === "ArrowRight") prev();
      else if (e.key === "ArrowLeft") next();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [currentIndex, onClose, prev, next]);

  if (currentIndex === null || images.length === 0) return null;

  const currentImage = images[currentIndex];

  const handleTouchStart = (e: React.TouchEvent) => {
    setIsInteracting(true);
    const now = Date.now();

    if (e.touches.length === 2) {
      // Pinch-to-zoom start
      const dist = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
      touchState.current.initialDistance = dist;
      touchState.current.initialScale = scale;
      touchState.current.isTwoFingers = true;
      touchState.current.moved = true;
    } else if (e.touches.length === 1) {
      touchState.current.isTwoFingers = false;
      touchState.current.startX = e.touches[0].clientX;
      touchState.current.startY = e.touches[0].clientY;
      touchState.current.initialPosX = position.x;
      touchState.current.initialPosY = position.y;
      touchState.current.moved = false;

      // Double-tap detection
      if (now - touchState.current.lastTapTime < 300) {
        touchState.current.lastTapTime = 0;
        if (scale > 1.05) {
          resetZoom();
        } else {
          // Zoom in to 2.5x
          setScale(2.5);
          const rect = containerRef.current?.getBoundingClientRect();
          if (rect) {
            const tapX = e.touches[0].clientX - rect.left - rect.width / 2;
            const tapY = e.touches[0].clientY - rect.top - rect.height / 2;
            setPosition({ x: -tapX * 1.2, y: -tapY * 1.2 });
          }
        }
      } else {
        touchState.current.lastTapTime = now;
      }
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (e.touches.length === 2 && touchState.current.isTwoFingers) {
      // Pinching
      const dist = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
      if (touchState.current.initialDistance > 0) {
        const factor = dist / touchState.current.initialDistance;
        const newScale = Math.min(4.5, Math.max(1, touchState.current.initialScale * factor));
        setScale(newScale);
        if (newScale <= 1.02) {
          setPosition({ x: 0, y: 0 });
        }
      }
    } else if (e.touches.length === 1 && !touchState.current.isTwoFingers) {
      const dx = e.touches[0].clientX - touchState.current.startX;
      const dy = e.touches[0].clientY - touchState.current.startY;

      if (Math.abs(dx) > 8 || Math.abs(dy) > 8) {
        touchState.current.moved = true;
      }

      if (scale > 1.05) {
        // Panning when zoomed in
        const maxPanX = (window.innerWidth * (scale - 1)) / 2 + 50;
        const maxPanY = (window.innerHeight * (scale - 1)) / 2 + 50;

        const nextX = touchState.current.initialPosX + dx;
        const nextY = touchState.current.initialPosY + dy;

        setPosition({
          x: Math.max(-maxPanX, Math.min(maxPanX, nextX)),
          y: Math.max(-maxPanY, Math.min(maxPanY, nextY)),
        });
      }
    }
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    setIsInteracting(false);

    if (touchState.current.isTwoFingers) {
      if (e.touches.length === 0) {
        touchState.current.isTwoFingers = false;
        if (scale < 1.08) {
          resetZoom();
        }
      }
      return;
    }

    if (e.touches.length === 0) {
      const touch = e.changedTouches[0];
      if (!touch) return;

      const dx = touch.clientX - touchState.current.startX;
      const dy = touch.clientY - touchState.current.startY;

      // When scale === 1 and swiped horizontally
      if (scale <= 1.05 && Math.abs(dx) > 45 && Math.abs(dx) > Math.abs(dy) * 1.4) {
        if (dx > 0) prev(); // Swipe right -> previous in RTL
        else next();       // Swipe left -> next in RTL
      } else if (scale < 1.05) {
        resetZoom();
      }
    }
  };

  // Double click for mouse users
  const handleDoubleClick = (e: React.MouseEvent) => {
    if (scale > 1.05) {
      resetZoom();
    } else {
      setScale(2.5);
      const rect = containerRef.current?.getBoundingClientRect();
      if (rect) {
        const tapX = e.clientX - rect.left - rect.width / 2;
        const tapY = e.clientY - rect.top - rect.height / 2;
        setPosition({ x: -tapX * 1.2, y: -tapY * 1.2 });
      }
    }
  };

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 z-[100] bg-black/95 flex flex-col items-center justify-center select-none touch-none overflow-hidden animate-in fade-in duration-200"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Top bar */}
      <div className="absolute top-4 inset-x-4 z-20 flex items-center justify-between pointer-events-none">
        {/* Close Button on Left */}
        <button
          className="w-11 h-11 rounded-full bg-white/15 hover:bg-white/30 active:bg-white/40 flex items-center justify-center transition-colors backdrop-blur-sm pointer-events-auto cursor-pointer"
          onClick={onClose}
          aria-label="إغلاق"
        >
          <X className="h-5 w-5 text-white" />
        </button>

        {/* Counter in the center */}
        <div className="text-white/80 text-sm font-medium tabular-nums px-3 py-1 rounded-full bg-black/40 backdrop-blur-sm border border-white/10">
          {currentIndex + 1} / {images.length}
        </div>

        {/* Balance space on right */}
        <div className="w-11" />
      </div>

      {/* Main Image Container */}
      <div
        className="w-full h-full flex items-center justify-center overflow-hidden cursor-grab active:cursor-grabbing"
        onDoubleClick={handleDoubleClick}
      >
        <img
          src={currentImage}
          alt=""
          draggable={false}
          style={{
            transform: `translate3d(${position.x}px, ${position.y}px, 0) scale(${scale})`,
            transition: isInteracting ? "none" : "transform 0.22s cubic-bezier(0.2, 0, 0.2, 1)",
            willChange: "transform",
          }}
          className="max-h-[85vh] max-w-[95vw] w-auto h-auto object-contain rounded-xl shadow-2xl select-none"
        />
      </div>

      {/* Bottom Navigation (Only visible when scale === 1) */}
      {images.length > 1 && scale <= 1.05 && (
        <div className="absolute bottom-6 flex items-center gap-4 z-20 animate-in fade-in duration-200">
          <button
            onClick={prev}
            className="w-11 h-11 rounded-full bg-white/15 hover:bg-white/30 active:bg-white/40 flex items-center justify-center transition-colors backdrop-blur-sm cursor-pointer"
            aria-label="الصورة السابقة"
          >
            <ChevronRight className="h-6 w-6 text-white" />
          </button>
          <div className="flex gap-1.5 pointer-events-none">
            {images.length <= 10 &&
              images.map((_, i) => (
                <span
                  key={i}
                  className={cn(
                    "block rounded-full transition-all duration-200",
                    i === currentIndex
                      ? "w-4 h-1.5 bg-accent"
                      : "w-1.5 h-1.5 bg-white/40"
                  )}
                />
              ))}
          </div>
          <button
            onClick={next}
            className="w-11 h-11 rounded-full bg-white/15 hover:bg-white/30 active:bg-white/40 flex items-center justify-center transition-colors backdrop-blur-sm cursor-pointer"
            aria-label="الصورة التالية"
          >
            <ChevronLeft className="h-6 w-6 text-white" />
          </button>
        </div>
      )}
    </div>
  );
}
