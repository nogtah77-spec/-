import { useCallback, useEffect, useRef, useState } from "react";
import { useLocation } from "wouter";
import { Radio, GripVertical, ChevronDown, ChevronUp, Users, Eye, CalendarDays, TrendingUp } from "lucide-react";
import { useData } from "@/context/DataContext";
import { RollingNumber } from "@/components/ui/RollingNumber";
import { cn } from "@/lib/utils";

const POS_KEY   = "alamoudi_live_bubble_pos";
const STATE_KEY = "alamoudi_live_bubble_collapsed";

type Pos = { x: number; y: number };

const W_EXPANDED  = 220;
const W_COLLAPSED = 150;
const H_COLLAPSED = 48;
const MARGIN = 12;

function clampToViewport(x: number, y: number, w: number, h: number): Pos {
  const maxX = Math.max(MARGIN, window.innerWidth  - w - MARGIN);
  const maxY = Math.max(MARGIN, window.innerHeight - h - MARGIN);
  return { x: Math.min(Math.max(MARGIN, x), maxX), y: Math.min(Math.max(MARGIN, y), maxY) };
}

export function LiveVisitorsBubble() {
  const { visitorStats, refreshVisitorStats, properties, inquiries, finishingRequests, propertyRequests } = useData();
  const [, navigate] = useLocation();

  const [pos, setPos]           = useState<Pos | null>(null);
  const [collapsed, setCollapsed] = useState<boolean>(() => {
    try { return localStorage.getItem(STATE_KEY) === "true"; } catch { return false; }
  });

  const drag = useRef<{ dx: number; dy: number; startX: number; startY: number; moved: boolean } | null>(null);
  const posRef = useRef<Pos | null>(null);
  posRef.current = pos;

  const w = W_COLLAPSED;
  const h = collapsed ? H_COLLAPSED : H_COLLAPSED + 116;

  // refresh every 10 s
  useEffect(() => {
    refreshVisitorStats();
    const id = setInterval(refreshVisitorStats, 10_000);
    return () => clearInterval(id);
  }, [refreshVisitorStats]);

  // restore position
  useEffect(() => {
    try {
      const raw = localStorage.getItem(POS_KEY);
      if (raw) { const p = JSON.parse(raw) as Pos; setPos(clampToViewport(p.x, p.y, w, h)); return; }
    } catch {}
    setPos(clampToViewport(MARGIN, window.innerHeight - H_COLLAPSED - MARGIN - 12, w, h));
  }, []);

  // clamp on resize
  useEffect(() => {
    const onResize = () => { if (posRef.current) setPos(clampToViewport(posRef.current.x, posRef.current.y, w, h)); };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [w, h]);

  const savePos = (p: Pos) => { try { localStorage.setItem(POS_KEY, JSON.stringify(p)); } catch {} };

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
    const np = clampToViewport(e.clientX - d.dx, e.clientY - d.dy, w, h);
    setPos(np);
  }, [w, h]);

  const onPointerUp = useCallback(() => {
    const d = drag.current;
    drag.current = null;
    if (!d) return;
    const p = posRef.current;
    if (p) savePos(p);
    if (!d.moved) navigate("/admin/analytics");
  }, [navigate]);

  const toggleCollapse = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    setCollapsed(v => {
      const next = !v;
      try { localStorage.setItem(STATE_KEY, String(next)); } catch {}
      return next;
    });
  }, []);

  if (!pos) return null;

  const totalLeads   = inquiries.length + finishingRequests.length + propertyRequests.length;
  const totalViews   = properties.reduce((s, p) => s + (p.views ?? 0), 0);
  const activeCount  = properties.filter(p => p.status === "active" || p.status === "listed").length;

  const metrics = [
    { icon: Eye,          label: "إجمالي المشاهدات",   value: totalViews   },
    { icon: Users,        label: "إجمالي العملاء",      value: totalLeads   },
    { icon: TrendingUp,   label: "عقارات نشطة",         value: activeCount  },
    { icon: CalendarDays, label: "زوار اليوم",           value: visitorStats.today },
  ];

  return (
    <div
      style={{ position: "fixed", left: pos.x, top: pos.y, width: w, touchAction: "none", zIndex: 60 }}
      className="select-none"
    >
      <div className="rounded-xl border border-amber-300/40 bg-gradient-to-br from-[#1f2937] to-[#0f172a] shadow-lg shadow-black/30 ring-1 ring-white/10 overflow-hidden transition-all duration-300">

        {/* Header row — draggable */}
        <div
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          className="flex items-center gap-2 px-2.5 py-1.5 cursor-grab active:cursor-grabbing"
        >
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

          <button
            onPointerDown={e => e.stopPropagation()}
            onClick={toggleCollapse}
            className="w-5 h-5 flex items-center justify-center text-white/50 hover:text-white/90 transition-colors rounded"
            title={collapsed ? "توسيع" : "تصغير"}
          >
            {collapsed ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
          </button>

          <GripVertical className="h-3.5 w-3.5 shrink-0 text-white/40" aria-hidden="true" />
        </div>

        {/* Expanded metrics */}
        {!collapsed && (
          <div className="border-t border-white/10 px-2.5 py-2 space-y-1.5">
            {metrics.map((m, i) => (
              <div key={i} className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-1.5 min-w-0">
                  <m.icon className="h-3 w-3 text-amber-300/70 flex-shrink-0" />
                  <span className="text-[9px] text-white/60 truncate">{m.label}</span>
                </div>
                <span className="text-xs font-bold text-white tabular-nums">
                  {m.value.toLocaleString("ar-EG")}
                </span>
              </div>
            ))}
            <div className="pt-1 border-t border-white/10">
              <button
                onClick={() => navigate("/admin/analytics")}
                className={cn(
                  "w-full text-[9px] font-medium text-amber-300/80 hover:text-amber-200 transition-colors text-center py-0.5"
                )}
              >
                عرض التحليلات الكاملة ←
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
