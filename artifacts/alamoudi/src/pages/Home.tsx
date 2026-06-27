import { useState, useEffect } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { PropertyCard, type CardSize } from "@/components/ui/PropertyCard";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Gem, ShieldCheck, UserCheck, CheckCircle2, LayoutGrid, AlignJustify, List, Plus, ChevronLeft } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { useData } from "@/context/DataContext";
import { cn } from "@/lib/utils";
import { Link } from "wouter";

const CARD_SIZE_KEY = "alamoudi_card_size";

function SizeToggle({ size, onChange }: { size: CardSize; onChange: (s: CardSize) => void }) {
  return (
    <div className="flex items-center gap-1 bg-muted rounded-lg p-1">
      {[
        { value: "large" as CardSize, icon: <LayoutGrid className="h-3.5 w-3.5" />, label: "كبير" },
        { value: "medium" as CardSize, icon: <AlignJustify className="h-3.5 w-3.5" />, label: "متوسط" },
        { value: "compact" as CardSize, icon: <List className="h-3.5 w-3.5" />, label: "مضغوط" },
      ].map((opt) => (
        <button
          key={opt.value}
          onClick={() => onChange(opt.value)}
          title={opt.label}
          className={cn(
            "w-7 h-7 rounded-md flex items-center justify-center transition-all text-xs",
            size === opt.value
              ? "bg-background text-accent shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          {opt.icon}
        </button>
      ))}
    </div>
  );
}

export default function Home() {
  const { properties, regions, propertyTypes, settings } = useData();
  const [searchCategory, setSearchCategory] = useState<"sale" | "rent" | "furnished">("sale");
  const [searchSector, setSearchSector] = useState<"residential" | "administrative" | "medical" | "commercial">("residential");
  const [selectedRegion, setSelectedRegion] = useState("");
  const [selectedType, setSelectedType] = useState("");
  const [cardSize, setCardSize] = useState<CardSize>(() => {
    try { return (localStorage.getItem(CARD_SIZE_KEY) as CardSize) || "large"; } catch { return "large"; }
  });

  useEffect(() => {
    try { localStorage.setItem(CARD_SIZE_KEY, cardSize); } catch {}
  }, [cardSize]);

  const featured = properties.slice(0, 6);
  const latest = [...properties].reverse().slice(0, 3);

  const resolveProps = (p: any) => ({
    ...p,
    typeName: propertyTypes.find((t) => t.id === p.typeId)?.name,
    regionName: regions.find((r) => r.id === p.regionId)?.name,
  });

  const heroImage = settings.heroImageUrl || "https://images.unsplash.com/photo-1613977257363-707ba9348227?w=1920&q=80";

  const gridClass = cardSize === "compact"
    ? "grid grid-cols-1 md:grid-cols-2 gap-3"
    : cardSize === "medium"
    ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5"
    : "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6";

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-1">
        {/* ── Hero ── */}
        <section className="relative flex flex-col items-center justify-center text-center overflow-hidden py-20 md:py-28 min-h-[480px]">
          <div className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat" style={{ backgroundImage: `url(${heroImage})` }} />
          <div className="absolute inset-0 z-10" style={{ background: "linear-gradient(135deg, rgba(44,54,57,0.82) 0%, rgba(63,78,79,0.75) 50%, rgba(44,54,57,0.85) 100%)" }} />
          <div className="absolute inset-0 z-10 opacity-[0.05] pointer-events-none" style={{ backgroundImage: "radial-gradient(#DCD7C9 1px, transparent 1px)", backgroundSize: "28px 28px" }} />

          <div className="container relative z-20 px-6 max-w-4xl mx-auto">
            <h1 className="text-3xl md:text-5xl font-bold text-[#DCD7C9] leading-tight mb-4 drop-shadow-lg">
              اكتشف الفخامة في كل تفاصيل
              <br />
              <span style={{ color: "#C49A72" }}>منزلك القادم</span>
            </h1>
            <p className="text-sm md:text-base text-[#DCD7C9]/85 font-light max-w-xl mx-auto leading-relaxed mb-8">
              نقدم أفضل الفرص العقارية والاستثمارية في القاهرة الجديدة
            </p>
            <Button
              asChild
              size="lg"
              className="h-11 px-8 rounded-full font-bold text-sm shadow-lg hover:scale-105 transition-transform duration-300 text-white gap-2"
              style={{ background: "linear-gradient(135deg, #A27B5B, #C49A72)" }}
            >
              <Link href="/add-property">
                <Plus className="h-4 w-4" />
                أضف عقارك لدينا
              </Link>
            </Button>
          </div>
        </section>

        {/* ── Search Widget ── */}
        <div className="container px-6">
          <div className="-mt-8 relative z-20 bg-card border border-border rounded-2xl shadow-[0_8px_40px_-8px_rgba(44,54,57,0.18)] p-6 max-w-2xl mx-auto">
            <div className="flex flex-wrap justify-center gap-2 mb-4">
              {[{ value: "sale", label: "للبيع" }, { value: "rent", label: "للإيجار" }, { value: "furnished", label: "شقق مفروشة" }].map((btn) => (
                <button key={btn.value} onClick={() => setSearchCategory(btn.value as typeof searchCategory)}
                  className={cn("px-5 py-2 rounded-full text-sm font-medium transition-all",
                    searchCategory === btn.value ? "bg-accent text-white shadow-sm" : "bg-muted text-muted-foreground hover:bg-muted/70")}>
                  {btn.label}
                </button>
              ))}
            </div>
            <div className="flex flex-wrap justify-center gap-2 mb-5">
              {[{ value: "residential", label: "سكني" }, { value: "administrative", label: "إداري" }, { value: "medical", label: "طبي" }, { value: "commercial", label: "تجاري" }].map((btn) => (
                <button key={btn.value} onClick={() => setSearchSector(btn.value as typeof searchSector)}
                  className={cn("px-4 py-1.5 rounded-full text-sm font-medium border transition-all",
                    searchSector === btn.value ? "border-accent text-accent bg-accent/10" : "border-border text-muted-foreground hover:border-accent/40")}>
                  {btn.label}
                </button>
              ))}
            </div>
            <div className="flex flex-wrap gap-2 justify-center">
              <Select value={selectedRegion} onValueChange={setSelectedRegion}>
                <SelectTrigger className="w-full sm:w-40 h-9 text-sm"><SelectValue placeholder="المنطقة" /></SelectTrigger>
                <SelectContent>{regions.filter(r => r.active).map(r => <SelectItem key={r.id} value={r.id}>{r.name}</SelectItem>)}</SelectContent>
              </Select>
              <Select value={selectedType} onValueChange={setSelectedType}>
                <SelectTrigger className="w-full sm:w-44 h-9 text-sm"><SelectValue placeholder="نوع العقار" /></SelectTrigger>
                <SelectContent>{propertyTypes.filter(t => t.active).map(t => <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>)}</SelectContent>
              </Select>
              <Button className="h-9 px-6 bg-accent text-white hover:bg-accent/90 text-sm font-medium gap-1.5" data-testid="button-search">
                <Search className="h-4 w-4" />بحث
              </Button>
            </div>
          </div>
        </div>

        {/* ── About Us Snippet ── */}
        <section className="py-16 bg-background">
          <div className="container px-6">
            <div className="max-w-4xl mx-auto bg-card border border-border/50 rounded-2xl overflow-hidden card-luxury">
              <div className="grid grid-cols-1 md:grid-cols-2">
                <div className="p-8 md:p-10 flex flex-col justify-center">
                  <p className="text-accent text-xs font-medium tracking-widest mb-3 uppercase">تعرّف علينا</p>
                  <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-4 leading-tight">من نحن</h2>
                  <p className="text-sm text-muted-foreground leading-relaxed mb-6">
                    العمودي للتسويق العقاري شركة متخصصة في التسويق والاستثمار العقاري، تأسست عام 2018، وتمتلك خبرة واسعة في سوق العقارات المصري والسعودي.
                  </p>
                  <Button asChild variant="outline" className="w-fit rounded-full px-6 text-sm gap-2 border-accent/40 text-accent hover:bg-accent/10">
                    <Link href="/about">
                      اقرأ أكثر
                      <ChevronLeft className="h-4 w-4" />
                    </Link>
                  </Button>
                </div>
                <div className="hidden md:grid grid-cols-2 gap-4 p-8 bg-[#F5F2EC] dark:bg-muted/10">
                  {[
                    { v: "2018", l: "سنة التأسيس" },
                    { v: `${properties.length}+`, l: "عقار في المحفظة" },
                    { v: `${regions.filter(r => r.active).length}`, l: "منطقة مغطاة" },
                    { v: "100%", l: "رضا العملاء" },
                  ].map((s, i) => (
                    <div key={i} className="bg-background rounded-xl p-4 text-center border border-border/50">
                      <div className="text-2xl font-bold text-accent mb-1">{s.v}</div>
                      <div className="text-xs text-muted-foreground">{s.l}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── Featured Properties ── */}
        <section className="py-12 md:py-16 bg-[#F5F2EC] dark:bg-background">
          <div className="container px-6">
            <div className="flex flex-wrap items-end justify-between gap-4 mb-10">
              <div className="text-center flex-1">
                <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-1 inline-block relative">
                  عقارات مميزة
                  <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-12 h-0.5 bg-accent rounded-full" />
                </h2>
              </div>
              <SizeToggle size={cardSize} onChange={setCardSize} />
            </div>
            <div className={gridClass}>
              {featured.length === 0
                ? [1, 2, 3, 4, 5, 6].map(i => <PropertyCard key={i} isLoading size={cardSize} />)
                : featured.map(p => <PropertyCard key={p.id} property={resolveProps(p)} size={cardSize} />)}
            </div>
          </div>
        </section>

        {/* ── Add Property CTA ── */}
        <section className="py-12 bg-background">
          <div className="container px-6">
            <div className="max-w-2xl mx-auto text-center bg-card border border-accent/20 rounded-2xl p-8 card-luxury">
              <div className="w-14 h-14 bg-accent/10 rounded-2xl flex items-center justify-center text-accent mx-auto mb-4">
                <Plus className="h-7 w-7" />
              </div>
              <h2 className="text-xl md:text-2xl font-bold text-foreground mb-3">هل تمتلك عقاراً للبيع أو الإيجار؟</h2>
              <p className="text-sm text-muted-foreground leading-relaxed mb-6 max-w-md mx-auto">
                أضف عقارك لدينا واحصل على أفضل عرض سعر من خبرائنا العقاريين. نتواصل معك في أقرب وقت.
              </p>
              <Button
                asChild
                size="lg"
                className="h-11 px-10 rounded-full font-bold text-sm text-white gap-2"
                style={{ background: "linear-gradient(135deg, #A27B5B, #C49A72)" }}
              >
                <Link href="/add-property">
                  <Plus className="h-4 w-4" />
                  أضف عقارك الآن
                </Link>
              </Button>
            </div>
          </div>
        </section>

        {/* ── Latest Properties ── */}
        <section className="py-12 md:py-16 bg-[#F5F2EC] dark:bg-background">
          <div className="container px-6">
            <div className="flex flex-wrap justify-between items-end gap-4 mb-10">
              <div>
                <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-1">أحدث العقارات</h2>
                <p className="text-sm text-muted-foreground">تصفح أحدث ما أضيف لمجموعتنا العقارية</p>
              </div>
              <div className="flex items-center gap-3">
                <SizeToggle size={cardSize} onChange={setCardSize} />
                <Button variant="outline" className="hidden md:flex text-primary border-primary hover:bg-primary hover:text-primary-foreground rounded-full px-5 text-sm h-9">
                  عرض الكل
                </Button>
              </div>
            </div>
            <div className={gridClass}>
              {latest.length === 0
                ? [1, 2, 3].map(i => <PropertyCard key={i} isLoading size={cardSize} />)
                : latest.map(p => <PropertyCard key={p.id} property={resolveProps(p)} size={cardSize} />)}
            </div>
            <div className="mt-6 text-center md:hidden">
              <Button variant="outline" className="w-full text-primary border-primary hover:bg-primary hover:text-primary-foreground rounded-full text-sm">عرض الكل</Button>
            </div>
          </div>
        </section>

        {/* ── Why Choose Us ── */}
        <section className="py-12 md:py-16 bg-background">
          <div className="container px-6">
            <div className="text-center mb-10">
              <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-2">لماذا نحن؟</h2>
              <p className="text-sm text-muted-foreground max-w-lg mx-auto">نلتزم بتقديم تجربة استثنائية ترتكز على الجودة والاحترافية.</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {[
                { icon: <Gem className="w-6 h-6" />, title: "عقارات حصرية", desc: "نوفر وصولاً لأرقى العقارات والفرص الاستثمارية غير المتاحة في السوق العام." },
                { icon: <ShieldCheck className="w-6 h-6" />, title: "خبرة موثوقة", desc: "فريق من المستشارين ذوي المعرفة العميقة بالسوق العقاري المصري." },
                { icon: <UserCheck className="w-6 h-6" />, title: "خدمة متكاملة", desc: "نرافقك من البحث والمقارنة حتى إنهاء كافة الإجراءات القانونية ونقل الملكية." },
                { icon: <CheckCircle2 className="w-6 h-6" />, title: "شفافية تامة", desc: "وضوح كامل في التسعير والمواصفات لضمان قرار استثماري سليم وآمن." },
              ].map((item, i) => (
                <Card key={i} className="card-luxury bg-card border-none text-center">
                  <CardContent className="p-6 flex flex-col items-center">
                    <div className="w-12 h-12 bg-accent/10 rounded-xl flex items-center justify-center text-accent mb-4">{item.icon}</div>
                    <h3 className="text-sm font-bold mb-2">{item.title}</h3>
                    <p className="text-xs text-muted-foreground leading-relaxed">{item.desc}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* ── Contact CTA ── */}
        <section className="py-12 md:py-16 relative overflow-hidden" style={{ background: "var(--gradient-hero)" }}>
          <div className="absolute inset-0 opacity-[0.04] pointer-events-none" style={{ backgroundImage: "radial-gradient(#C49A72 1px, transparent 1px)", backgroundSize: "28px 28px" }} />
          <div className="container relative z-10 px-6 text-center">
            <h2 className="text-2xl md:text-3xl font-bold text-[#DCD7C9] mb-4">تواصل معنا</h2>
            <p className="text-sm text-[#DCD7C9]/75 mb-8 max-w-xl mx-auto font-light leading-relaxed">
              مستشارونا العقاريون جاهزون لتقديم الاستشارة المجانية ومساعدتك في اختيار ما يناسبك.
            </p>
            <Button size="lg" className="h-12 px-10 rounded-full font-bold text-sm shadow-lg hover:scale-105 transition-transform duration-300 text-white"
              style={{ background: "linear-gradient(135deg, #A27B5B, #C49A72)" }}
              onClick={() => {
                const href = settings.whatsapp
                  ? `https://wa.me/${settings.whatsapp.replace(/[\s+]/g, "")}`
                  : `mailto:${settings.email}`;
                window.open(href, "_blank");
              }}
              data-testid="button-contact">
              تواصل معنا الآن
            </Button>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
