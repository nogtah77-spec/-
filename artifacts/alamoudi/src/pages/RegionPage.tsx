import { useState, useMemo, useCallback, useEffect } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { PropertyCard } from "@/components/ui/PropertyCard";
import { Button } from "@/components/ui/button";
import { useData } from "@/context/DataContext";
import { ChevronRight } from "lucide-react";
import { Link } from "wouter";
import { PropertyFilterPanel } from "@/components/ui/PropertyFilterPanel";
import {
  DEFAULT_PROPERTY_FILTERS,
  filterProperties,
  hasActivePropertyFilters,
  PROPERTY_CARD_SIZE_KEY,
  type PropertyFilterState,
} from "@/lib/propertyFilters";

export default function RegionPage({ params }: { params: { regionId: string } }) {
  const { regionId } = params;
  const { properties, regions, propertyTypes } = useData();

  const region = regions.find(r => r.id === regionId);
  const getInitialCardSize = () => {
    try {
      const stored = localStorage.getItem(PROPERTY_CARD_SIZE_KEY);
      return stored === "medium" ? "medium" as const : "compact" as const;
    } catch {
      return "compact" as const;
    }
  };

  const [filters, setFilters] = useState<PropertyFilterState>({
    ...DEFAULT_PROPERTY_FILTERS,
    regionId,
    viewMode: getInitialCardSize() === "medium" ? "grid" : "list",
    cardSize: getInitialCardSize(),
  });
  const [appliedFilters, setAppliedFilters] = useState<PropertyFilterState>({
    ...DEFAULT_PROPERTY_FILTERS,
    regionId,
    viewMode: getInitialCardSize() === "medium" ? "grid" : "list",
    cardSize: getInitialCardSize(),
  });
  useEffect(() => {
    try {
      localStorage.setItem(PROPERTY_CARD_SIZE_KEY, filters.cardSize);
    } catch {}
  }, [filters.cardSize]);
  const [heroImageFailed, setHeroImageFailed] = useState(false);
  const resolve = useCallback((p: any) => ({
    ...p,
    typeName:   propertyTypes.find(t => t.id === p.typeId)?.name,
    regionName: region?.name,
  }), [propertyTypes, region]);

  const filtered = useMemo(() => {
    return filterProperties(properties, appliedFilters, regions, propertyTypes).map(resolve);
  }, [properties, appliedFilters, regions, propertyTypes, resolve]);

  const gridClass = "grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4";
  const applyFilters = (next: PropertyFilterState) => {
    const fixed = { ...next, regionId };
    setFilters(fixed);
    setAppliedFilters(fixed);
  };
  const resetFilters = () => {
    const reset = { ...DEFAULT_PROPERTY_FILTERS, regionId, viewMode: filters.viewMode, cardSize: filters.cardSize };
    setFilters(reset);
    setAppliedFilters(reset);
  };

  /* ── Not found ── */
  if (!region) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <p className="text-lg font-medium text-foreground mb-2">لم يتم العثور على المنطقة</p>
            <Button asChild variant="outline" className="gap-2 rounded-md">
              <Link href="/">
                <ChevronRight className="h-4 w-4" />
                العودة للرئيسية
              </Link>
            </Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">
        <section className="relative isolate h-[clamp(220px,25vw,320px)] w-full overflow-hidden bg-primary">
          {region.heroImage && !heroImageFailed ? (
            <img
              src={region.heroImage}
              alt=""
              className="absolute inset-0 h-full w-full object-cover object-center"
              onError={() => setHeroImageFailed(true)}
            />
          ) : (
            <div className="absolute inset-0 bg-[var(--gradient-hero)]" />
          )}
          <div className="absolute inset-0 bg-black/25" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/15 to-transparent" />
          <div className="relative z-10 flex h-full items-center justify-center px-4 text-center text-white">
            <div className="max-w-3xl drop-shadow-[0_2px_8px_rgba(0,0,0,0.75)]">
              <h1 className="font-sans text-2xl font-black leading-tight tracking-tight text-white sm:text-3xl md:text-5xl">
                {region.name}
              </h1>
              <nav aria-label="التنقل" className="mt-5 flex items-center justify-center gap-2.5 text-xs font-semibold text-white/95 sm:mt-7 sm:gap-3 sm:text-sm">
                <Link href="/" className="transition-colors hover:text-accent">الرئيسية</Link>
                <ChevronRight className="h-4 w-4 rotate-180 text-white/75" />
                <span className="text-white">{region.name}</span>
              </nav>
            </div>
          </div>
        </section>

        <section className="py-3 sm:py-4 md:py-5">
          <div className="container px-3 sm:px-6">

            <div className="mb-5 sm:mb-7">
              {/* عنوان النتائج في بطاقة مستقلة عن لوحة الفلاتر */}
              <div className="rounded-xl border border-border/80 bg-card px-4 py-4 shadow-sm sm:px-6 sm:py-5">
                <div className="flex flex-wrap items-end justify-between gap-3">
                  <div>
                    <p className="mb-1 text-xs font-medium tracking-wide text-accent">استكشف عقارات المدينة</p>
                    <h2 className="text-xl font-bold text-foreground sm:text-2xl">
                      عقارات {region.name}
                    </h2>
                    <div className="mt-2 h-0.5 w-12 rounded-full bg-accent" />
                  </div>
                  <p className="text-xs text-muted-foreground">استخدم الفلاتر للوصول إلى العقار المناسب</p>
                </div>
              </div>
            </div>

            <div className="mb-7 sm:mb-9">
              <PropertyFilterPanel
                filters={filters}
                regions={regions}
                propertyTypes={propertyTypes}
                fixedRegionId={regionId}
                cityName={region.name}
                resultCount={filtered.length}
                showMatched={hasActivePropertyFilters({ ...appliedFilters, regionId: "" })}
                onChange={(next) => setFilters({ ...next, regionId })}
                onApply={applyFilters}
                onReset={resetFilters}
              />
            </div>

            {/* ── Results ── */}
            {filtered.length === 0 ? (
              <div className="text-center py-20 text-muted-foreground">
                <p className="text-sm">لا توجد عقارات تطابق التصفية المحددة في {region.name}.</p>
                <button
                  onClick={resetFilters}
                  className="mt-4 text-accent text-sm hover:underline"
                >
                  إعادة ضبط الفلاتر
                </button>
              </div>
            ) : (
              <div className={filters.viewMode === "list" ? "grid grid-cols-1 gap-3" : gridClass}>
                {filtered.map(p => (
                  <PropertyCard
                    key={p.id}
                    property={p}
                    size={filters.cardSize}
                    layout={filters.viewMode}
                    emphasized
                  />
                ))}
              </div>
            )}

          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
