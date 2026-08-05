import { useState, useEffect, useMemo } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { PropertyCard } from "@/components/ui/PropertyCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Search,
  UserCheck,
  Plus,
  ChevronLeft,
  X,
  ExternalLink,
  Play,
  Building2,
  MessageCircle,
} from "lucide-react";
import { TikTokIcon } from "@/components/icons/BrandIcons";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { useData, type TiktokVideo } from "@/context/DataContext";
import { FINISHING_OPTIONS } from "@/lib/finishingOptions";
import { extractVideoUrl } from "@/lib/videoThumbnail";
import { cn } from "@/lib/utils";
import { Link } from "wouter";
import { PublicBannerSlot } from "@/components/ui/AdsBanner";
import { PropertyCarousel } from "@/components/ui/PropertyCarousel";

function tiktokId(url: string): string | null {
  const m = url.match(/\/video\/(\d{6,})/);
  return m ? m[1] : null;
}

function TiktokPlayer({ video }: { video: TiktokVideo }) {
  const cleanUrl = extractVideoUrl(video.videoUrl);
  const local = tiktokId(cleanUrl);
  const [id, setId] = useState<string | null>(local);
  const [state, setState] = useState<"ready" | "loading" | "failed">(
    local ? "ready" : "loading",
  );

  useEffect(() => {
    const direct = tiktokId(cleanUrl);
    if (direct) {
      setId(direct);
      setState("ready");
      return;
    }
    let cancelled = false;
    setId(null);
    setState("loading");
    fetch(`/api/tiktok/resolve?url=${encodeURIComponent(cleanUrl)}`)
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((data: { videoId?: string }) => {
        if (cancelled) return;
        if (data.videoId) {
          setId(data.videoId);
          setState("ready");
        } else {
          setState("failed");
        }
      })
      .catch(() => {
        if (!cancelled) setState("failed");
      });
    return () => {
      cancelled = true;
    };
  }, [cleanUrl]);

  return (
    <>
      {state === "loading" ? (
        <div className="w-full h-[60vh] min-h-[480px] bg-black flex items-center justify-center">
          <div className="h-10 w-10 rounded-full border-2 border-white/20 border-t-white animate-spin" />
        </div>
      ) : state === "ready" && id ? (
        <iframe
          src={`https://www.tiktok.com/embed/v2/${id}`}
          title={video.title}
          className="w-full h-[60vh] min-h-[480px] bg-black"
          allow="autoplay; encrypted-media; fullscreen"
          allowFullScreen
        />
      ) : (
        <div className="p-10 text-center">
          <Play className="h-10 w-10 text-muted-foreground/40 mx-auto mb-3" />
          <p className="text-sm text-muted-foreground">
            لا يمكن تشغيل هذا الفيديو داخل الموقع. افتحه على تيك توك.
          </p>
        </div>
      )}
      <div className="p-3 flex items-center justify-between gap-2 border-t border-border bg-card">
        <p className="text-sm font-medium text-foreground line-clamp-1">
          {video.title}
        </p>
        <Button
          asChild
          size="sm"
          variant="outline"
          className="gap-1.5 flex-shrink-0"
        >
          <a href={cleanUrl} target="_blank" rel="noopener noreferrer">
            <ExternalLink className="h-3.5 w-3.5" />
            فتح في تيك توك
          </a>
        </Button>
      </div>
    </>
  );
}

function TiktokCard({
  video,
  onPlay,
}: {
  video: TiktokVideo;
  onPlay: () => void;
}) {
  const [failed, setFailed] = useState(false);
  const src = video.thumbnail
    ? video.thumbnail
    : `/api/tiktok/thumbnail?url=${encodeURIComponent(extractVideoUrl(video.videoUrl))}`;
  return (
    <button
      onClick={onPlay}
      className="group block w-full text-right rounded-md overflow-hidden border border-border bg-card hover:shadow-md transition-all duration-300 hover:-translate-y-0.5"
    >
      <div className="relative aspect-[4/5] bg-muted overflow-hidden">
        {!failed ? (
          <img
            src={src}
            alt={video.title}
            loading="lazy"
            referrerPolicy="no-referrer"
            onError={() => setFailed(true)}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-muted to-muted/50">
            <Play className="h-7 w-7 text-muted-foreground/40" />
          </div>
        )}
        <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          <div className="w-10 h-10 rounded-full bg-white/90 flex items-center justify-center">
            <Play className="h-4 w-4 text-foreground fill-foreground mr-[-2px]" />
          </div>
        </div>
      </div>
      <div className="p-2">
        <p className="text-xs font-medium text-foreground group-hover:text-accent transition-colors line-clamp-2 leading-snug">
          {video.title}
        </p>
      </div>
    </button>
  );
}

export default function Home() {
  const { properties, regions, propertyTypes, settings } = useData();
  const [searchCategory, setSearchCategory] = useState<
    "sale" | "rent" | "furnished"
  >("sale");
  const [searchSector, setSearchSector] = useState<
    "residential" | "administrative" | "medical" | "commercial"
  >("residential");
  const [selectedRegion, setSelectedRegion] = useState("");
  const [selectedType, setSelectedType] = useState("");
  const [selectedFinishing, setSelectedFinishing] = useState("");
  const [searchText, setSearchText] = useState("");
  const [filtersApplied, setFiltersApplied] = useState(false);
  const resolve = (p: any) => ({
    ...p,
    typeName: propertyTypes.find((t) => t.id === p.typeId)?.name,
    regionName: regions.find((r) => r.id === p.regionId)?.name,
  });

  const featuredProps = useMemo(
    () => properties.filter((p) => p.featured).map(resolve),
    [properties, propertyTypes, regions],
  );
  const latestProps = useMemo(
    () =>
      [...properties]
        .filter((p) => !p.featured)
        .reverse()
        .slice(0, 6)
        .map(resolve),
    [properties, propertyTypes, regions],
  );

  const propertiesByRegion = useMemo(() => {
    const groups = new Map<string, { name: string; items: any[] }>();
    for (const p of properties) {
      const region = regions.find((r) => r.id === p.regionId);
      if (!region || !region.active) continue;
      if (!groups.has(p.regionId))
        groups.set(p.regionId, { name: region.name, items: [] });
      groups.get(p.regionId)!.items.push(resolve(p));
    }
    return [...groups.entries()]
      .map(([id, { name, items }]) => ({ id, name, items }))
      .filter((g) => g.items.length > 0)
      .sort((a, b) => b.items.length - a.items.length);
  }, [properties, regions, propertyTypes]);

  // Normalise a finishing string for comparison: collapse whitespace so that
  // "ألترا سوبرلوكس" and "ألترا سوبر لوكس" both produce the same key.
  const normFin = (s: string) => (s || "").trim().replace(/\s+/g, "");

  const isFiltering = filtersApplied || searchText.trim() !== "";

  // Maps each non-residential sector button to the typeIds that belong to it.
  // Residential has no explicit group — it's everything NOT in the other groups.
  const SECTOR_TYPE_GROUPS: Record<string, string[]> = {
    administrative: ["office"],
    medical: ["clinic", "medical_center", "pharmacy"],
    commercial: ["shop", "restaurant", "cafe"],
  };

  const filterResults = useMemo(() => {
    let list = properties;
    const q = searchText.trim().toLowerCase();
    if (q) {
      list = list.filter((p) => {
        const regionName = regions.find((r) => r.id === p.regionId)?.name ?? "";
        const typeName =
          propertyTypes.find((t) => t.id === p.typeId)?.name ?? "";
        const hay = [
          p.title,
          p.code,
          p.description,
          p.location,
          p.subArea,
          p.finishing,
          p.view,
          p.unitType,
          regionName,
          typeName,
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();
        return hay.includes(q);
      });
    }
    if (filtersApplied) {
      // Always filter by the sale / rent / furnished category tab
      list = list.filter((p) => p.category === searchCategory);
      // For non-residential sectors, additionally narrow by property type group
      if (searchSector !== "residential") {
        const group = SECTOR_TYPE_GROUPS[searchSector] ?? [];
        if (group.length) list = list.filter((p) => group.includes(p.typeId));
      }
      if (selectedRegion)
        list = list.filter((p) => p.regionId === selectedRegion);
      if (selectedType) list = list.filter((p) => p.typeId === selectedType);
      if (selectedFinishing)
        list = list.filter(
          (p) => normFin(p.finishing) === normFin(selectedFinishing),
        );
    }
    return list.map(resolve);
  }, [
    properties,
    searchText,
    filtersApplied,
    searchCategory,
    searchSector,
    selectedRegion,
    selectedType,
    selectedFinishing,
    propertyTypes,
    regions,
  ]);

  const clearFilters = () => {
    setSearchText("");
    setSelectedRegion("");
    setSelectedType("");
    setSelectedFinishing("");
    setSearchCategory("sale");
    setSearchSector("residential");
    setFiltersApplied(false);
  };

  const heroImage =
    settings.heroImageUrl ||
    "https://images.unsplash.com/photo-1613977257363-707ba9348227?w=1920&q=80";
  const heroOverlay =
    Math.min(100, Math.max(0, settings.heroOverlayOpacity ?? 85)) / 100;
  const tiktokVideos = (settings.tiktokVideos ?? []).slice(0, 3);
  const [activeVideo, setActiveVideo] = useState<TiktokVideo | null>(null);

  const gridClass = "grid grid-cols-1 md:grid-cols-2 gap-3";

  const videoGridClass =
    "grid grid-cols-3 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-8 gap-2.5";

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">
        {/* ── 3 Action Buttons — البلاط المتساوية ── */}
        <div className="container px-3 sm:px-6 pt-4 sm:pt-5 pb-3 sm:pb-4">
          <div className="flex gap-2 sm:gap-3 max-w-3xl mx-auto">
            <Link
              href="/add-property"
              className="flex-1 flex flex-col items-center justify-center gap-1 sm:gap-2 rounded-md py-4 sm:py-5 shadow-sm hover:scale-[1.02] active:scale-[0.98] transition-all duration-[180ms] text-white font-bold text-[10px] sm:text-sm select-none cursor-pointer"
              style={{
                background: "linear-gradient(135deg, #9A7F59, #B4986B)",
              }}
            >
              <Plus className="h-4 w-4 sm:h-6 sm:w-6" />
              أعرض عقارك لدينا
            </Link>
            <Link
              href="/finishing-services"
              className="flex-1 flex flex-col items-center justify-center gap-1 sm:gap-2 rounded-md py-4 sm:py-5 shadow-sm hover:scale-[1.02] active:scale-[0.98] transition-transform duration-200 font-bold text-[10px] sm:text-sm select-none"
              style={{
                background: "linear-gradient(135deg, #0d1a24, #10202D)",
                color: "#F7F7F7",
                border: "1px solid rgba(255,255,255,0.10)",
              }}
            >
              <Building2 className="h-4 w-4 sm:h-6 sm:w-6" />
              خدمات التشطيبات
            </Link>
            <Link
              href="/consultation"
              className="flex-1 flex flex-col items-center justify-center gap-1 sm:gap-2 rounded-md py-4 sm:py-5 hover:scale-[1.02] active:scale-[0.98] transition-transform duration-200 font-bold text-[10px] sm:text-sm text-foreground select-none"
              style={{ border: "1.5px solid #B4986B" }}
            >
              <MessageCircle
                className="h-4 w-4 sm:h-6 sm:w-6"
                style={{ color: "#B4986B" }}
              />
              اطرح استفسارك
            </Link>
          </div>
        </div>

        {/* ── الصندوق العلوي: بانرات ذكية (top slot) — يختفي تلقائيًا لو فاضي ── */}
        {!isFiltering && <PublicBannerSlot slot="top" ads={[]} />}

        {/* ── الصندوق السفلي: إعلانات عادية + بانرات ذكية (bottom slot) — يختفي تلقائيًا لو فاضي ── */}
        {!isFiltering && (
          <PublicBannerSlot slot="bottom" ads={settings.ads ?? []} />
        )}

        {/* ── Search / Filter Widget ── */}
        <div className="container px-6">
          <div className="relative z-20 bg-card border border-border rounded-lg shadow-[0_2px_12px_rgba(0,0,0,0.07)] p-5 max-w-3xl mx-auto">
            <div className="relative mb-3">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                className="pr-10 h-10"
                placeholder="ابحث بالكود، اسم العقار، المنطقة، النوع، التشطيب..."
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
              />
              {searchText && (
                <button
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  onClick={() => setSearchText("")}
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>

            <div className="flex flex-wrap justify-center gap-2 mb-2">
              {[
                { value: "sale", label: "للبيع" },
                { value: "rent", label: "للإيجار" },
                { value: "furnished", label: "مفروش" },
              ].map((btn) => (
                <button
                  key={btn.value}
                  onClick={() =>
                    setSearchCategory(btn.value as typeof searchCategory)
                  }
                  className={cn(
                    "h-9 px-5 rounded-sm text-sm font-semibold whitespace-nowrap",
                    "inline-flex items-center justify-center cursor-pointer",
                    "transition-all duration-[180ms] ease-out",
                    searchCategory === btn.value
                      ? "bg-accent text-white shadow-[0_2px_8px_rgba(180,152,107,0.30)]"
                      : "bg-muted text-muted-foreground hover:bg-accent/10 hover:text-accent",
                  )}
                >
                  {btn.label}
                </button>
              ))}
            </div>

            <div className="flex flex-wrap justify-center gap-1.5 sm:gap-2 mb-3">
              {[
                { value: "residential", label: "سكني" },
                { value: "administrative", label: "إداري" },
                { value: "medical", label: "طبي" },
                { value: "commercial", label: "تجاري" },
              ].map((btn) => (
                <button
                  key={btn.value}
                  onClick={() =>
                    setSearchSector(btn.value as typeof searchSector)
                  }
                  className={cn(
                    "h-9 px-4 rounded-sm text-sm font-semibold border whitespace-nowrap",
                    "inline-flex items-center justify-center cursor-pointer",
                    "transition-all duration-[180ms] ease-out",
                    searchSector === btn.value
                      ? "border-accent bg-accent text-white shadow-[0_2px_8px_rgba(180,152,107,0.30)]"
                      : "border-border text-muted-foreground hover:border-accent/50 hover:text-accent",
                  )}
                >
                  {btn.label}
                </button>
              ))}
            </div>

            <div className="flex flex-wrap gap-2 justify-center">
              <Select value={selectedRegion} onValueChange={setSelectedRegion}>
                <SelectTrigger className="w-full sm:w-40 h-9 text-sm">
                  <SelectValue placeholder="المنطقة" />
                </SelectTrigger>
                <SelectContent>
                  {regions
                    .filter((r) => r.active)
                    .map((r) => (
                      <SelectItem key={r.id} value={r.id}>
                        {r.name}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
              <Select value={selectedType} onValueChange={setSelectedType}>
                <SelectTrigger className="w-full sm:w-44 h-9 text-sm">
                  <SelectValue placeholder="نوع العقار" />
                </SelectTrigger>
                <SelectContent>
                  {propertyTypes
                    .filter((t) => t.active)
                    .map((t) => (
                      <SelectItem key={t.id} value={t.id}>
                        {t.name}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
              <Select
                value={selectedFinishing}
                onValueChange={setSelectedFinishing}
              >
                <SelectTrigger className="w-full sm:w-40 h-9 text-sm">
                  <SelectValue placeholder="التشطيب" />
                </SelectTrigger>
                <SelectContent>
                  {FINISHING_OPTIONS.map((o) => (
                    <SelectItem key={o.value} value={o.value}>
                      {o.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button
                className="h-9 px-6 bg-accent text-white hover:bg-accent/90 text-sm font-medium gap-1.5"
                data-testid="button-search"
                onClick={() => setFiltersApplied(true)}
              >
                <Search className="h-4 w-4" />
                بحث
              </Button>
              {isFiltering && (
                <Button
                  variant="outline"
                  className="h-9 px-5 text-sm font-medium gap-1.5 border-accent/40 text-accent hover:bg-accent/10"
                  data-testid="button-clear-filters"
                  onClick={clearFilters}
                >
                  <X className="h-4 w-4" />
                  مسح الفلاتر
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* ── Filter / Search Results ── */}
        {isFiltering && (
          <section className="py-10 md:py-12 bg-background">
            <div className="container px-6">
              <div className="flex flex-wrap items-center justify-between gap-4 mb-7">
                <div>
                  <p className="text-accent text-xs font-medium tracking-widest mb-1 uppercase">
                    نتائج البحث
                  </p>
                  <h2 className="text-2xl md:text-3xl font-bold text-foreground">
                    العقارات المطابقة
                  </h2>
                  <p className="text-sm text-muted-foreground mt-1">
                    {filterResults.length} عقار
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <Button
                    variant="outline"
                    className="h-8 gap-1.5 border-accent/40 text-accent hover:bg-accent/10 text-sm"
                    onClick={clearFilters}
                  >
                    <X className="h-4 w-4" />
                    مسح الفلاتر
                  </Button>
                </div>
              </div>
              {filterResults.length === 0 ? (
                <div className="text-center py-16 text-muted-foreground">
                  <Search className="h-10 w-10 text-muted-foreground/30 mx-auto mb-3" />
                  <p className="text-sm">لا توجد عقارات مطابقة لبحثك.</p>
                </div>
              ) : (
                <div className={gridClass}>
                  {filterResults.map((p) => (
                    <PropertyCard key={p.id} property={p} size="compact" />
                  ))}
                </div>
              )}
            </div>
          </section>
        )}

        {/* ── TikTok Section ── */}
        {!isFiltering && (
          <section className="py-4 md:py-5 bg-background">
            <div className="container px-4 sm:px-6">
              <div className="max-w-3xl mx-auto">
                <div className="relative overflow-hidden rounded-lg border border-border bg-gradient-to-br from-card via-card to-accent/5 shadow-sm p-3 sm:p-4">
                  <div
                    className="absolute inset-0 opacity-[0.04] pointer-events-none"
                    style={{
                      backgroundImage:
                        "radial-gradient(#B4986B 1px, transparent 1px)",
                      backgroundSize: "20px 20px",
                    }}
                  />
                  <div className="relative flex flex-row items-center gap-3 sm:gap-4">
                    {/* ── عمود البروفايل (يمين في RTL) ── */}
                    <div className="flex flex-col items-center gap-2 shrink-0 border-l border-border pl-3 sm:pl-4">
                      {/* صورة الحساب */}
                      <div className="relative">
                        <a
                          href={settings.tiktok || "#"}
                          {...(settings.tiktok
                            ? { target: "_blank", rel: "noopener noreferrer" }
                            : {})}
                          className="block w-16 h-16 sm:w-20 sm:h-20 rounded-lg overflow-hidden border-2 border-accent/40 shadow-md bg-muted hover:scale-105 transition-transform duration-300"
                          aria-label="حساب تيك توك"
                        >
                          {settings.tiktokAvatar ? (
                            <img
                              src={settings.tiktokAvatar}
                              alt={settings.tiktokName || "تيك توك"}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <span className="w-full h-full flex items-center justify-center bg-accent/10 text-accent">
                              <TikTokIcon className="h-5 w-5" />
                            </span>
                          )}
                        </a>
                        {/* شارة تيك توك */}
                        <span className="absolute -bottom-1 -left-1 inline-flex items-center justify-center w-4 h-4 rounded-full bg-foreground text-background shadow border-2 border-card">
                          <TikTokIcon className="h-2 w-2" />
                        </span>
                      </div>

                      {/* اسم الحساب — سطر واحد دائماً */}
                      <a
                        href={settings.tiktok || "#"}
                        {...(settings.tiktok
                          ? { target: "_blank", rel: "noopener noreferrer" }
                          : {})}
                        className="text-center hover:text-accent transition-colors"
                      >
                        <p className="text-[10px] sm:text-[11px] font-bold text-foreground leading-snug whitespace-nowrap text-center">
                          {settings.tiktokName || "العمودي للتسويق العقاري"}
                        </p>
                      </a>

                      {/* زر المتابعة */}
                      <a
                        href={settings.tiktok || "#"}
                        {...(settings.tiktok
                          ? { target: "_blank", rel: "noopener noreferrer" }
                          : {})}
                        className="w-full inline-flex items-center justify-center gap-1 rounded-sm bg-foreground text-background hover:bg-foreground/80 transition-colors text-[11px] font-semibold h-7 px-2 shadow-sm"
                      >
                        <TikTokIcon className="h-2.5 w-2.5 shrink-0" />
                        <span>متابعة</span>
                      </a>
                    </div>

                    {/* ── الفيديوهات (يسار في RTL) ── */}
                    <div className="flex-1 min-w-0">
                      {tiktokVideos.length === 0 ? (
                        <div className="flex flex-col items-center justify-center rounded-md border border-dashed border-border bg-muted/30 gap-2 h-full min-h-[120px]">
                          <Play className="h-5 w-5 text-accent/40" />
                          <p className="text-xs text-muted-foreground">
                            لا توجد فيديوهات حالياً
                          </p>
                          <a
                            href={settings.tiktok || "#"}
                            {...(settings.tiktok
                              ? { target: "_blank", rel: "noopener noreferrer" }
                              : {})}
                            className="inline-flex items-center gap-1 text-xs text-accent hover:underline"
                          >
                            زيارة الحساب <ExternalLink className="h-3 w-3" />
                          </a>
                        </div>
                      ) : (
                        <div className="grid grid-cols-3 gap-2.5">
                          {tiktokVideos.map((video) => (
                            <TiktokCard
                              key={video.id}
                              video={video}
                              onPlay={() => setActiveVideo(video)}
                            />
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* TikTok player modal */}
        <Dialog
          open={!!activeVideo}
          onOpenChange={(o) => {
            if (!o) setActiveVideo(null);
          }}
        >
          <DialogContent className="max-w-[360px] p-0 overflow-hidden gap-0">
            <DialogTitle className="sr-only">
              {activeVideo?.title || "فيديو تيك توك"}
            </DialogTitle>
            {activeVideo && (
              <TiktokPlayer key={activeVideo.id} video={activeVideo} />
            )}
          </DialogContent>
        </Dialog>

        {!isFiltering && (
          <>
            {/* ── Featured Properties ── */}
            <section className="py-12 md:py-14 bg-muted dark:bg-background">
              <div className="container px-6">
                <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
                  <div>
                    <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-0.5 relative inline-block">
                      عقارات مميزة
                      <div className="absolute -bottom-2 right-0 w-12 h-0.5 bg-accent rounded-full" />
                    </h2>
                  </div>
                </div>
                {featuredProps.length === 0 ? (
                  <div className="text-center py-10 text-muted-foreground">
                    <p className="text-sm">لا توجد عقارات مميزة حالياً.</p>
                  </div>
                ) : (
                  <div className={gridClass}>
                    {featuredProps.map((p) => (
                      <PropertyCard key={p.id} property={p} size="compact" />
                    ))}
                  </div>
                )}
              </div>
            </section>

            {/* ── Latest Properties — Carousel ── */}
            <section className="py-12 md:py-14 bg-background">
              <div className="container px-6">
                <div className="flex flex-wrap justify-between items-end gap-4 mb-8">
                  <div>
                    <h2 className="text-2xl md:text-3xl font-bold text-foreground">
                      أحدث العقارات
                    </h2>
                    <p className="text-sm text-muted-foreground mt-1">
                      تصفح أحدث ما أضيف لمجموعتنا العقارية
                    </p>
                  </div>
                </div>
                {latestProps.length === 0 ? (
                  <div className="flex gap-4 overflow-hidden">
                    {[1, 2, 3].map((i) => (
                      <div
                        key={i}
                        className="flex-shrink-0 w-[82vw] sm:w-[46vw] md:w-[268px] lg:w-[280px]"
                      >
                        <PropertyCard isLoading size="compact" />
                      </div>
                    ))}
                  </div>
                ) : (
                  <PropertyCarousel
                    properties={latestProps}
                    autoPlay
                    autoPlayDelay={3500}
                    infinite
                    randomStart
                  />
                )}
              </div>
            </section>

            {/* ── Explore All Properties — grouped by region ── */}
            {propertiesByRegion.length > 0 && (
              <section className="py-12 md:py-14 bg-muted dark:bg-background">
                <div className="container px-6">
                  <div className="mb-10">
                    <h2 className="text-2xl md:text-3xl font-bold text-foreground relative inline-block">
                      استكشف جميع العقارات
                      <div className="absolute -bottom-2 right-0 w-12 h-0.5 bg-accent rounded-full" />
                    </h2>
                    <p className="text-sm text-muted-foreground mt-4">
                      تصفح عقاراتنا مرتبةً حسب المدينة والمنطقة
                    </p>
                  </div>

                  <div className="space-y-12">
                    {propertiesByRegion.map(({ id, name, items }) => (
                      <div key={id}>
                        <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
                          <div className="flex items-center gap-2.5">
                            <h3 className="text-lg font-bold text-foreground">
                              {name}
                            </h3>
                            <span className="text-xs text-muted-foreground bg-background border border-border px-2 py-0.5 rounded-sm">
                              {items.length} عقار
                            </span>
                          </div>
                          <Button
                            asChild
                            variant="outline"
                            size="sm"
                            className="gap-1.5 border-accent/30 text-accent hover:bg-accent/10 rounded-md text-xs h-8"
                          >
                            <Link href={`/region/${id}`}>
                              عرض جميع عقارات {name}
                              <ChevronLeft className="h-3.5 w-3.5" />
                            </Link>
                          </Button>
                        </div>
                        <PropertyCarousel
                          properties={items.slice(0, 8)}
                          autoPlay
                          autoPlayDelay={3500}
                          infinite
                          randomStart
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </section>
            )}

            {/* ── Finishing Services Preview ── */}
            <section className="py-12 md:py-14 bg-muted dark:bg-background">
              <div className="container px-6">
                <div className="text-center mb-5">
                  <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-2">
                    خدمات التشطيبات
                  </h2>
                  <p className="text-sm text-muted-foreground max-w-lg mx-auto">
                    نقدم خدمات تشطيب متكاملة لجميع أنواع الوحدات بأعلى مستوى من
                    الجودة وأفضل الأسعار
                  </p>
                </div>
                <div className="text-center">
                  <Button
                    asChild
                    size="lg"
                    variant="outline"
                    className="rounded-md px-8 gap-2 border-accent/40 text-accent hover:bg-accent/10"
                  >
                    <Link href="/finishing-services">
                      <Building2 className="h-4 w-4" />
                      استعرض خدمات التشطيبات
                      <ChevronLeft className="h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              </div>
            </section>

            {/* ── Add Property CTA ── */}
            <section className="py-12 md:py-14 bg-muted dark:bg-background">
              <div className="container px-6">
                <div className="max-w-2xl mx-auto text-center bg-card border border-accent/20 rounded-lg p-8 card-luxury">
                  <div className="w-14 h-14 bg-accent/10 rounded-md flex items-center justify-center text-accent mx-auto mb-4">
                    <UserCheck className="h-7 w-7" />
                  </div>
                  <h2 className="text-xl md:text-2xl font-bold text-foreground mb-3">
                    هل تمتلك عقاراً للبيع أو الإيجار؟
                  </h2>
                  <p className="text-sm text-muted-foreground leading-relaxed mb-6 max-w-md mx-auto">
                    أعرض عقارك لدينا واحصل على أفضل عرض سعر. نتواصل معك في أقرب
                    وقت.
                  </p>
                  <div className="flex flex-nowrap justify-center gap-2 sm:gap-3">
                    <Button
                      asChild
                      size="lg"
                      className="h-9 sm:h-11 px-4 sm:px-8 rounded-md font-bold text-xs sm:text-sm text-white gap-1.5 sm:gap-2 shrink-0"
                      style={{
                        background: "linear-gradient(135deg, #9A7F59, #B4986B)",
                      }}
                    >
                      <Link href="/add-property">
                        <Plus className="h-3.5 w-3.5 sm:h-4 sm:w-4 shrink-0" />
                        أعرض عقارك الآن
                      </Link>
                    </Button>
                    <Button
                      asChild
                      size="lg"
                      variant="outline"
                      className="h-9 sm:h-11 px-4 sm:px-8 rounded-md text-xs sm:text-sm border-accent/40 text-accent hover:bg-accent/10 shrink-0"
                    >
                      <Link href="/consultation">اطرح استفسارك</Link>
                    </Button>
                  </div>
                </div>
              </div>
            </section>
          </>
        )}
      </main>
      <Footer />
    </div>
  );
}
