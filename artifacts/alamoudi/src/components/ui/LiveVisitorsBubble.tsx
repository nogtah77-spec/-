import { useCallback, useEffect, useRef, useState } from "react";
import { useLocation } from "wouter";
import { Radio, GripVertical, ChevronDown, ChevronUp, Users, Eye, CalendarDays, TrendingUp, Minimize2, Maximize2 } from "lucide-react";
import { useData } from "@/context/DataContext";
import { RollingNumber } from "@/components/ui/RollingNumber";
import { cn } from "@/lib/utils";

const POS_KEY   = "alamoudi_live_bubble_pos_v3";
const STATE_KEY = "alamoudi_live_bubble_collapsed_v3";
const MINI_KEY  = "alamoudi_live_bubble_mini_v3";

type Pos = { x: number; y: number };

const W_NORMAL    = 185;
const W_MINI      = 96;
const H_MINI      = 38;
const H_COLLAPSED = 48;
const H_EXPANDED  = 205;
const MARGIN      = 16;

function clampToViewport(x: number, y: number, w: number, h: number): Pos {
  const winW = typeof window !== "undefined" ? window.innerWidth : 1200;
  const winH = typeof window !== "undefined" ? window.innerHeight : 800;
  const maxX = Math.max(MARGIN, winW - w - MARGIN);
  const maxY = Math.max(MARGIN, winH - h - MARGIN);
  return {
    x: Math.min(Math.max(MARGIN, x), maxX),
    y: Math.min(Math.max(MARGIN, y), maxY),
  };
}

function getSafePosition(stored: unknown, w: number, h: number): Pos {
  const winW = typeof window !== "undefined" ? window.innerWidth : 1200;
  const winH = typeof window !== "undefined" ? window.innerHeight : 800;
  const defaultPos: Pos = {
    x: MARGIN,
    y: Math.max(MARGIN, winH - h - MARGIN - 20),
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

  // Collapsed state (الستارة: true = مقفلة / شريط فقط، false = مفتوحة / تفاصيل الإحصائيات معروضة)
  const [collapsed, setCollapsed] = useState<boolean>(() => {
    try {
      const v = localStorage.getItem(STATE_KEY);
      if (v !== null) return v === "true";
      return true; // البداية الافتراضية: شريط أنيق مقفل
    } catch {
      return true;
    }
  });

  // Mini mode (وضع الكبسولة المصغرة جداً: true = كبسولة صغيرة، false = الحجم الطبيعي)
  const [isMini, setIsMini] = useState<boolean>(() => {
    try {
      const v = localStorage.getItem(MINI_KEY);
      if (v !== null) return v === "true";
      return false; // البداية الافتراضية: الحجم الطبيعي دائماً
    } catch {
      return false;
    }
  });

  // Dragging state
  const [isDragging, setIsDragging] = useState<boolean>(false);

  const currentW = isMini ? W_MINI : W_NORMAL;
  const currentH = isMini ? H_MINI : (collapsed ? H_COLLAPSED : H_EXPANDED);

  const [pos, setPos] = useState<Pos>(() => {
    try {
      if (typeof window !== "undefined") {
        const raw = localStorage.getItem(POS_KEY);
        if (raw) {
          return getSafePosition(JSON.parse(raw), W_NORMAL, H_COLLAPSED);
        }
      }
    } catch {}
    const winH = typeof window !== "undefined" ? window.innerHeight : 800;
    return { x: MARGIN, y: Math.max(MARGIN, winH - H_COLLAPSED - MARGIN - 20) };
  });

  const drag = useRef<{ dx: number; dy: number; startX: number; startY: number; moved: boolean } | null>(null);
  const posRef = useRef<Pos>(pos);
  posRef.current = pos;
  const rafId = useRef<number | null>(null);

  // Refresh visitor stats periodically every 10 seconds
  useEffect(() => {
    refreshVisitorStats();
    const id = setInterval(refreshVisitorStats, 10_000);
    return () => clearInterval(id);
  }, [refreshVisitorStats]);

  // Ensure position stays clamped when dimensions change (e.g. toggle mini or collapse)
  useEffect(() => {
    setPos(prev => clampToViewport(prev.x, prev.y, currentW, currentH));
  }, [currentW, currentH]);

  // Clamp position on window resize
  useEffect(() => {
    const onResize = () => {
      setPos(prev => clampToViewport(prev.x, prev.y, currentW, currentH));
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [currentW, currentH]);

  const savePos = (p: Pos) => {
    try { localStorage.setItem(POS_KEY, JSON.stringify(p)); } catch {}
  };

  const onPointerDown = useCallback((e: React.PointerEvent) => {
    const p = posRef.current;
    (e.currentTarget as Element).setPointerCapture?.(e.pointerId);
    drag.current = { dx: e.clientX - p.x, dy: e.clientY - p.y, startX: e.clientX, startY: e.clientY, moved: false };
    setIsDragging(true);
  }, []);

  const onPointerMove = useCallback((e: React.PointerEvent) => {
    const d = drag.current;
    if (!d) return;
    if (Math.abs(e.clientX - d.startX) > 4 || Math.abs(e.clientY - d.startY) > 4) {
      d.moved = true;
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
    if (!d) return;
    const p = posRef.current;
    if (p) savePos(p);

    // If clicked without dragging in mini mode -> expand back to normal!
    if (!d.moved && isMini) {
      setIsMini(false);
      try { localStorage.setItem(MINI_KEY, "false"); } catch {}
    }
  }, [isMini]);

  // Toggle Mini Mode (تصغير إلى كبسولة صغيرة جداً أو تكبيرها)
  const toggleMini = useCallback((e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation();
      e.preventDefault();
    }
    setIsMini(prev => {
      const next = !prev;
      try { localStorage.setItem(MINI_KEY, String(next)); } catch {}
      return next;
    });
  }, []);

  // Toggle Curtain (فتح / قفل الستارة لعرض أو إخفاء تفاصيل المؤشرات)
  const toggleCollapse = useCallback((e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation();
      e.preventDefault();
    }
    setCollapsed(prev => {
      const next = !prev;
      try { localStorage.setItem(STATE_KEY, String(next)); } catch {}
      return next;
    });
  }, []);

  // Modal check to prevent blocking overlays
  const [modalOpen, setModalOpen] = useState(false);
  useEffect(() => {
    const check = () => setModalOpen(
      !!document.querySelector('[data-radix-popper-content-wrapper], [role="dialog"][data-state="open"]')
    );
    const obs = new MutationObserver(check);
    obs.observe(document.body, { childList: true, subtree: true, attributes: true, attributeFilter: ["data-state"] });
    return () => obs.disconnect();
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
    <div
      style={{
        position: "fixed",
        left: pos.x,
        top: pos.y,
        width: currentW,
        touchAction: "none",
        zIndex: modalOpen ? 40 : 9999,
        pointerEvents: modalOpen ? "none" : "auto",
        transition: isDragging ? "none" : "width 0.2s cubic-bezier(0.16, 1, 0.3, 1), left 0.15s ease, top 0.15s ease",
        willChange: isDragging ? "left, top" : "auto",
      }}
      className="select-none font-sans"
    >
      {/* ── Mode 1: Minimized Mode (كبسولة صغيرة جداً عائمة ومضيئة لا تختفي أبداً) ── */}
      {isMini ? (
        <div
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          className="group flex items-center justify-between gap-1 px-2.5 py-1.5 rounded-full border border-amber-400/60 bg-gradient-to-r from-[#10202D]/95 via-[#173044]/95 to-[#10202D]/95 backdrop-blur-md shadow-xl shadow-black/60 ring-1 ring-amber-400/30 cursor-grab active:cursor-grabbing hover:border-amber-300 transition-all hover:scale-105"
          title="المتواجدون الآن - انقر للتكبير أو اسحب للتحريك"
        >
          {/* Live pulsing dot */}
          <div className="relative flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#BBA591] to-[#917B67] text-white shadow-xs">
            <Radio className="h-2.5 w-2.5" />
            <span className="absolute -right-0.5 -top-0.5 flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400 ring-1 ring-[#10202D]" />
            </span>
          </div>

          {/* Visitor count */}
          <span className="text-sm font-black text-white tabular-nums drop-shadow-sm px-0.5">
            <RollingNumber value={onlineCount} />
          </span>

          {/* Expand toggle button */}
          <button
            type="button"
            onPointerDown={e => e.stopPropagation()}
            onClick={toggleMini}
            className="w-5 h-5 flex items-center justify-center rounded text-amber-200/80 hover:text-white hover:bg-white/10 transition-colors shrink-0"
            title="تكبير النافذة (استعادة الحجم الطبيعي)"
            aria-label="تكبير"
          >
            <Maximize2 className="h-3 w-3" />
          </button>
        </div>
      ) : (
        /* ── Mode 2: Full / Normal Mode (الشريط الطبيعي مع إمكانية فتح الستارة) ── */
        <div className="rounded-2xl border border-amber-300/50 bg-gradient-to-br from-[#10202D]/95 via-[#173044]/95 to-[#0D1B27]/95 backdrop-blur-md shadow-2xl shadow-black/70 ring-1 ring-white/15 overflow-hidden transition-all duration-300">
          {/* Header row — draggable */}
          <div
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerUp}
            className="flex items-center gap-2 px-2.5 py-2 cursor-grab active:cursor-grabbing hover:bg-white/5 transition-colors"
          >
            {/* Live beacon */}
            <div className="relative flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#BBA591] to-[#917B67] text-white shadow-xs">
              <Radio className="h-3.5 w-3.5" />
              <span className="absolute -right-0.5 -top-0.5 flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400 ring-1 ring-[#10202D]" />
              </span>
            </div>

            {/* Title & Count */}
            <div className="flex min-w-0 flex-1 flex-col leading-none">
              <span className="text-[9px] font-semibold text-amber-200/90">متواجدون الآن</span>
              <span className="text-lg font-black text-white leading-tight drop-shadow-sm tabular-nums">
                <RollingNumber value={onlineCount} />
              </span>
            </div>

            {/* Minimize to mini pill button (سهمين متوجهين لبعض - تصغير لكبسولة صغيرة) */}
            <button
              type="button"
              onPointerDown={e => e.stopPropagation()}
              onClick={toggleMini}
              className="w-5 h-5 flex items-center justify-center text-amber-200/70 hover:text-white hover:bg-white/10 transition-colors rounded"
              title="تصغير إلى كبسولة صغيرة جداً"
              aria-label="تصغير إلى كبسولة"
            >
              <Minimize2 className="h-3 w-3" />
            </button>

            {/* Expand/Collapse curtain button (سهم لفتح أو قفل الستارة) */}
            <button
              type="button"
              onPointerDown={e => e.stopPropagation()}
              onClick={toggleCollapse}
              className="w-5 h-5 flex items-center justify-center text-white/70 hover:text-white hover:bg-white/10 transition-colors rounded"
              title={collapsed ? "عرض تفاصيل المؤشرات (فتح الستارة)" : "إخفاء تفاصيل المؤشرات (قفل الستارة)"}
              aria-label={collapsed ? "فتح الستارة" : "قفل الستارة"}
            >
              {collapsed ? <ChevronDown className="h-3.5 w-3.5" /> : <ChevronUp className="h-3.5 w-3.5" />}
            </button>

            {/* Grip handle */}
            <GripVertical className="h-3.5 w-3.5 shrink-0 text-white/30" aria-hidden="true" />
          </div>

          {/* Expanded curtain metrics */}
          {!collapsed && (
            <div className="border-t border-white/10 px-2.5 py-2 space-y-1.5 bg-black/25 animate-in fade-in duration-200">
              {metrics.map((m, i) => (
                <div key={i} className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <m.icon className="h-3 w-3 text-amber-300/80 flex-shrink-0" />
                    <span className="text-[9px] text-white/75 truncate">{m.label}</span>
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
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate("/admin/analytics");
                  }}
                  className={cn(
                    "w-full text-[9px] font-bold text-amber-300 hover:text-amber-200 hover:underline transition-all text-center py-1 block rounded bg-amber-400/10 hover:bg-amber-400/20"
                  )}
                >
                  عرض التحليلات الكاملة ←
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
