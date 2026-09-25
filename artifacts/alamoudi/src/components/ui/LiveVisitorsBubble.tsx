import { useCallback, useEffect, useRef, useState } from "react";
import { useLocation } from "wouter";
import { Radio, GripVertical, ChevronDown, ChevronUp, Users, Eye, CalendarDays, TrendingUp, Minimize2, Maximize2 } from "lucide-react";
import { useData } from "@/context/DataContext";
import { RollingNumber } from "@/components/ui/RollingNumber";
import { cn } from "@/lib/utils";

const POS_KEY   = "alamoudi_live_bubble_pos";
const STATE_KEY = "alamoudi_live_bubble_collapsed";
const MINI_KEY  = "alamoudi_live_bubble_mini";

type Pos = { x: number; y: number };

const W_NORMAL = 172;
const W_MINI   = 92;
const H_MINI   = 40;
const H_BAR    = 48;
const H_DRAWER = 205;
const MARGIN   = 12;

function clampToViewport(x: unknown, y: unknown, w: number, h: number): Pos {
  const winW = typeof window !== "undefined" ? window.innerWidth : 390;
  const winH = typeof window !== "undefined" ? window.innerHeight : 844;
  const numX = typeof x === "number" && Number.isFinite(x) ? x : MARGIN;
  const numY = typeof y === "number" && Number.isFinite(y) ? y : Math.max(MARGIN + 60, winH - h - 90);
  const maxX = Math.max(MARGIN, winW - w - MARGIN);
  const maxY = Math.max(MARGIN + 60, winH - h - 80);
  return { x: Math.min(Math.max(MARGIN, numX), maxX), y: Math.min(Math.max(MARGIN + 60, numY), maxY) };
}

function getSafePosition(stored: unknown, w: number, h: number): Pos {
  const winW = typeof window !== "undefined" ? window.innerWidth : 390;
  const winH = typeof window !== "undefined" ? window.innerHeight : 844;
  const defaultX = MARGIN;
  const defaultY = Math.max(MARGIN + 60, winH - h - 90);

  if (!stored || typeof stored !== "object") {
    return { x: defaultX, y: defaultY };
  }

  const p = stored as { x?: unknown; y?: unknown };
  if (typeof p.x !== "number" || !Number.isFinite(p.x) || typeof p.y !== "number" || !Number.isFinite(p.y)) {
    return { x: defaultX, y: defaultY };
  }

  if (p.x < MARGIN || p.x > winW - 30 || p.y < 50 || p.y > winH - 75) {
    return { x: defaultX, y: defaultY };
  }

  return clampToViewport(p.x, p.y, w, h);
}

export function LiveVisitorsBubble() {
  const { visitorStats, refreshVisitorStats, properties, inquiries, finishingRequests, propertyRequests } = useData();
  const [, navigate] = useLocation();

  // Collapsed state (الستارة: فتح أو قفل درج الإحصائيات)
  const [collapsed, setCollapsed] = useState<boolean>(() => {
    try { return localStorage.getItem(STATE_KEY) === "true"; } catch { return false; }
  });

  // Minimized state (التصغير إلى كبسولة/شارة عائمة صغيرة)
  const [isMini, setIsMini] = useState<boolean>(() => {
    try { return localStorage.getItem(MINI_KEY) === "true"; } catch { return false; }
  });

  const currentW = isMini ? W_MINI : W_NORMAL;
  const currentH = isMini ? H_MINI : (collapsed ? H_BAR : H_DRAWER);

  const [pos, setPos] = useState<Pos>(() => {
    try {
      if (typeof window !== "undefined") {
        const raw = localStorage.getItem(POS_KEY);
        if (raw) {
          return getSafePosition(JSON.parse(raw), W_NORMAL, H_BAR);
        }
      }
    } catch {}
    const winH = typeof window !== "undefined" ? window.innerHeight : 800;
    return { x: MARGIN, y: Math.max(MARGIN + 60, winH - H_BAR - 90) };
  });

  const drag = useRef<{ dx: number; dy: number; startX: number; startY: number; moved: boolean } | null>(null);
  const posRef = useRef<Pos | null>(null);
  posRef.current = pos;

  // Refresh visitor stats periodically every 10 seconds
  useEffect(() => {
    refreshVisitorStats();
    const id = setInterval(refreshVisitorStats, 10_000);
    return () => clearInterval(id);
  }, [refreshVisitorStats]);

  // Restore position from storage on mount
  useEffect(() => {
    try {
      const raw = localStorage.getItem(POS_KEY);
      if (raw) {
        setPos(getSafePosition(JSON.parse(raw), currentW, currentH));
        return;
      }
    } catch {}
    const winH = typeof window !== "undefined" ? window.innerHeight : 800;
    setPos({ x: MARGIN, y: Math.max(MARGIN + 60, winH - currentH - 90) });
  }, []);

  // Clamp position on window resize or size changes
  useEffect(() => {
    const onResize = () => {
      if (posRef.current) setPos(clampToViewport(posRef.current.x, posRef.current.y, currentW, currentH));
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [currentW, currentH]);

  const savePos = (p: Pos) => {
    try { localStorage.setItem(POS_KEY, JSON.stringify(p)); } catch {}
  };

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
    const np = clampToViewport(e.clientX - d.dx, e.clientY - d.dy, currentW, currentH);
    setPos(np);
  }, [currentW, currentH]);

  // Toggle drawer (فتح / قفل الستارة)
  const toggleDrawer = useCallback((e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setCollapsed(prev => {
      const next = !prev;
      try { localStorage.setItem(STATE_KEY, String(next)); } catch {}
      return next;
    });
  }, []);

  // Toggle mini mode (تصغير إلى شارة عائمة / تكبير)
  const toggleMini = useCallback((e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setIsMini(prev => {
      const next = !prev;
      try { localStorage.setItem(MINI_KEY, String(next)); } catch {}
      return next;
    });
  }, []);

  const onPointerUp = useCallback(() => {
    const d = drag.current;
    drag.current = null;
    if (!d) return;
    const p = posRef.current;
    if (p) savePos(p);

    // If tapped without dragging:
    if (!d.moved) {
      if (isMini) {
        // In mini mode, tap restores to full bar
        toggleMini();
      } else {
        // In full mode, tap toggles drawer
        toggleDrawer();
      }
    }
  }, [isMini, toggleMini, toggleDrawer]);

  // Hide behind any active full-screen modal dialog (z-50) so it doesn't block dialog overlays
  const [modalOpen, setModalOpen] = useState(false);
  useEffect(() => {
    const check = () => setModalOpen(
      !!document.querySelector('[role="dialog"][data-state="open"]')
    );
    const obs = new MutationObserver(check);
    obs.observe(document.body, { childList: true, subtree: true, attributes: true, attributeFilter: ["data-state"] });
    return () => obs.disconnect();
  }, []);

  if (!pos) return null;

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
        pointerEvents: "auto",
      }}
      className="select-none transition-all duration-300 ease-out"
    >
      {/* ── Mode 1: Minimized Mode (شارة عائمة مدمجة وواضحة جداً) ── */}
      {isMini ? (
        <div
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          className="flex items-center justify-between gap-1 px-2.5 py-1.5 rounded-full border-2 border-amber-400 bg-gradient-to-r from-[#10202D] to-[#173044] backdrop-blur-md shadow-2xl shadow-black/70 ring-2 ring-amber-400/25 cursor-grab active:cursor-grabbing hover:border-amber-300 hover:scale-105 transition-all select-none"
          title="متواجدون الآن (مصغر) - انقر للتكبير أو اسحب للتحريك"
        >
          {/* Live pulsing radio dot */}
          <div className="relative flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#BBA591] to-[#917B67] text-white shadow-xs">
            <Radio className="h-3 w-3 text-white" />
            <span className="absolute -right-0.5 -top-0.5 flex h-2.5 w-2.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-500 ring-2 ring-[#10202D]" />
            </span>
          </div>

          {/* Visitor count */}
          <span className="text-sm font-black text-white tabular-nums drop-shadow-xs px-0.5">
            <RollingNumber value={onlineCount} />
          </span>

          {/* Maximize button */}
          <button
            type="button"
            onPointerDown={e => e.stopPropagation()}
            onPointerUp={e => e.stopPropagation()}
            onClick={toggleMini}
            className="w-5 h-5 flex items-center justify-center text-amber-300 hover:text-white hover:bg-white/10 rounded-full transition-colors shrink-0"
            title="تكبير واستعادة النافذة"
          >
            <Maximize2 className="h-3 w-3" />
          </button>
        </div>
      ) : (
        /* ── Mode 2: Full / Normal Mode ── */
        <div className="rounded-2xl border border-amber-400/40 bg-gradient-to-br from-[#1e293b]/98 to-[#0f172a]/98 backdrop-blur-md shadow-2xl shadow-black/50 ring-1 ring-white/15 overflow-hidden transition-all duration-300">
          {/* Header row — fully draggable and tap-to-toggle */}
          <div
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerUp}
            className="flex items-center gap-1.5 px-2 py-2 cursor-grab active:cursor-grabbing hover:bg-white/5 transition-colors"
            title={collapsed ? "متواجدون الآن - انقر لفتح الستارة أو اسحب للتحريك" : "متواجدون الآن - انقر لقفل الستارة أو اسحب للتحريك"}
          >
            {/* Live radio badge with pulsing emerald ring */}
            <div className="relative flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#BBA591] to-[#917B67] text-white shadow-xs">
              <Radio className="h-3.5 w-3.5 text-white drop-shadow-xs" />
              <span className="absolute -right-0.5 -top-0.5 flex h-2.5 w-2.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-500 ring-2 ring-[#0f172a]" />
              </span>
            </div>

            {/* Title and live rolling count */}
            <div className="flex min-w-0 flex-1 flex-col leading-none">
              <span className="text-[9px] font-bold text-amber-200/90 tracking-tight">متواجدون الآن</span>
              <span className="text-lg font-black text-white leading-tight drop-shadow-xs tabular-nums">
                <RollingNumber value={onlineCount} />
              </span>
            </div>

            {/* زر فتح / قفل الستارة (Collapse/Expand metrics) */}
            <button
              type="button"
              onPointerDown={e => e.stopPropagation()}
              onPointerUp={e => e.stopPropagation()}
              onClick={toggleDrawer}
              className="w-5 h-5 flex items-center justify-center text-amber-200/80 hover:text-white hover:bg-white/10 transition-colors rounded shrink-0"
              title={collapsed ? "فتح الستارة (عرض تفاصيل الإحصائيات)" : "قفل الستارة (إخفاء التفاصيل)"}
            >
              {collapsed ? (
                <ChevronDown className="h-3.5 w-3.5 transition-transform duration-200" />
              ) : (
                <ChevronUp className="h-3.5 w-3.5 transition-transform duration-200" />
              )}
            </button>

            {/* زر التصغير (Minimize into small floating pill) */}
            <button
              type="button"
              onPointerDown={e => e.stopPropagation()}
              onPointerUp={e => e.stopPropagation()}
              onClick={toggleMini}
              className="w-5 h-5 flex items-center justify-center text-amber-200/80 hover:text-white hover:bg-white/10 transition-colors rounded shrink-0"
              title="تصغير إلى شارة عائمة صغيرة"
            >
              <Minimize2 className="h-3 w-3 transition-transform duration-200 hover:scale-110" />
            </button>

            {/* Grip drag indicator */}
            <GripVertical className="h-3.5 w-3.5 shrink-0 text-white/30" aria-hidden="true" />
          </div>

          {/* Detailed Metrics Drawer (الستارة: تفاصيل الإحصائيات) */}
          {!collapsed && (
            <div className="border-t border-white/10 px-2.5 py-2 space-y-1.5 bg-black/25 animate-in fade-in duration-200">
              {metrics.map((m, i) => (
                <div key={i} className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <m.icon className="h-3 w-3 text-amber-300/85 flex-shrink-0" />
                    <span className="text-[9.5px] text-white/75 truncate">{m.label}</span>
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
                    "w-full text-[9.5px] font-bold text-amber-300 hover:text-amber-200 hover:underline transition-all text-center py-1 block rounded bg-amber-400/10 hover:bg-amber-400/20"
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
