import { useCallback, useEffect, useRef, useState } from "react";
import { useLocation } from "wouter";
import { Radio, GripVertical } from "lucide-react";
import { useData } from "@/context/DataContext";
import { RollingNumber } from "@/components/ui/RollingNumber";

const POS_KEY = "alamoudi_live_bubble_pos";
const SIZE = { w: 150, h: 48 };
const MARGIN = 12;

type Pos = { x: number; y: number };

function clampToViewport(x: number, y: number): Pos {
  const maxX = Math.max(MARGIN, window.innerWidth - SIZE.w - MARGIN);
  const maxY = Math.max(MARGIN, window.innerHeight - SIZE.h - MARGIN);
  return {
    x: Math.min(Math.max(MARGIN, x), maxX),
    y: Math.min(Math.max(MARGIN, y), maxY),
  };
}

export function LiveVisitorsBubble() {
  const { visitorStats, refreshVisitorStats } = useData();
  const [, navigate] = useLocation();
  const [pos, setPos] = useState<Pos | null>(null);
  const drag = useRef<{ dx: number; dy: number; startX: number; startY: number; moved: boolean } | null>(null);
  const posRef = useRef<Pos | null>(null);
  posRef.current = pos;

  useEffect(() => {
    refreshVisitorStats();
    const id = setInterval(refreshVisitorStats, 10_000);
    return () => clearInterval(id);
  }, [refreshVisitorStats]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(POS_KEY);
      if (raw) {
        const p = JSON.parse(raw) as Pos;
        setPos(clampToViewport(p.x, p.y));
        return;
      }
    } catch {
      /* ignore */
    }
    setPos(clampToViewport(MARGIN, window.innerHeight - SIZE.h - MARGIN - 12));
  }, []);

  useEffect(() => {
    const onResize = () => {
      if (posRef.current) setPos(clampToViewport(posRef.current.x, posRef.current.y));
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  const onPointerDown = useCallback((e: React.PointerEvent) => {
    const p = posRef.current;
    if (!p) return;
    (e.currentTarget as Element).setPointerCapture?.(e.pointerId);
    drag.current = { dx: e.clientX - p.x, dy: e.clientY - p.y, startX: e.clientX, startY: e.clientY, moved: false };
  }, []);

  const onPointerMove = useCallback((e: React.PointerEvent) => {
    const d = drag.current;
    if (!d) return;
    if (Math.abs(e.clientX - d.startX) > 4 || Math.abs(e.clientY - d.startY) > 4) d.moved = true;
    setPos(clampToViewport(e.clientX - d.dx, e.clientY - d.dy));
  }, []);

  const onPointerUp = useCallback(() => {
    const d = drag.current;
    drag.current = null;
    if (!d) return;
    const p = posRef.current;
    if (p) {
      try {
        localStorage.setItem(POS_KEY, JSON.stringify(p));
      } catch {
        /* ignore */
      }
    }
    if (!d.moved) navigate("/admin/analytics");
  }, [navigate]);

  if (!pos) return null;

  return (
    <div
      role="status"
      aria-label="عدد الزوار المتواجدين الآن"
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      style={{ position: "fixed", left: pos.x, top: pos.y, width: SIZE.w, touchAction: "none", zIndex: 60 }}
      className="select-none cursor-grab active:cursor-grabbing"
    >
      <div className="flex items-center gap-2 rounded-xl border border-amber-300/40 bg-gradient-to-br from-[#1f2937] to-[#0f172a] px-2.5 py-1.5 shadow-lg shadow-black/30 ring-1 ring-white/10 transition-shadow hover:shadow-xl">
        <div className="relative flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#cdab74] to-[#b08d57] text-white shadow-sm">
          <Radio className="h-3.5 w-3.5" />
          <span className="absolute -right-0.5 -top-0.5 flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-green-400 ring-1 ring-[#1f2937]" />
          </span>
        </div>

        <div className="flex min-w-0 flex-1 flex-col leading-none">
          <span className="text-[9px] font-medium text-amber-200/90">متواجدون الآن</span>
          <span className="text-lg font-extrabold text-white leading-tight drop-shadow-sm">
            <RollingNumber value={visitorStats.online} />
          </span>
        </div>

        <GripVertical className="h-3.5 w-3.5 shrink-0 text-white/40" aria-hidden="true" />
      </div>
    </div>
  );
}
