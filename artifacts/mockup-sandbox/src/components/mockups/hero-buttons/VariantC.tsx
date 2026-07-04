import { Plus, Building2, MessageCircle } from "lucide-react";

export function VariantC() {
  return (
    <div
      dir="rtl"
      className="min-h-screen flex flex-col items-center justify-center"
      style={{ background: "#F5F1EB", fontFamily: "system-ui, sans-serif" }}
    >
      <p className="mb-6 text-xs font-medium tracking-wider" style={{ color: "#A27B5B" }}>
        ج — بطاقات الأيقونة
      </p>

      {/* ── Desktop ── */}
      <div className="w-full max-w-2xl flex gap-3 px-6 mb-8">
        {/* Card 1 — Gold */}
        <button
          className="flex-1 flex items-center gap-3 px-4 rounded-2xl shadow-md hover:shadow-lg hover:scale-[1.02] transition-all duration-200"
          style={{
            background: "linear-gradient(135deg, #A27B5B, #C49A72)",
            color: "#fff",
            height: 72,
          }}
        >
          <div
            className="shrink-0 flex items-center justify-center rounded-xl"
            style={{ width: 40, height: 40, background: "rgba(255,255,255,0.25)" }}
          >
            <Plus strokeWidth={2.5} className="w-5 h-5" />
          </div>
          <div className="text-right">
            <div className="font-bold text-base leading-tight">أضف عقارك</div>
            <div className="text-xs mt-0.5" style={{ color: "rgba(255,255,255,0.8)" }}>أضف ملكك في دقيقتين</div>
          </div>
        </button>

        {/* Card 2 — Dark */}
        <button
          className="flex-1 flex items-center gap-3 px-4 rounded-2xl shadow-md hover:shadow-lg hover:scale-[1.02] transition-all duration-200"
          style={{
            background: "linear-gradient(135deg, #2C3639, #3F4E4F)",
            color: "#DCD7C9",
            height: 72,
            border: "1px solid rgba(220,215,201,0.15)",
          }}
        >
          <div
            className="shrink-0 flex items-center justify-center rounded-xl"
            style={{ width: 40, height: 40, background: "rgba(220,215,201,0.15)" }}
          >
            <Building2 strokeWidth={2} className="w-5 h-5" />
          </div>
          <div className="text-right">
            <div className="font-bold text-base leading-tight">خدمات التشطيبات</div>
            <div className="text-xs mt-0.5" style={{ color: "rgba(220,215,201,0.65)" }}>تصميم وتنفيذ احترافي</div>
          </div>
        </button>

        {/* Card 3 — Outline */}
        <button
          className="flex-1 flex items-center gap-3 px-4 rounded-2xl hover:bg-amber-50/60 transition-colors duration-200"
          style={{
            background: "#fff",
            color: "#2C3639",
            height: 72,
            border: "1.5px solid #C49A72",
          }}
        >
          <div
            className="shrink-0 flex items-center justify-center rounded-xl"
            style={{ width: 40, height: 40, background: "rgba(162,123,91,0.12)" }}
          >
            <MessageCircle strokeWidth={2} className="w-5 h-5" style={{ color: "#A27B5B" }} />
          </div>
          <div className="text-right">
            <div className="font-bold text-base leading-tight">اطرح استفسارك</div>
            <div className="text-xs mt-0.5" style={{ color: "#999" }}>فريقنا جاهز للرد</div>
          </div>
        </button>
      </div>

      {/* ── Mobile preview ── */}
      <p className="mb-3 text-[10px] font-medium tracking-wider" style={{ color: "#999" }}>معاينة الجوال</p>
      <div
        className="flex gap-2 px-4"
        style={{ width: 360 }}
      >
        <button
          className="flex-1 flex items-center gap-2 px-3 rounded-xl shadow-sm"
          style={{
            background: "linear-gradient(135deg, #A27B5B, #C49A72)",
            color: "#fff",
            height: 58,
          }}
        >
          <div
            className="shrink-0 flex items-center justify-center rounded-lg"
            style={{ width: 30, height: 30, background: "rgba(255,255,255,0.25)" }}
          >
            <Plus strokeWidth={2.5} className="w-4 h-4" />
          </div>
          <div className="text-right">
            <div className="font-bold text-xs leading-tight">أضف عقارك</div>
            <div className="text-[9px] mt-0.5" style={{ color: "rgba(255,255,255,0.75)" }}>أضف في دقيقتين</div>
          </div>
        </button>

        <button
          className="flex-1 flex items-center gap-2 px-3 rounded-xl shadow-sm"
          style={{
            background: "linear-gradient(135deg, #2C3639, #3F4E4F)",
            color: "#DCD7C9",
            height: 58,
          }}
        >
          <div
            className="shrink-0 flex items-center justify-center rounded-lg"
            style={{ width: 30, height: 30, background: "rgba(220,215,201,0.15)" }}
          >
            <Building2 strokeWidth={2} className="w-4 h-4" />
          </div>
          <div className="text-right">
            <div className="font-bold text-xs leading-tight">خدمات التشطيبات</div>
            <div className="text-[9px] mt-0.5" style={{ color: "rgba(220,215,201,0.65)" }}>تصميم وتنفيذ</div>
          </div>
        </button>

        <button
          className="flex-1 flex items-center gap-2 px-3 rounded-xl"
          style={{
            background: "#fff",
            color: "#2C3639",
            height: 58,
            border: "1.5px solid #C49A72",
          }}
        >
          <div
            className="shrink-0 flex items-center justify-center rounded-lg"
            style={{ width: 30, height: 30, background: "rgba(162,123,91,0.12)" }}
          >
            <MessageCircle strokeWidth={2} className="w-4 h-4" style={{ color: "#A27B5B" }} />
          </div>
          <div className="text-right">
            <div className="font-bold text-xs leading-tight">اطرح استفسارك</div>
            <div className="text-[9px] mt-0.5" style={{ color: "#999" }}>نرد بسرعة</div>
          </div>
        </button>
      </div>
    </div>
  );
}
