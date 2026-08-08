import { useState, useMemo, useCallback } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { PropertyCard } from "@/components/ui/PropertyCard";
import { Button } from "@/components/ui/button";
import { useData } from "@/context/DataContext";
import { ChevronRight } from "lucide-react";
import { Link } from "wouter";
import { cn } from "@/lib/utils";

const CATEGORY_FILTERS = [
  { value: "all",       label: "الكل"     },
  { value: "sale",      label: "للبيع"    },
  { value: "rent",      label: "للإيجار"  },
  { value: "furnished", label: "مفروش"    },
] as const;

const SECTOR_FILTERS = [
  { value: "all",            label: "الكل"    },
  { value: "residential",    label: "سكني"    },
  { value: "commercial",     label: "تجاري"   },
  { value: "administrative", label: "إداري"   },
  { value: "medical",        label: "طبي"     },
] as const;

type CategoryFilter = typeof CATEGORY_FILTERS[number]["value"];
type SectorFilter   = typeof SECTOR_FILTERS[number]["value"];

function FilterChip({
  label, active, onClick,
}: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "px-4 py-1.5 rounded-sm text-sm font-medium transition-all duration-150 border",
        active
          ? "bg-accent text-white border-accent shadow-sm"
          : "bg-card text-muted-foreground border-border hover:border-accent/40 hover:text-foreground",
      )}
    >
      {label}
    </button>
  );
}

export default function RegionPage({ params }: { params: { regionId: string } }) {
  const { regionId } = params;
  const { properties, regions, propertyTypes } = useData();

  const region = regions.find(r => r.id === regionId);

  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>("all");
  const [sectorFilter,   setSectorFilter  ] = useState<SectorFilter  >("all");
  const [heroImageFailed, setHeroImageFailed] = useState(false);
  // The supplied Shorouk reference is a finished hero screenshot and already
  // contains its title and breadcrumb. Other city images remain dynamic.
  const heroContainsPageHeading = region?.id === "shorouk" && !!region?.heroImage;
  const resolve = useCallback((p: any) => ({
    ...p,
    typeName:   propertyTypes.find(t => t.id === p.typeId)?.name,
    regionName: region?.name,
  }), [propertyTypes, region]);

  const filtered = useMemo(() => {
    let list = properties.filter(p => p.regionId === regionId);

    // Row 1 — transaction type
    if (categoryFilter !== "all") {
      list = list.filter(p => p.category === categoryFilter);
    }

    // Row 2 — sector
    if (sectorFilter !== "all") {
      if (sectorFilter === "residential") {
        list = list.filter(p => ["sale", "rent", "furnished"].includes(p.category));
      } else {
        list = list.filter(p => p.category === sectorFilter);
      }
    }

    return list.map(resolve);
  }, [properties, regionId, categoryFilter, sectorFilter, resolve]);

  const gridClass = "grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4";

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
        {/* The hero is intentionally compact: it fills the same visual band
            between the navigation edge and the first filter controls in the
            reference, while scaling continuously across viewports. */}
        <section className="relative isolate h-[clamp(150px,17.4vw,224px)] w-full overflow-hidden bg-primary">
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
          <div className="absolute inset-0 bg-primary/45" />
          <div className="absolute inset-0 bg-gradient-to-t from-primary/75 via-primary/20 to-primary/35" />
          {!heroContainsPageHeading && (
            <div className="relative z-10 flex h-full items-center justify-center px-4 text-center text-white">
              <div className="max-w-3xl">
                <h1 className="text-2xl font-extrabold tracking-tight drop-shadow-md sm:text-3xl md:text-5xl">
                  مدينة {region.name.replace(/^مدينة\s+/, "")}
                </h1>
                <nav aria-label="التنقل" className="mt-2 flex items-center justify-center gap-1.5 text-[11px] text-white/80 sm:text-sm">
                  <Link href="/" className="transition-colors hover:text-accent">الرئيسية</Link>
                  <ChevronRight className="h-3.5 w-3.5 rotate-180" />
                  <span>{region.name}</span>
                </nav>
              </div>
            </div>
          )}
        </section>

        <section className="py-6 sm:py-8 md:py-10">
          <div className="container px-3 sm:px-6">

            {/* ── Result heading ── */}
            <div className="mb-5 flex flex-wrap items-end justify-between gap-3 sm:mb-7">
              <div>
                <h2 className="text-xl font-bold text-foreground sm:text-2xl">
                  عقارات {region.name}
                  <span className="mr-2 text-sm font-normal text-muted-foreground">
                    ({filtered.length})
                  </span>
                </h2>
                <div className="mt-2 h-0.5 w-12 rounded-full bg-accent" />
              </div>
            </div>

            {/* ── Filter row 1: Transaction type ── */}
            <div className="flex flex-wrap gap-2 mb-3" aria-label="نوع العرض">
              {CATEGORY_FILTERS.map(f => (
                <FilterChip
                  key={f.value}
                  label={f.label}
                  active={categoryFilter === f.value}
                  onClick={() => setCategoryFilter(f.value)}
                />
              ))}
            </div>

            {/* ── Filter row 2: Sector ── */}
            <div className="flex flex-wrap gap-2 mb-8">
              {SECTOR_FILTERS.map(f => (
                <FilterChip
                  key={f.value}
                  label={f.label}
                  active={sectorFilter === f.value}
                  onClick={() => setSectorFilter(f.value)}
                />
              ))}
            </div>

            {/* ── Results ── */}
            {filtered.length === 0 ? (
              <div className="text-center py-20 text-muted-foreground">
                <p className="text-sm">لا توجد عقارات تطابق التصفية المحددة في {region.name}.</p>
                <button
                  onClick={() => { setCategoryFilter("all"); setSectorFilter("all"); }}
                  className="mt-4 text-accent text-sm hover:underline"
                >
                  إعادة ضبط الفلاتر
                </button>
              </div>
            ) : (
              <div className={gridClass}>
                {filtered.map(p => (
                  <PropertyCard key={p.id} property={p} size="compact" />
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
