import { useCallback, useEffect, useRef, useState } from "react";
import { useLocation } from "wouter";
import { Radio, GripVertical, ChevronDown, ChevronUp, Users, Eye, CalendarDays, TrendingUp, Minimize2, Maximize2 } from "lucide-react";
import { useData } from "@/context/DataContext";
import { RollingNumber } from "@/components/ui/RollingNumber";
import { cn } from "@/lib/utils";

const POS_KEY   = "alamoudi_live_bubble_pos_v5";
const STATE_KEY = "alamoudi_live_bubble_collapsed_v5";
const MINI_KEY  = "alamoudi_live_bubble_mini_v5";

type Pos = { x: number; y: number };

const W_NORMAL    = 220;
const W_MINI      = 142;
const H_MINI      = 42;
const H_COLLAPSED = 50;
const H_EXPANDED  = 220;
const MARGIN      = 16;

function clampToViewport(x: number, y: number, w: number, h: number): Pos {
  const winW = typeof window !== "undefined" ? window.innerWidth : 1200;
  const winH = typeof window !== "undefined" ? window.innerHeight : 800;
  const safeX = Number.isFinite(x) ? x : MARGIN;
  const safeY = Number.isFinite(y) ? y : Math.max(MARGIN, winH - h - MARGIN - 24);
  const maxX = Math.max(MARGIN, winW - w - MARGIN);
  const maxY = Math.max(MARGIN, winH - h - MARGIN);
  return {
    x: Math.min(Math.max(MARGIN, safeX), maxX),
    y: Math.min(Math.max(MARGIN, safeY), maxY),
  };
}

function getSafePosition(stored: unknown, w: number, h: number): Pos {
  const winW = typeof window !== "undefined" ? window.innerWidth : 1200;
  const winH = typeof window !== "undefined" ? window.innerHeight : 800;
  const defaultPos: Pos = {
    x: MARGIN,
    y: Math.max(MARGIN, winH - h - MARGIN - 24),
  };

  if (!stored || typeof stored !== "object") return defaultPos;

  const p = stored as { x?: unknown; y?: unknown };
  if (typeof p.x !== "number" || !Number.isFinite(p.x) || typeof p.y !== "number" || !Number.isFinite(p.y)) {
    return defaultPos;
  }

  return clampToViewport(p.x, p.y, w, h);
}

export function LiveVisitorsBubble() {
  const { visitorStats, refreshVisitorStats, properties, inquiries, finishingRequests, propertyRequests } = useData();
  const [, navigate] = useLocation();

  // Collapsed state (الستارة: true = مقفلة / شريط فقط، false = مفتوحة / تفاصيل المؤشرات معروضة)
  const [collapsed, setCollapsed] = useState<boolean>(() => {
    try {
      const v = localStorage.getItem(STATE_KEY) ?? localStorage.getItem("alamoudi_live_bubble_collapsed_v4");
      if (v !== null) return v === "true";
      return true; // الافتراضي: شريط أنيق بدون فتح الستارة
    } catch {
      return true;
    }
  });

  // Mini mode (وضع الكبسولة المصغرة جداً: true = كبسولة صغيرة، false = الحجم الطبيعي)
  const [isMini, setIsMini] = useState<boolean>(() => {
    try {
      const v = localStorage.getItem(MINI_KEY) ?? localStorage.getItem("alamoudi_live_bubble_mini_v4");
      if (v !== null) return v === "true";
      return false; // الافتراضي: الحجم الطبيعي الأنيق
    } catch {
      return false;
    }
  });

  const [isDragging, setIsDragging] = useState<boolean>(false);

  const currentW = isMini ? W_MINI : W_NORMAL;
  const currentH = isMini ? H_MINI : (collapsed ? H_COLLAPSED : H_EXPANDED);

  const [pos, setPos] = useState<Pos>(() => {
    try {
      if (typeof window !== "undefined") {
        const raw = localStorage.getItem(POS_KEY) ?? localStorage.getItem("alamoudi_live_bubble_pos_v4");
        if (raw) {
          return getSafePosition(JSON.parse(raw), W_NORMAL, H_COLLAPSED);
        }
      }
    } catch {}
    const winH = typeof window !== "undefined" ? window.innerHeight : 800;
    return { x: MARGIN, y: Math.max(MARGIN, winH - H_COLLAPSED - MARGIN - 24) };
  });

  const drag = useRef<{ dx: number; dy: number; startX: number; startY: number; moved: boolean } | null>(null);
  const posRef = useRef<Pos>(pos);
  posRef.current = pos;
  const rafId = useRef<number | null>(null);
  const justDraggedRef = useRef<boolean>(false);

  // Refresh visitor stats periodically
  useEffect(() => {
    refreshVisitorStats();
    const id = setInterval(refreshVisitorStats, 10_000);
    return () => clearInterval(id);
  }, [refreshVisitorStats]);

  // Keep clamped to viewport whenever dimensions change
  useEffect(() => {
    setPos(prev => clampToViewport(prev.x, prev.y, currentW, currentH));
  }, [currentW, currentH]);

  // Clamp on window resize
  useEffect(() => {
    const onResize = () => {
      setPos(prev => clampToViewport(prev.x, prev.y, currentW, currentH));
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [currentW, currentH]);

  const savePos = (p: Pos) => {
    try {
      localStorage.setItem(POS_KEY, JSON.stringify(p));
    } catch {}
  };

  const onPointerDown = useCallback((e: React.PointerEvent) => {
    // Only drag with left mouse button or touch
    if (e.button !== 0) return;
    const p = posRef.current;
    try {
      (e.currentTarget as Element).setPointerCapture?.(e.pointerId);
    } catch {}
    drag.current = { dx: e.clientX - p.x, dy: e.clientY - p.y, startX: e.clientX, startY: e.clientY, moved: false };
    setIsDragging(true);
  }, []);

  const onPointerMove = useCallback((e: React.PointerEvent) => {
    const d = drag.current;
    if (!d) return;
    if (Math.abs(e.clientX - d.startX) > 4 || Math.abs(e.clientY - d.startY) > 4) {
      d.moved = true;
      justDraggedRef.current = true;
    }
    const np = clampToViewport(e.clientX - d.dx, e.clientY - d.dy, currentW, currentH);

    if (rafId.current) cancelAnimationFrame(rafId.current);
    rafId.current = requestAnimationFrame(() => {
      setPos(np);
    });
  }, [currentW, currentH]);

  const onPointerUp = useCallback(() => {
    const d = drag.current;
    drag.current = null;
    setIsDragging(false);

    if (d?.moved) {
      // Prevent synthetic click from expanding right after dragging
      setTimeout(() => {
        justDraggedRef.current = false;
      }, 120);
    } else {
      justDraggedRef.current = false;
    }

    if (!d) return;
    const p = posRef.current;
    if (p) savePos(p);
  }, []);

  // Expand from Mini Mode back to Normal Mode
  const expandFromMini = useCallback((e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation();
      e.preventDefault();
    }
    setIsMini(false);
    try {
      localStorage.setItem(MINI_KEY, "false");
    } catch {}
  }, []);

  // Minimize into Mini Mode
  const minimizeToMini = useCallback((e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation();
      e.preventDefault();
    }
    setIsMini(true);
    try {
      localStorage.setItem(MINI_KEY, "true");
    } catch {}
  }, []);

  // Handle tap / click on capsule container (expands only if not dragged)
  const handleCapsuleClick = useCallback((e: React.MouseEvent) => {
    if (justDraggedRef.current) return;
    expandFromMini(e);
  }, [expandFromMini]);

  // Toggle Curtain (فتح / قفل الستارة لعرض أو إخفاء تفاصيل المؤشرات)
  const toggleCurtain = useCallback((e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation();
      e.preventDefault();
    }
    setCollapsed(prev => {
      const next = !prev;
      try {
        localStorage.setItem(STATE_KEY, String(next));
      } catch {}
      return next;
    });
  }, []);

  const safeProperties = Array.isArray(properties) ? properties : [];
  const realProperties = safeProperties.filter(p => !p?.id?.startsWith("__") && !p?.code?.startsWith("__"));
  const totalLeads   = (inquiries?.length || 0) + (finishingRequests?.length || 0) + (propertyRequests?.length || 0);
  const totalViews   = realProperties.reduce((s, p) => s + (p?.views ?? 0), 0);
  const activeCount  = realProperties.filter(p => p?.status === "active" || p?.status === "listed").length;
  const onlineCount  = visitorStats?.online ?? 1;
  const todayCount   = visitorStats?.today ?? 0;

  const metrics = [
    { icon: Eye,          label: "إجمالي المشاهدات",   value: totalViews },
    { icon: Users,        label: "إجمالي العملاء",      value: totalLeads },
    { icon: TrendingUp,   label: "عقارات نشطة",         value: activeCount },
    { icon: CalendarDays, label: "زوار اليوم",           value: todayCount },
  ];

  return (
    <aside
      aria-label="المتواجدون الآن"
      style={{
        position: "fixed",
        left: pos.x,
        top: pos.y,
        width: currentW,
        touchAction: "none",
        zIndex: 99999,
        pointerEvents: "auto",
        transition: isDragging ? "none" : "width 0.25s cubic-bezier(0.16, 1, 0.3, 1), left 0.15s ease, top 0.15s ease",
        willChange: isDragging ? "left, top" : "auto",
      }}
      className={cn(
        "select-none font-sans overflow-hidden border-2 bg-gradient-to-br from-[#10202D] via-[#173044] to-[#0D1B27] backdrop-blur-md shadow-2xl shadow-black/85 transition-all duration-300",
        isMini
          ? "border-amber-400 rounded-full ring-2 ring-amber-400/40 cursor-pointer hover:border-amber-300 hover:scale-105"
          : "border-amber-400/70 rounded-2xl ring-1 ring-white/20"
      )}
    >
      {/* ── وضع الكبسولة المصغرة جداً (Mini Capsule Mode) ── */}
      {isMini ? (
        <div
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onClick={handleCapsuleClick}
          className="flex items-center justify-between gap-1.5 px-2.5 py-1.5 h-full w-full"
          title="متواجدون الآن (مصغر) - انقر للتكبير أو اسحب للتحريك"
        >
          {/* Live pulsing beacon */}
          <div className="relative flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#BBA591] to-[#917B67] text-white shadow-xs">
            <Radio className="h-3 w-3 text-white" />
            <span className="absolute -right-0.5 -top-0.5 flex h-2.5 w-2.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-500 ring-2 ring-[#10202D]" />
            </span>
          </div>

          {/* Label and Count */}
          <div className="flex items-center gap-1 leading-none min-w-0">
            <span className="text-[10px] font-bold text-amber-200 whitespace-nowrap">الآن:</span>
            <span className="text-sm font-black text-white tabular-nums drop-shadow-xs">
              <RollingNumber value={onlineCount} />
            </span>
          </div>

          {/* زر التكبير الصريح لاستعادة الحجم الطبيعي */}
          <button
            type="button"
            onPointerDown={e => e.stopPropagation()}
            onPointerUp={e => e.stopPropagation()}
            onClick={expandFromMini}
            className="w-5 h-5 flex items-center justify-center rounded-full text-amber-300 hover:text-white hover:bg-white/10 active:scale-95 transition-all shrink-0"
            title="تكبير واستعادة الحجم الطبيعي"
            aria-label="تكبير"
          >
            <Maximize2 className="h-3.5 w-3.5" />
          </button>
        </div>
      ) : (
        /* ── وضع الشريط الطبيعي مع الستارة والتصغير (Normal Mode) ── */
        <div>
          {/* Header row — fully draggable */}
          <div
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerUp}
            className="flex items-center gap-2 px-2.5 py-2 cursor-grab active:cursor-grabbing hover:bg-white/5 transition-colors"
          >
            {/* Live beacon */}
            <div className="relative flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#BBA591] to-[#917B67] text-white shadow-xs">
              <Radio className="h-3.5 w-3.5 text-white" />
              <span className="absolute -right-0.5 -top-0.5 flex h-2.5 w-2.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-500 ring-2 ring-[#10202D]" />
              </span>
            </div>

            {/* Title & Count */}
            <div className="flex min-w-0 flex-1 flex-col leading-none">
              <span className="text-[10px] font-bold text-amber-200">متواجدون الآن</span>
              <span className="text-base font-black text-white leading-tight drop-shadow-xs tabular-nums">
                <RollingNumber value={onlineCount} />
              </span>
            </div>

            {/* أزرار التحكم */}
            <div className="flex items-center gap-1 shrink-0">
              {/* زر الستارة (السهم): ChevronDown عند الإغلاق لفتح الستارة، و ChevronUp عند الفتح لقفلها */}
              <button
                type="button"
                onPointerDown={e => e.stopPropagation()}
                onPointerUp={e => e.stopPropagation()}
                onClick={toggleCurtain}
                className="w-6 h-6 flex items-center justify-center text-amber-200/90 hover:text-white hover:bg-white/10 active:scale-95 transition-all rounded"
                title={collapsed ? "فتح الستارة (عرض تفاصيل المؤشرات)" : "قفل الستارة (إخفاء التفاصيل)"}
                aria-label={collapsed ? "فتح الستارة" : "قفل الستارة"}
              >
                {collapsed ? (
                  <ChevronDown className="h-4 w-4 transition-transform duration-200 hover:translate-y-0.5" />
                ) : (
                  <ChevronUp className="h-4 w-4 transition-transform duration-200 hover:-translate-y-0.5" />
                )}
              </button>

              {/* زر التصغير الصريح: Minimize2 لتصغير الويدجت لكبسولة صغيرة عائمة */}
              <button
                type="button"
                onPointerDown={e => e.stopPropagation()}
                onPointerUp={e => e.stopPropagation()}
                onClick={minimizeToMini}
                className="w-6 h-6 flex items-center justify-center text-amber-300 hover:text-white hover:bg-amber-400/20 active:scale-95 transition-all rounded"
                title="تصغير إلى كبسولة صغيرة جداً"
                aria-label="تصغير إلى كبسولة"
              >
                <Minimize2 className="h-3.5 w-3.5 hover:scale-110 transition-transform" />
              </button>

              {/* Grip drag handle */}
              <div className="cursor-grab active:cursor-grabbing p-0.5 text-white/40 hover:text-white/70 transition-colors">
                <GripVertical className="h-4 w-4" aria-hidden="true" />
              </div>
            </div>
          </div>

          {/* Detailed Metrics Drawer (الستارة: تفاصيل المؤشرات) */}
          {!collapsed && (
            <div className="border-t border-white/15 px-2.5 py-2 space-y-1.5 bg-black/35 animate-in fade-in duration-200">
              {metrics.map((m, i) => (
                <div key={i} className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <m.icon className="h-3 w-3 text-amber-300 flex-shrink-0" />
                    <span className="text-[9.5px] text-white/85 truncate">{m.label}</span>
                  </div>
                  <span className="text-xs font-bold text-white tabular-nums">
                    {(m.value ?? 0).toLocaleString("en-US")}
                  </span>
                </div>
              ))}
              <div className="pt-1.5 border-t border-white/10">
                <button
                  type="button"
                  onPointerDown={e => e.stopPropagation()}
                  onPointerUp={e => e.stopPropagation()}
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate("/admin/analytics");
                  }}
                  className={cn(
                    "w-full text-[9.5px] font-bold text-amber-300 hover:text-amber-200 hover:underline transition-all text-center py-1 block rounded bg-amber-400/15 hover:bg-amber-400/25"
                  )}
                >
                  عرض التحليلات الكاملة ←
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </aside>
  );
}
