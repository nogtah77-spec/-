import { Plus, Building2, MessageCircle } from "lucide-react";

export function VariantB() {
  return (
    <div
      dir="rtl"
      className="min-h-screen flex flex-col items-center justify-center"
      style={{ background: "#F5F1EB", fontFamily: "system-ui, sans-serif" }}
    >
      <p className="mb-6 text-xs font-medium tracking-wider" style={{ color: "#A27B5B" }}>
        ب — الكبسولات الممتدة
      </p>

      {/* ── Desktop ── */}
      <div className="w-full max-w-2xl flex gap-3 px-6 mb-8">
        <button
          className="flex-1 flex items-center justify-center gap-2.5 rounded-full shadow-lg hover:scale-[1.02] transition-transform duration-200"
          style={{
            background: "linear-gradient(135deg, #A27B5B, #C49A72)",
            color: "#fff",
            height: 64,
          }}
        >
          <Plus strokeWidth={2.5} className="w-5 h-5 shrink-0" />
          <span className="font-bold text-base">أضف عقارك</span>
        </button>

        <button
          className="flex-1 flex items-center justify-center gap-2.5 rounded-full shadow-lg hover:scale-[1.02] transition-transform duration-200"
          style={{
            background: "linear-gradient(135deg, #2C3639, #3F4E4F)",
            color: "#DCD7C9",
            height: 64,
            border: "1px solid rgba(220,215,201,0.25)",
          }}
        >
          <Building2 strokeWidth={2} className="w-5 h-5 shrink-0" />
          <span className="font-bold text-base">خدمات التشطيبات</span>
        </button>

        <button
          className="flex-1 flex items-center justify-center gap-2.5 rounded-full hover:bg-amber-50 transition-colors duration-200"
          style={{
            color: "#2C3639",
            height: 64,
            border: "2px solid #A27B5B",
          }}
        >
          <MessageCircle strokeWidth={2} className="w-5 h-5 shrink-0" style={{ color: "#A27B5B" }} />
          <span className="font-bold text-base">اطرح استفسارك</span>
        </button>
      </div>

      {/* ── Mobile preview ── */}
      <p className="mb-3 text-[10px] font-medium tracking-wider" style={{ color: "#999" }}>معاينة الجوال</p>
      <div
        className="flex gap-2 px-4"
        style={{ width: 360 }}
      >
        <button
          className="flex-1 flex items-center justify-center gap-1.5 rounded-full shadow-md"
          style={{
            background: "linear-gradient(135deg, #A27B5B, #C49A72)",
            color: "#fff",
            height: 50,
          }}
        >
          <Plus strokeWidth={2.5} className="w-4 h-4 shrink-0" />
          <span className="font-bold text-xs">أضف عقارك</span>
        </button>

        <button
          className="flex-1 flex items-center justify-center gap-1.5 rounded-full shadow-md"
          style={{
            background: "linear-gradient(135deg, #2C3639, #3F4E4F)",
            color: "#DCD7C9",
            height: 50,
          }}
        >
          <Building2 strokeWidth={2} className="w-4 h-4 shrink-0" />
          <span className="font-bold text-xs">خدمات التشطيبات</span>
        </button>

        <button
          className="flex-1 flex items-center justify-center gap-1.5 rounded-full"
          style={{
            color: "#2C3639",
            height: 50,
            border: "2px solid #A27B5B",
          }}
        >
          <MessageCircle strokeWidth={2} className="w-4 h-4 shrink-0" style={{ color: "#A27B5B" }} />
          <span className="font-bold text-xs">اطرح استفسارك</span>
        </button>
      </div>
    </div>
  );
}
