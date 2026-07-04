import { Plus, Building2, MessageCircle } from "lucide-react";

export function VariantA() {
  return (
    <div
      dir="rtl"
      className="min-h-screen flex flex-col items-center justify-center"
      style={{ background: "#F5F1EB", fontFamily: "system-ui, sans-serif" }}
    >
      <p className="mb-6 text-xs font-medium tracking-wider" style={{ color: "#A27B5B" }}>
        أ — البلاط المتساوية
      </p>

      {/* ── Desktop ── */}
      <div className="w-full max-w-2xl flex gap-3 px-6 mb-8">
        <button
          className="flex-1 flex flex-col items-center justify-center gap-2 rounded-2xl py-5 shadow-md hover:scale-[1.02] transition-transform duration-200"
          style={{ background: "linear-gradient(135deg, #A27B5B, #C49A72)", color: "#fff" }}
        >
          <Plus strokeWidth={2.5} className="w-7 h-7" />
          <span className="font-bold text-base leading-tight">أضف عقارك</span>
        </button>

        <button
          className="flex-1 flex flex-col items-center justify-center gap-2 rounded-2xl py-5 shadow-md hover:scale-[1.02] transition-transform duration-200"
          style={{ background: "linear-gradient(135deg, #2C3639, #3F4E4F)", color: "#DCD7C9", border: "1px solid rgba(220,215,201,0.2)" }}
        >
          <Building2 strokeWidth={2} className="w-7 h-7" />
          <span className="font-bold text-base leading-tight">خدمات التشطيبات</span>
        </button>

        <button
          className="flex-1 flex flex-col items-center justify-center gap-2 rounded-2xl py-5 hover:scale-[1.02] transition-transform duration-200"
          style={{ background: "transparent", color: "#2C3639", border: "1.5px solid #A27B5B" }}
        >
          <MessageCircle strokeWidth={2} className="w-7 h-7" style={{ color: "#A27B5B" }} />
          <span className="font-bold text-base leading-tight">اطرح استفسارك</span>
        </button>
      </div>

      {/* ── Mobile preview ── */}
      <p className="mb-3 text-[10px] font-medium tracking-wider" style={{ color: "#999" }}>معاينة الجوال</p>
      <div
        className="flex gap-2.5 px-4"
        style={{ width: 360 }}
      >
        <button
          className="flex-1 flex flex-col items-center justify-center gap-1.5 rounded-xl py-4 shadow-sm"
          style={{ background: "linear-gradient(135deg, #A27B5B, #C49A72)", color: "#fff" }}
        >
          <Plus strokeWidth={2.5} className="w-5 h-5" />
          <span className="font-bold text-xs leading-tight">أضف عقارك</span>
        </button>

        <button
          className="flex-1 flex flex-col items-center justify-center gap-1.5 rounded-xl py-4 shadow-sm"
          style={{ background: "linear-gradient(135deg, #2C3639, #3F4E4F)", color: "#DCD7C9" }}
        >
          <Building2 strokeWidth={2} className="w-5 h-5" />
          <span className="font-bold text-xs leading-tight">خدمات التشطيبات</span>
        </button>

        <button
          className="flex-1 flex flex-col items-center justify-center gap-1.5 rounded-xl py-4"
          style={{ color: "#2C3639", border: "1.5px solid #A27B5B" }}
        >
          <MessageCircle strokeWidth={2} className="w-5 h-5" style={{ color: "#A27B5B" }} />
          <span className="font-bold text-xs leading-tight">اطرح استفسارك</span>
        </button>
      </div>
    </div>
  );
}
