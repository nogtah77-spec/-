import { useState, useRef, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import { X, ChevronRight, ChevronLeft } from "lucide-react";
import { cn, suppressGhostClicks } from "@/lib/utils";

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

  const handleSafeClose = useCallback((e?: React.SyntheticEvent | Event) => {
    if (e) {
      try {
        if ("preventDefault" in e && typeof e.preventDefault === "function") e.preventDefault();
        if ("stopPropagation" in e && typeof e.stopPropagation === "function") e.stopPropagation();
      } catch {}
    }
    suppressGhostClicks(450);
    onClose();
  }, [onClose]);

  // Keyboard navigation
  useEffect(() => {
    if (currentIndex === null) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") handleSafeClose(e);
      else if (e.key === "ArrowRight") prev();
      else if (e.key === "ArrowLeft") next();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [currentIndex, handleSafeClose, prev, next]);

  // Lock body scroll while lightbox is open
  useEffect(() => {
    if (currentIndex === null) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prevOverflow;
    };
  }, [currentIndex]);

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

      // When scale <= 1.05:
      if (scale <= 1.05) {
        // Vertical swipe to dismiss (swipe down or up > 60px)
        if (Math.abs(dy) > 60 && Math.abs(dy) > Math.abs(dx) * 1.3) {
          onClose();
          return;
        }

        // Horizontal swipe to navigate images (RTL)
        if (Math.abs(dx) > 45 && Math.abs(dx) > Math.abs(dy) * 1.3) {
          if (dx > 0) prev(); // Swipe right -> previous in RTL
          else next();       // Swipe left -> next in RTL
          return;
        }

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

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget && scale <= 1.05) {
      handleSafeClose(e);
    }
  };

  if (typeof document === "undefined") return null;

  return createPortal(
    <div
      ref={containerRef}
      className="fixed inset-0 z-[999999] bg-black/95 flex flex-col items-center justify-center select-none touch-none overflow-hidden animate-in fade-in duration-200"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Fixed Close Button - Right corner (LTR/desktop close standard) */}
      <button
        type="button"
        className="fixed top-4 right-4 sm:top-5 sm:right-6 z-[1000000] w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-black/85 hover:bg-black active:bg-neutral-900 active:scale-90 text-white flex items-center justify-center backdrop-blur-md border-2 border-white/70 shadow-[0_4px_25px_rgba(0,0,0,0.85)] transition-all duration-150 cursor-pointer"
        onClick={handleSafeClose}
        onTouchStart={(e) => {
          e.preventDefault();
          e.stopPropagation();
        }}
        onTouchEnd={handleSafeClose}
        aria-label="إغلاق المعرض"
        title="إغلاق (Esc)"
      >
        <X className="w-5 h-5 text-white stroke-[2.5]" />
      </button>

      {/* Fixed Close Button - Left corner (RTL close standard) */}
      <button
        type="button"
        className="fixed top-4 left-4 sm:top-5 sm:left-6 z-[1000000] w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-black/85 hover:bg-black active:bg-neutral-900 active:scale-90 text-white flex items-center justify-center backdrop-blur-md border-2 border-white/70 shadow-[0_4px_25px_rgba(0,0,0,0.85)] transition-all duration-150 cursor-pointer"
        onClick={handleSafeClose}
        onTouchStart={(e) => {
          e.preventDefault();
          e.stopPropagation();
        }}
        onTouchEnd={handleSafeClose}
        aria-label="إغلاق المعرض"
        title="إغلاق (Esc)"
      >
        <X className="w-5 h-5 text-white stroke-[2.5]" />
      </button>

      {/* Top Counter - Center */}
      <div className="fixed top-4 sm:top-5 left-1/2 -translate-x-1/2 z-[1000000] text-white/95 text-xs sm:text-sm font-bold tabular-nums px-3.5 py-1.5 rounded-full bg-black/75 backdrop-blur-md border border-white/30 shadow-[0_4px_15px_rgba(0,0,0,0.6)] select-none pointer-events-none">
        {currentIndex + 1} / {images.length}
      </div>

      {/* Main Image Container — Clicking backdrop closes lightbox */}
      <div
        className="w-full h-full flex items-center justify-center overflow-hidden cursor-grab active:cursor-grabbing"
        onClick={handleBackdropClick}
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
        <div className="absolute bottom-6 flex items-center gap-4 z-50 animate-in fade-in duration-200">
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              prev();
            }}
            onTouchStart={(e) => {
              e.preventDefault();
              e.stopPropagation();
            }}
            className="w-11 h-11 rounded-full bg-black/85 hover:bg-black active:bg-neutral-900 border-2 border-white/60 flex items-center justify-center shadow-[0_4px_25px_rgba(0,0,0,0.8)] backdrop-blur-md cursor-pointer transition-all duration-150 hover:scale-105 active:scale-95"
            aria-label="الصورة السابقة"
          >
            <ChevronRight className="h-6 w-6 text-white stroke-[2.5]" />
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
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              next();
            }}
            onTouchStart={(e) => {
              e.preventDefault();
              e.stopPropagation();
            }}
            className="w-11 h-11 rounded-full bg-black/85 hover:bg-black active:bg-neutral-900 border-2 border-white/60 flex items-center justify-center shadow-[0_4px_25px_rgba(0,0,0,0.8)] backdrop-blur-md cursor-pointer transition-all duration-150 hover:scale-105 active:scale-95"
            aria-label="الصورة التالية"
          >
            <ChevronLeft className="h-6 w-6 text-white stroke-[2.5]" />
          </button>
        </div>
      )}
    </div>,
    document.body
  );
}
