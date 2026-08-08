import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Scale, X, Bed, Bath, Square, MapPin, Layers, Check, Minus } from "lucide-react";
import { Link } from "wouter";
import { useData } from "@/context/DataContext";
import { useUserPrefs } from "@/context/UserPrefsContext";
import { cn, formatNumber } from "@/lib/utils";

const categoryLabels: Record<string, string> = {
  sale: "للبيع", rent: "للإيجار", furnished: "مفروش",
  administrative: "إداري", medical: "طبي", commercial: "تجاري",
};

const finishingLabels: Record<string, string> = {
  "super-lux": "سوبر لوكس", "lux": "لوكس", "semi-finished": "نص تشطيب",
  "ultra": "ألترا سوبر لوكس", "finished": "متشطب", "red-brick": "طوب أحمر",
  "under-construction": "تحت الإنشاء", "core-shell": "تحت الإنشاء",
};

export default function Compare() {
  const { properties, propertyTypes, regions } = useData();
  const { compare, removeFromCompare, clearCompare } = useUserPrefs() as any;

  const compareProps = compare.map((id: string) => {
    const p = properties.find(x => x.id === id);
    if (!p) return null;
    return { ...p, typeName: propertyTypes.find(t => t.id === p.typeId)?.name, regionName: regions.find(r => r.id === p.regionId)?.name };
  }).filter(Boolean);

  const rows = [
    { label: "السعر", key: "price", format: (v: any) => v ? `${formatNumber(v)} EGP` : "—" },
    { label: "المنطقة", key: "regionName", format: (v: any) => v || "—" },
    { label: "نوع العقار", key: "typeName", format: (v: any) => v || "—" },
    { label: "فئة العقار", key: "category", format: (v: any) => categoryLabels[v] || "—" },
    { label: "المساحة", key: "area", format: (v: any) => v ? `${v} م²` : "—" },
    { label: "غرف النوم", key: "beds", format: (v: any) => v > 0 ? v : "—" },
    { label: "الحمامات", key: "baths", format: (v: any) => v > 0 ? v : "—" },
    { label: "الدور", key: "floor", format: (v: any) => v > 0 ? v : "—" },
    { label: "عدد طوابق العقار", key: "floors", format: (v: any) => v > 0 ? v : "—" },
    { label: "التشطيب", key: "finishing", format: (v: any) => v ? (finishingLabels[v] || v) : "—" },
    { label: "الفيو", key: "view", format: (v: any) => v || "—" },
    { label: "عقار مميز", key: "featured", format: (v: any) => v ? <Check className="h-4 w-4 text-accent mx-auto" /> : <Minus className="h-4 w-4 text-muted-foreground mx-auto" /> },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 bg-[#F5F2EC] dark:bg-background py-12">
        <div className="container px-6">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-2xl font-bold text-foreground mb-1">مقارنة العقارات</h1>
              <p className="text-sm text-muted-foreground">قارن بين العقارات لتتخذ القرار الأفضل</p>
            </div>
            {compareProps.length > 0 && (
              <Button variant="outline" size="sm" onClick={clearCompare} className="gap-1.5 text-muted-foreground hover:text-destructive">
                <X className="h-4 w-4" />مسح الكل
              </Button>
            )}
          </div>

          {compareProps.length === 0 ? (
            <div className="py-20 text-center">
              <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center text-muted-foreground mx-auto mb-4">
                <Scale className="h-8 w-8" />
              </div>
              <h2 className="text-lg font-bold text-foreground mb-2">قائمة المقارنة فارغة</h2>
              <p className="text-sm text-muted-foreground mb-6">أضف عقارين أو أكثر للمقارنة بين مواصفاتها.</p>
              <Button asChild className="bg-accent text-white hover:bg-accent/90 rounded-full px-8">
                <Link href="/">تصفح العقارات</Link>
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto rounded-2xl border border-border bg-card shadow-sm">
              <table className="w-full min-w-[600px]">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-right p-4 text-sm font-semibold text-muted-foreground w-36">المواصفة</th>
                    {compareProps.map((p: any) => (
                      <th key={p.id} className="p-4 text-center">
                        <div className="relative">
                          <Button variant="ghost" size="icon" className="absolute -top-2 -left-2 h-6 w-6 text-muted-foreground hover:text-destructive"
                            onClick={() => removeFromCompare(p.id)}>
                            <X className="h-3.5 w-3.5" />
                          </Button>
                          <div className="h-20 w-full bg-muted rounded-lg overflow-hidden mb-2">
                            {p.images?.[0]
                              ? <img src={p.images[0]} alt={p.title} className="w-full h-full object-cover" />
                              : <div className="w-full h-full flex items-center justify-center"><MapPin className="h-6 w-6 text-muted-foreground/30" /></div>
                            }
                          </div>
                          <span className="inline-block font-mono text-[11px] font-semibold text-accent bg-accent/10 border border-accent/25 px-2 py-0.5 rounded tracking-wide">{p.code}</span>
                           <p className="text-accent font-bold text-sm mt-1">{formatNumber(p.price)} EGP</p>
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row, ri) => (
                    <tr key={ri} className={cn("border-b border-border last:border-0", ri % 2 === 0 ? "bg-muted/20" : "")}>
                      <td className="p-4 text-sm text-muted-foreground font-medium">{row.label}</td>
                      {compareProps.map((p: any) => (
                        <td key={p.id} className="p-4 text-center text-sm font-medium text-foreground">
                          {row.format((p as any)[row.key])}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
