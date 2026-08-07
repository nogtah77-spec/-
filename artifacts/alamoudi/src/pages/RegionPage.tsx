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
        <section className="py-10 md:py-12">
          <div className="container px-3 sm:px-6">

            {/* ── Breadcrumb + header ── */}
            <div className="mb-8">
              <Link
                href="/"
                className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-accent transition-colors mb-4"
              >
                <ChevronRight className="h-4 w-4" />
                الرئيسية
              </Link>

              <div className="flex flex-wrap items-end justify-between gap-4">
                <div>
                  <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-1 relative inline-block">
                    عقارات {region.name}
                    <div className="absolute -bottom-2 right-0 w-12 h-0.5 bg-accent rounded-full" />
                  </h1>
                  <p className="text-sm text-muted-foreground mt-4">
                    {filtered.length === 0
                      ? "لا توجد نتائج للتصفية المحددة"
                      : `${filtered.length} عقار متاح`}
                  </p>
                </div>
              </div>
            </div>

            {/* ── Filter row 1: Transaction type ── */}
            <div className="flex flex-wrap gap-2 mb-3">
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
