import { useState, useEffect, useMemo } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { PropertyCard, type CardSize } from "@/components/ui/PropertyCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Search, UserCheck, Plus, ChevronLeft, X,
  LayoutGrid, AlignJustify, List, ExternalLink, Play,
  Building2, Music,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { useData } from "@/context/DataContext";
import { cn } from "@/lib/utils";
import { Link } from "wouter";

const CARD_SIZE_KEY = "alamoudi_card_size";

function SizeToggle({ size, onChange }: { size: CardSize; onChange: (s: CardSize) => void }) {
  return (
    <div className="flex items-center gap-1 bg-muted rounded-lg p-1">
      {([
        { value: "large" as CardSize, icon: <LayoutGrid className="h-3.5 w-3.5" />, label: "كبير" },
        { value: "medium" as CardSize, icon: <AlignJustify className="h-3.5 w-3.5" />, label: "متوسط" },
        { value: "compact" as CardSize, icon: <List className="h-3.5 w-3.5" />, label: "مضغوط" },
      ] as const).map((opt) => (
        <button key={opt.value} onClick={() => onChange(opt.value)} title={opt.label}
          className={cn("w-7 h-7 rounded-md flex items-center justify-center transition-all",
            size === opt.value ? "bg-background text-accent shadow-sm" : "text-muted-foreground hover:text-foreground")}>
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
  const [searchText, setSearchText] = useState("");
  const [cardSize, setCardSize] = useState<CardSize>(() => {
    try { return (localStorage.getItem(CARD_SIZE_KEY) as CardSize) || "large"; } catch { return "large"; }
  });

  useEffect(() => { try { localStorage.setItem(CARD_SIZE_KEY, cardSize); } catch {} }, [cardSize]);

  const resolve = (p: any) => ({
    ...p,
    typeName: propertyTypes.find((t) => t.id === p.typeId)?.name,
    regionName: regions.find((r) => r.id === p.regionId)?.name,
  });

  const featuredProps = useMemo(() => properties.filter(p => p.featured).map(resolve), [properties, propertyTypes, regions]);
  const latestProps = useMemo(() => [...properties].reverse().slice(0, 6).map(resolve), [properties, propertyTypes, regions]);

  const searchResults = useMemo(() => {
    if (!searchText.trim()) return [];
    const q = searchText.trim().toLowerCase();
    return properties.filter(p =>
      p.title.toLowerCase().includes(q) || p.code.toLowerCase().includes(q)
    ).map(resolve);
  }, [searchText, properties, propertyTypes, regions]);

  const heroImage = settings.heroImageUrl || "https://images.unsplash.com/photo-1613977257363-707ba9348227?w=1920&q=80";
  const tiktokVideos = (settings.tiktokVideos ?? []).slice(0, 3);

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
        <section className="relative flex flex-col items-center justify-center text-center overflow-hidden py-14 md:py-20 min-h-[420px]">
          <div className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat" style={{ backgroundImage: `url(${heroImage})` }} />
          <div className="absolute inset-0 z-10" style={{ background: "linear-gradient(135deg, rgba(44,54,57,0.85) 0%, rgba(63,78,79,0.78) 50%, rgba(44,54,57,0.88) 100%)" }} />
          <div className="absolute inset-0 z-10 opacity-[0.05] pointer-events-none" style={{ backgroundImage: "radial-gradient(#DCD7C9 1px, transparent 1px)", backgroundSize: "28px 28px" }} />

          <div className="container relative z-20 px-6 max-w-4xl mx-auto">
            {/* Dark glass wordmark */}
            <div className="flex justify-center mb-8">
              <div
                className="inline-flex items-center justify-center px-14 md:px-20 pt-4 pb-7 md:pt-5 md:pb-8 rounded-[2.5rem]"
                style={{
                  background: "rgba(15, 23, 42, 0.35)",
                  backdropFilter: "blur(18px)",
                  WebkitBackdropFilter: "blur(18px)",
                  border: "1px solid rgba(255,255,255,0.15)",
                  boxShadow: "0 8px 32px rgba(0,0,0,0.25)",
                }}
              >
                <h1
                  className="text-5xl md:text-7xl tracking-tight leading-none text-center"
                  style={{
                    fontFamily: "'Cairo', sans-serif",
                    fontWeight: 800,
                    color: "#E8C48A",
                  }}
                >
                  العمودي
                </h1>
              </div>
            </div>
            <p className="text-sm md:text-base font-bold text-white max-w-2xl mx-auto leading-relaxed mb-6">
              شريكك الموثوق في عالم التسويق العقاري والتشطيبات، نقدم لك أفضل الفرص العقارية والاستثمارية في مصر.
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              <Button asChild size="lg" className="h-10 px-7 rounded-full font-bold text-sm shadow-lg hover:scale-105 transition-transform duration-300 text-white gap-2"
                style={{ background: "linear-gradient(135deg, #A27B5B, #C49A72)" }}>
                <Link href="/add-property"><Plus className="h-4 w-4" />أضف عقارك لدينا</Link>
              </Button>
              <Button asChild size="lg" className="h-10 px-7 rounded-full font-bold text-sm shadow-lg hover:scale-105 transition-transform duration-300 gap-2"
                style={{ background: "linear-gradient(135deg, #3F4E4F, #2C3639)", color: "#DCD7C9", border: "1px solid rgba(220,215,201,0.3)" }}>
                <Link href="/finishing-services"><Building2 className="h-4 w-4" />خدمات التشطيبات</Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="h-10 px-7 rounded-full font-bold text-sm border-white/40 text-white hover:bg-white/10">
                <Link href="/consultation">اطرح استفسارك</Link>
              </Button>
            </div>
          </div>
        </section>

        {/* ── Search / Filter Widget ── */}
        <div className="container px-6">
          <div className="-mt-6 relative z-20 bg-card border border-border rounded-2xl shadow-[0_8px_40px_-8px_rgba(44,54,57,0.18)] p-5 max-w-3xl mx-auto">
            <div className="relative mb-3">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                className="pr-10 h-10"
                placeholder="ابحث باسم العقار أو كود العقار..."
                value={searchText}
                onChange={e => setSearchText(e.target.value)}
              />
              {searchText && (
                <button className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground" onClick={() => setSearchText("")}>
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>

            <div className="flex flex-wrap justify-center gap-2 mb-2">
              {[{ value: "sale", label: "للبيع" }, { value: "rent", label: "للإيجار" }, { value: "furnished", label: "مفروش" }].map(btn => (
                <button key={btn.value} onClick={() => setSearchCategory(btn.value as typeof searchCategory)}
                  className={cn("px-5 py-1.5 rounded-full text-sm font-medium transition-all",
                    searchCategory === btn.value ? "bg-accent text-white shadow-sm" : "bg-muted text-muted-foreground hover:bg-muted/70")}>
                  {btn.label}
                </button>
              ))}
            </div>

            <div className="flex flex-wrap justify-center gap-2 mb-3">
              {[{ value: "residential", label: "سكني" }, { value: "administrative", label: "إداري" }, { value: "medical", label: "طبي" }, { value: "commercial", label: "تجاري" }].map(btn => (
                <button key={btn.value} onClick={() => setSearchSector(btn.value as typeof searchSector)}
                  className={cn("px-4 py-1 rounded-full text-sm font-medium border transition-all",
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

            {searchText && (
              <div className="mt-4 pt-4 border-t border-border">
                {searchResults.length === 0
                  ? <p className="text-sm text-center text-muted-foreground py-2">لا توجد نتائج للبحث "{searchText}"</p>
                  : (
                    <div>
                      <p className="text-xs text-muted-foreground mb-3">{searchResults.length} نتيجة للبحث</p>
                      <div className="grid grid-cols-1 gap-2 max-h-64 overflow-y-auto">
                        {searchResults.map(p => <PropertyCard key={p.id} property={p} size="compact" />)}
                      </div>
                    </div>
                  )}
              </div>
            )}
          </div>
        </div>

        {/* ── TikTok Section ── */}
        <section className="py-12 md:py-14 bg-background">
          <div className="container px-6">
            {/* Profile header */}
            <div className="flex flex-col items-center text-center mb-9">
              <p className="text-accent text-xs font-medium tracking-widest mb-4 uppercase">محتوى حصري</p>
              {/* Circular avatar */}
              <a
                href={settings.tiktok || "#"}
                {...(settings.tiktok ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                className="block w-20 h-20 md:w-24 md:h-24 rounded-full overflow-hidden border-2 border-accent/40 shadow-md bg-muted hover:scale-105 transition-transform duration-300"
                aria-label="حساب تيك توك"
              >
                {settings.tiktokAvatar ? (
                  <img src={settings.tiktokAvatar} alt={settings.tiktokName || "تيك توك"} className="w-full h-full object-cover" />
                ) : (
                  <span className="w-full h-full flex items-center justify-center bg-accent/10 text-accent">
                    <Music className="h-8 w-8" />
                  </span>
                )}
              </a>
              {/* Account name */}
              <a
                href={settings.tiktok || "#"}
                {...(settings.tiktok ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                className="mt-3 hover:text-accent transition-colors"
              >
                <h2 className="text-xl md:text-2xl font-bold text-foreground">
                  {settings.tiktokName || "العمودي للتسويق العقاري"}
                </h2>
              </a>
              <p className="text-xs text-muted-foreground mt-1">تابعنا على تيك توك</p>
              {/* Follow button */}
              <Button asChild className="mt-4 rounded-full px-8 text-sm gap-2 bg-accent text-white hover:bg-accent/90 shadow-md">
                <a href={settings.tiktok || "#"} {...(settings.tiktok ? { target: "_blank", rel: "noopener noreferrer" } : {})}>
                  <Music className="h-4 w-4" /> تابعنا الآن
                </a>
              </Button>
            </div>

            {tiktokVideos.length === 0 ? (
              <div className="text-center py-10 rounded-2xl border border-dashed border-border bg-muted/30">
                <div className="w-14 h-14 bg-accent/10 rounded-2xl flex items-center justify-center text-accent mx-auto mb-3">
                  <Play className="h-7 w-7" />
                </div>
                <p className="text-sm font-medium text-foreground mb-1">لا توجد فيديوهات حالياً</p>
                <p className="text-xs text-muted-foreground">يمكن للمدير إضافة فيديوهات من لوحة التحكم ← الإعدادات ← تيك توك</p>
                {settings.tiktok && (
                  <a href={settings.tiktok} target="_blank" rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 mt-4 text-xs text-accent hover:underline">
                    زيارة صفحتنا على تيك توك <ExternalLink className="h-3 w-3" />
                  </a>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {tiktokVideos.map(video => (
                  <a
                    key={video.id}
                    href={video.videoUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group block rounded-2xl overflow-hidden border border-border bg-card hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
                  >
                    <div className="relative aspect-video bg-muted overflow-hidden">
                      {video.thumbnail ? (
                        <img src={video.thumbnail} alt={video.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-muted to-muted/50">
                          <Play className="h-10 w-10 text-muted-foreground/40" />
                        </div>
                      )}
                      <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <div className="w-12 h-12 rounded-full bg-white/90 flex items-center justify-center">
                          <Play className="h-5 w-5 text-foreground fill-foreground mr-[-2px]" />
                        </div>
                      </div>
                    </div>
                    <div className="p-4">
                      <p className="text-sm font-semibold text-foreground group-hover:text-accent transition-colors line-clamp-2">{video.title}</p>
                      <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                        <ExternalLink className="h-3 w-3" />مشاهدة على تيك توك
                      </p>
                    </div>
                  </a>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* ── Featured Properties ── */}
        <section className="py-12 md:py-14 bg-[#F5F2EC] dark:bg-background">
          <div className="container px-6">
            <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
              <div>
                <p className="text-accent text-xs font-medium tracking-widest mb-1 uppercase">اختيارات حصرية</p>
                <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-0.5 relative inline-block">
                  عقارات مميزة
                  <div className="absolute -bottom-2 right-0 w-12 h-0.5 bg-accent rounded-full" />
                </h2>
              </div>
              <SizeToggle size={cardSize} onChange={setCardSize} />
            </div>
            {featuredProps.length === 0 ? (
              <div className="text-center py-10 text-muted-foreground">
                <p className="text-sm">لا توجد عقارات مميزة حالياً. يمكن للمدير تفعيلها من لوحة التحكم.</p>
              </div>
            ) : (
              <div className={gridClass}>
                {featuredProps.map(p => <PropertyCard key={p.id} property={p} size={cardSize} />)}
              </div>
            )}
          </div>
        </section>

        {/* ── Latest Properties ── */}
        <section className="py-12 md:py-14 bg-background">
          <div className="container px-6">
            <div className="flex flex-wrap justify-between items-end gap-4 mb-8">
              <div>
                <p className="text-accent text-xs font-medium tracking-widest mb-1 uppercase">جديدنا</p>
                <h2 className="text-2xl md:text-3xl font-bold text-foreground">أحدث العقارات</h2>
                <p className="text-sm text-muted-foreground mt-1">تصفح أحدث ما أضيف لمجموعتنا العقارية</p>
              </div>
              <SizeToggle size={cardSize} onChange={setCardSize} />
            </div>
            <div className={gridClass}>
              {latestProps.length === 0
                ? [1, 2, 3].map(i => <PropertyCard key={i} isLoading size={cardSize} />)
                : latestProps.map(p => <PropertyCard key={p.id} property={p} size={cardSize} />)}
            </div>
          </div>
        </section>

        {/* ── Finishing Services Preview ── */}
        <section className="py-12 md:py-14 bg-[#F5F2EC] dark:bg-background">
          <div className="container px-6">
            <div className="text-center mb-8">
              <p className="text-accent text-xs font-medium tracking-widest mb-2 uppercase">خدماتنا</p>
              <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-2">خدمات التشطيبات</h2>
              <p className="text-sm text-muted-foreground max-w-lg mx-auto">نقدم خدمات تشطيب متكاملة لجميع أنواع الوحدات بأعلى مستوى من الجودة وأفضل الأسعار</p>
            </div>
            <div className="text-center">
              <Button asChild size="lg" variant="outline" className="rounded-full px-8 gap-2 border-accent/40 text-accent hover:bg-accent/10">
                <Link href="/finishing-services">
                  <Building2 className="h-4 w-4" />استعرض خدمات التشطيبات
                  <ChevronLeft className="h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        </section>

        {/* ── Add Property CTA ── */}
        <section className="py-12 md:py-14 bg-[#F5F2EC] dark:bg-background">
          <div className="container px-6">
            <div className="max-w-2xl mx-auto text-center bg-card border border-accent/20 rounded-2xl p-8 card-luxury">
              <div className="w-14 h-14 bg-accent/10 rounded-2xl flex items-center justify-center text-accent mx-auto mb-4">
                <UserCheck className="h-7 w-7" />
              </div>
              <h2 className="text-xl md:text-2xl font-bold text-foreground mb-3">هل تمتلك عقاراً للبيع أو الإيجار؟</h2>
              <p className="text-sm text-muted-foreground leading-relaxed mb-6 max-w-md mx-auto">
                أضف عقارك لدينا واحصل على أفضل عرض سعر. نتواصل معك في أقرب وقت.
              </p>
              <div className="flex flex-wrap justify-center gap-3">
                <Button asChild size="lg" className="h-11 px-8 rounded-full font-bold text-sm text-white gap-2"
                  style={{ background: "linear-gradient(135deg, #A27B5B, #C49A72)" }}>
                  <Link href="/add-property"><Plus className="h-4 w-4" />أضف عقارك الآن</Link>
                </Button>
                <Button asChild size="lg" variant="outline" className="h-11 px-8 rounded-full text-sm border-accent/40 text-accent hover:bg-accent/10">
                  <Link href="/consultation">اطرح استفسارك</Link>
                </Button>
              </div>
            </div>
          </div>
        </section>

      </main>
      <Footer />
    </div>
  );
}
