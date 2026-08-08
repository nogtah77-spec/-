import { useState } from "react";
import { Grid2X2, List, RotateCcw, Search, SlidersHorizontal, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { formatNumericInput } from "@/lib/utils";
import { FINISHING_OPTIONS } from "@/lib/finishingOptions";
import {
  CATEGORY_OPTIONS,
  SECTOR_OPTIONS,
  type PropertyFilterState,
} from "@/lib/propertyFilters";
import type { PropertyType, Region } from "@/context/DataContext";

interface PropertyFilterPanelProps {
  filters: PropertyFilterState;
  regions: Region[];
  propertyTypes: PropertyType[];
  fixedRegionId?: string;
  onChange: (filters: PropertyFilterState) => void;
  onApply: (filters: PropertyFilterState) => void;
  onReset: () => void;
  resultCount?: number;
  cityName?: string;
  showMatched?: boolean;
}

function Chip({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "h-9 rounded-md border px-3.5 text-sm font-semibold transition-all",
        active
          ? "border-accent bg-accent text-white shadow-sm"
          : "border-border bg-card text-muted-foreground hover:border-accent/50 hover:text-accent",
      )}
    >
      {label}
    </button>
  );
}

export function PropertyFilterPanel({
  filters,
  regions,
  propertyTypes,
  fixedRegionId,
  onChange,
  onApply,
  onReset,
  resultCount,
  cityName,
  showMatched = false,
}: PropertyFilterPanelProps) {
  const [advancedOpen, setAdvancedOpen] = useState(false);
  const update = (patch: Partial<PropertyFilterState>, applyImmediately = false) => {
    const next = { ...filters, ...patch };
    onChange(next);
    if (applyImmediately) onApply(next);
  };

  return (
    <section className="rounded-lg border border-border bg-card p-3.5 shadow-[0_2px_12px_rgba(0,0,0,0.07)] sm:p-5">
      <div className="relative mb-3">
        <Search className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          className="h-10 pr-10"
          placeholder="ابحث بالكود، اسم العقار، المنطقة، النوع، التشطيب..."
          value={filters.searchText}
          onChange={(event) => update({ searchText: event.target.value }, true)}
        />
        {filters.searchText && (
          <button
            type="button"
            aria-label="مسح البحث"
            className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            onClick={() => update({ searchText: "" }, true)}
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      <div className="mb-3">
        <p className="mb-2 text-xs font-semibold text-muted-foreground">نوع العرض</p>
        <div className="flex flex-wrap justify-center gap-2">
          {CATEGORY_OPTIONS.map((option) => (
            <Chip
              key={option.value}
              label={option.label}
              active={filters.category === option.value}
              onClick={() => update({ category: option.value }, true)}
            />
          ))}
        </div>
      </div>

      <div className="mb-3">
        <p className="mb-2 text-xs font-semibold text-muted-foreground">نوع العقار</p>
        <div className="flex flex-wrap justify-center gap-2">
          {SECTOR_OPTIONS.map((option) => (
            <Chip
              key={option.value}
              label={option.label}
              active={filters.sector === option.value}
              onClick={() => update({ sector: option.value }, true)}
            />
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
        {!fixedRegionId && (
          <Select value={filters.regionId} onValueChange={(value) => update({ regionId: value }, true)}>
            <SelectTrigger className="h-9 text-sm"><SelectValue placeholder="الموقع / المدينة" /></SelectTrigger>
            <SelectContent>
              {regions.filter((region) => region.active).map((region) => (
                <SelectItem key={region.id} value={region.id}>{region.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
        <Select value={filters.typeId} onValueChange={(value) => update({ typeId: value }, true)}>
          <SelectTrigger className="h-9 text-sm"><SelectValue placeholder="نوع العقار" /></SelectTrigger>
          <SelectContent>
            {propertyTypes.filter((type) => type.active).map((type) => (
              <SelectItem key={type.id} value={type.id}>{type.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={filters.finishing} onValueChange={(value) => update({ finishing: value })}>
          <SelectTrigger className="h-9 text-sm"><SelectValue placeholder="حالة التشطيب" /></SelectTrigger>
          <SelectContent>
            {FINISHING_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
        <Button
          type="button"
          variant="outline"
          className="h-9 gap-1.5 border-accent/40 text-accent hover:bg-accent/10"
          onClick={() => setAdvancedOpen((open) => !open)}
        >
          <SlidersHorizontal className="h-4 w-4" />
          {advancedOpen ? "إخفاء الفلاتر المتقدمة" : "فلاتر متقدمة"}
        </Button>
        {cityName && <span className="text-xs text-muted-foreground">المدينة المحددة: {cityName}</span>}
      </div>

      {advancedOpen && (
        <div className="mt-4 grid grid-cols-2 gap-2 border-t border-border pt-4 sm:gap-3 lg:grid-cols-4">
          <fieldset className="col-span-2 min-w-0 space-y-1.5 text-xs font-medium sm:col-span-1">
            <legend>السعر</legend>
            <div className="grid grid-cols-2 gap-2">
              <label className="min-w-0">
                <span className="sr-only">السعر من</span>
                <Input className="h-9 px-2 text-sm" type="text" inputMode="decimal" dir="ltr" value={formatNumericInput(filters.minPrice)} onChange={(e) => update({ minPrice: formatNumericInput(e.target.value) })} placeholder="من" aria-label="السعر من" />
              </label>
              <label className="min-w-0">
                <span className="sr-only">السعر إلى</span>
                <Input className="h-9 px-2 text-sm" type="text" inputMode="decimal" dir="ltr" value={formatNumericInput(filters.maxPrice)} onChange={(e) => update({ maxPrice: formatNumericInput(e.target.value) })} placeholder="إلى" aria-label="السعر إلى" />
              </label>
            </div>
          </fieldset>
          <fieldset className="col-span-2 min-w-0 space-y-1.5 text-xs font-medium sm:col-span-1">
            <legend>المساحة</legend>
            <div className="grid grid-cols-2 gap-2">
              <label className="min-w-0">
                <span className="sr-only">المساحة من</span>
                <Input className="h-9 px-2 text-sm" type="number" min="0" value={filters.minArea} onChange={(e) => update({ minArea: e.target.value })} placeholder="من" aria-label="المساحة من" />
              </label>
              <label className="min-w-0">
                <span className="sr-only">المساحة إلى</span>
                <Input className="h-9 px-2 text-sm" type="number" min="0" value={filters.maxArea} onChange={(e) => update({ maxArea: e.target.value })} placeholder="إلى" aria-label="المساحة إلى" />
              </label>
            </div>
          </fieldset>
          <label className="space-y-1.5 text-xs font-medium">
            <span>عدد الغرف (حد أدنى)</span>
            <Input className="h-9 text-sm" type="number" min="0" value={filters.beds} onChange={(e) => update({ beds: e.target.value })} placeholder="الغرف" />
          </label>
          <label className="space-y-1.5 text-xs font-medium">
            <span>عدد الحمامات (حد أدنى)</span>
            <Input className="h-9 text-sm" type="number" min="0" value={filters.baths} onChange={(e) => update({ baths: e.target.value })} placeholder="الحمامات" />
          </label>
          <label className="space-y-1.5 text-xs font-medium">
            <span>الموقع داخل المدينة</span>
            <Input className="h-9 text-sm" value={filters.location} onChange={(e) => update({ location: e.target.value })} placeholder="الحي أو الكمباوند" />
          </label>
          <label className="space-y-1.5 text-xs font-medium">
            <span>الدور</span>
            <Input className="h-9 text-sm" value={filters.floor} onChange={(e) => update({ floor: e.target.value })} placeholder="رقم الدور" />
          </label>
          <label className="space-y-1.5 text-xs font-medium">
            <span>المصعد</span>
            <Select value={filters.elevator} onValueChange={(value) => update({ elevator: value })}>
              <SelectTrigger><SelectValue placeholder="الكل" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="نعم">يوجد مصعد</SelectItem>
                <SelectItem value="لا">بدون مصعد</SelectItem>
              </SelectContent>
            </Select>
          </label>
          <label className="space-y-1.5 text-xs font-medium">
            <span>موقف سيارة</span>
            <Select value={filters.parking} onValueChange={(value) => update({ parking: value })}>
              <SelectTrigger><SelectValue placeholder="الكل" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="يوجد">يوجد موقف سيارة</SelectItem>
                <SelectItem value="لا يوجد">لا يوجد موقف سيارة</SelectItem>
                <SelectItem value="خاص">موقف خاص</SelectItem>
                <SelectItem value="مشترك">موقف مشترك</SelectItem>
              </SelectContent>
            </Select>
          </label>
          <label className="col-span-2 space-y-1.5 text-xs font-medium sm:col-span-2 lg:col-span-2">
            <span>المميزات الإضافية</span>
            <Input
              value={filters.additionalFeatures}
              onChange={(e) => update({ additionalFeatures: e.target.value })}
              placeholder="مثال: جراج، أمن، جيم، مسبح، حديقة..."
            />
            <span className="block text-[11px] font-normal text-muted-foreground">
              يبحث في الموقف والوصف والموقع وباقي البيانات.
            </span>
          </label>
          <div className="col-span-2 flex items-end gap-2 sm:col-span-1">
            <Button type="button" className="h-9 flex-1 gap-1.5 bg-accent text-white hover:bg-accent/90" onClick={() => onApply(filters)}>
              <Search className="h-4 w-4" /> تطبيق الفلاتر
            </Button>
            <Button type="button" variant="outline" className="h-9 gap-1.5" onClick={onReset}>
              <RotateCcw className="h-4 w-4" /> إعادة تعيين
            </Button>
          </div>
        </div>
      )}

      <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-border pt-3">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs text-muted-foreground">ترتيب حسب:</span>
          <Select value={filters.sort} onValueChange={(value) => update({ sort: value as PropertyFilterState["sort"] }, true)}>
            <SelectTrigger className="h-8 w-32 text-xs"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">الأحدث</SelectItem>
              <SelectItem value="priceAsc">السعر: الأقل</SelectItem>
              <SelectItem value="priceDesc">السعر: الأعلى</SelectItem>
              <SelectItem value="areaDesc">المساحة: الأكبر</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-center gap-1 rounded-md border border-border p-0.5">
          <button
            type="button"
            aria-label="بطاقات متوسطة"
            title="بطاقات متوسطة"
            className={cn("rounded p-1.5", filters.cardSize === "medium" && "bg-accent text-white")}
            onClick={() => update({ viewMode: "grid", cardSize: "medium" })}
          >
            <Grid2X2 className="h-4 w-4" />
          </button>
          <button
            type="button"
            aria-label="بطاقات صغيرة"
            title="بطاقات صغيرة"
            className={cn("rounded p-1.5", filters.cardSize === "compact" && "bg-accent text-white")}
            onClick={() => update({ viewMode: "list", cardSize: "compact" })}
          >
            <List className="h-4 w-4" />
          </button>
        </div>
      </div>
      {resultCount !== undefined && (
        <p className="mt-2 text-xs text-muted-foreground">
          {resultCount} عقارًا{showMatched ? " مطابقًا" : ""}{cityName ? ` في ${cityName}` : ""}
        </p>
      )}
    </section>
  );
}