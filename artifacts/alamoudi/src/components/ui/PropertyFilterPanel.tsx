import { useState, useEffect, useRef } from "react";
import {
  Grid2X2,
  List,
  RotateCcw,
  Search,
  SlidersHorizontal,
  X,
  MapPin,
  Building,
  Home,
  Briefcase,
  Stethoscope,
  Paintbrush,
  Building2,
  ChevronDown,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn, formatNumericInput } from "@/lib/utils";
import { FINISHING_OPTIONS } from "@/lib/finishingOptions";
import {
  CATEGORY_OPTIONS,
  SECTOR_OPTIONS,
  type PropertyFilterState,
  type PropertySector,
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

const SEARCH_PROMPTS = [
  "شقة تشطيب ألترا سوبر لوكس في التجمع...",
  "فيلا مستقلة بحديقة ومسبح خاص...",
  "مكتب إداري بموقع متميز في الشروق...",
  "دوبلكس استلام فوري في مدينة بدر...",
  "محل تجاري استثماري في مدينتي...",
  "بنتهاوس روف بإطلالة بانورامية...",
  "تاون هاوس راقي في كمبوند وصال...",
  "شقة مفروشة للإيجار في مدينة نصر...",
  "عقار للبيع في بيت الوطن...",
];

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
  const [promptIndex, setPromptIndex] = useState(0);
  const [isFocused, setIsFocused] = useState(false);
  const [isAnimating, setIsAnimating] = useState(true);

  // Rotating search ticker animation
  useEffect(() => {
    if (isFocused || filters.searchText) return;
    const interval = setInterval(() => {
      setIsAnimating(false);
      setTimeout(() => {
        setPromptIndex((prev) => (prev + 1) % SEARCH_PROMPTS.length);
        setIsAnimating(true);
      }, 300);
    }, 3500);
    return () => clearInterval(interval);
  }, [isFocused, filters.searchText]);

  const update = (patch: Partial<PropertyFilterState>, applyImmediately = false) => {
    const next = { ...filters, ...patch };
    onChange(next);
    if (applyImmediately) onApply(next);
  };

  const getSectorIcon = (sector: PropertySector) => {
    switch (sector) {
      case "residential":
        return <Home className="h-3.5 w-3.5" />;
      case "commercial":
        return <Building2 className="h-3.5 w-3.5" />;
      case "administrative":
        return <Briefcase className="h-3.5 w-3.5" />;
      case "medical":
        return <Stethoscope className="h-3.5 w-3.5" />;
      default:
        return null;
    }
  };

  return (
    <section className="rounded-3xl border border-accent/25 bg-card/95 backdrop-blur-xl p-4 sm:p-6 shadow-[0_12px_36px_rgba(16,32,45,0.12)] transition-all duration-300">
      {/* ── 1. Hero Search Input with Animated Sliding Ticker ── */}
      <div className="relative mb-5 group">
        <div className="relative flex items-center rounded-2xl border border-border/80 bg-background/90 hover:border-accent/60 focus-within:border-accent focus-within:ring-2 focus-within:ring-accent/20 transition-all duration-300 shadow-sm overflow-hidden h-13 sm:h-14">
          <div className="flex items-center justify-center pr-4 text-accent">
            <Search className="h-5 w-5" />
          </div>

          <div className="relative flex-1 h-full flex items-center">
            {/* Animated Ticker Placeholder with STATIC prefix */}
            {!filters.searchText && !isFocused && (
              <div className="absolute inset-0 flex items-center pointer-events-none pr-3 pl-4 select-none overflow-hidden">
                <span className="text-accent/90 font-bold text-xs sm:text-sm ml-2 shrink-0">
                  جرب البحث عن:
                </span>
                <div className="relative overflow-hidden h-6 flex items-center flex-1">
                  <span
                    className={cn(
                      "text-xs sm:text-sm text-muted-foreground transition-all duration-300 transform truncate block",
                      isAnimating
                        ? "translate-y-0 opacity-100"
                        : "-translate-y-4 opacity-0"
                    )}
                  >
                    {SEARCH_PROMPTS[promptIndex]}
                  </span>
                </div>
              </div>
            )}

            <Input
              type="text"
              className="w-full h-full border-0 bg-transparent px-3 text-sm sm:text-base focus-visible:ring-0 focus-visible:ring-offset-0 text-foreground placeholder:text-transparent"
              value={filters.searchText}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              onChange={(event) => update({ searchText: event.target.value }, true)}
              onKeyDown={(e) => {
                if (e.key === "Enter") onApply(filters);
              }}
            />
          </div>

          {/* Clear button */}
          {filters.searchText && (
            <button
              type="button"
              aria-label="مسح البحث"
              className="p-2 text-muted-foreground hover:text-foreground transition-colors"
              onClick={() => update({ searchText: "" }, true)}
            >
              <X className="h-4 w-4" />
            </button>
          )}

          {/* Search CTA Button */}
          <div className="pl-1.5 pr-2">
            <Button
              type="button"
              onClick={() => onApply(filters)}
              className="h-10 sm:h-11 px-4 sm:px-6 rounded-xl bg-accent text-accent-foreground font-bold hover:bg-accent/90 shadow-md gap-1.5 text-xs sm:text-sm"
            >
              <Search className="h-4 w-4" />
              <span>بحث</span>
            </Button>
          </div>
        </div>
      </div>

      {/* ── 2. Segmented Pill Row: نوع العرض (Centered) ── */}
      <div className="mb-4 pb-3.5 border-b border-border/50">
        <div className="flex flex-wrap items-center justify-center gap-2.5 sm:gap-3.5">
          <span className="text-xs font-bold text-foreground/90 shrink-0">
            نوع العرض:
          </span>

          <div className="flex flex-wrap items-center justify-center gap-1.5 sm:gap-2">
            {CATEGORY_OPTIONS.map((option) => {
              const active = filters.category === option.value;
              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => update({ category: option.value }, true)}
                  className={cn(
                    "px-3.5 py-1.5 rounded-full text-xs font-bold transition-all duration-200 cursor-pointer select-none",
                    active
                      ? "bg-accent text-accent-foreground shadow-sm scale-105"
                      : "bg-muted/60 text-muted-foreground hover:bg-muted hover:text-foreground border border-border/40"
                  )}
                >
                  {option.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── 3. Category / Sector Row: فئة العقار (Centered) ── */}
      <div className="mb-4">
        <div className="flex flex-wrap items-center justify-center gap-2.5 sm:gap-3.5">
          <span className="text-xs font-bold text-foreground/90 shrink-0">
            فئة العقار:
          </span>

          <div className="flex flex-wrap items-center justify-center gap-1.5 sm:gap-2">
            {SECTOR_OPTIONS.map((option) => {
              const active = filters.sector === option.value;
              const icon = getSectorIcon(option.value);
              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => update({ sector: option.value }, true)}
                  className={cn(
                    "inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer select-none",
                    active
                      ? "bg-accent/15 text-accent border border-accent/60 shadow-sm"
                      : "bg-muted/40 text-muted-foreground hover:bg-muted/80 hover:text-foreground border border-border/40"
                  )}
                >
                  {icon}
                  <span>{option.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── 4. Main Dropdowns Grid ── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 sm:gap-3">
        {/* المدينة / المنطقة */}
        {!fixedRegionId && (
          <div className="relative">
            <Select
              value={filters.regionId}
              onValueChange={(value) => update({ regionId: value }, true)}
            >
              <SelectTrigger className="h-11 rounded-xl bg-background/80 border-border/70 text-xs sm:text-sm font-medium px-3.5 focus:border-accent focus:ring-1 focus:ring-accent/20">
                <div className="flex items-center gap-2 truncate">
                  <MapPin className="h-4 w-4 text-accent shrink-0" />
                  <SelectValue placeholder="الموقع / المدينة" />
                </div>
              </SelectTrigger>
              <SelectContent dir="rtl" className="rounded-xl">
                <SelectItem value="all">كل المدن والمناطق</SelectItem>
                {regions
                  .filter((region) => region.active)
                  .map((region) => (
                    <SelectItem key={region.id} value={region.id}>
                      {region.name}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {/* نوع العقار */}
        <div className="relative">
          <Select
            value={filters.typeId}
            onValueChange={(value) => update({ typeId: value }, true)}
          >
            <SelectTrigger className="h-11 rounded-xl bg-background/80 border-border/70 text-xs sm:text-sm font-medium px-3.5 focus:border-accent focus:ring-1 focus:ring-accent/20">
              <div className="flex items-center gap-2 truncate">
                <Building className="h-4 w-4 text-accent shrink-0" />
                <SelectValue placeholder="نوع العقار (شقة، فيلا...)" />
              </div>
            </SelectTrigger>
            <SelectContent dir="rtl" className="rounded-xl">
              <SelectItem value="all">كل أنواع العقارات</SelectItem>
              {propertyTypes
                .filter((type) => type.active)
                .map((type) => (
                  <SelectItem key={type.id} value={type.id}>
                    {type.name}
                  </SelectItem>
                ))}
            </SelectContent>
          </Select>
        </div>

        {/* حالة التشطيب */}
        <div className="relative">
          <Select
            value={filters.finishing}
            onValueChange={(value) => update({ finishing: value }, true)}
          >
            <SelectTrigger className="h-11 rounded-xl bg-background/80 border-border/70 text-xs sm:text-sm font-medium px-3.5 focus:border-accent focus:ring-1 focus:ring-accent/20">
              <div className="flex items-center gap-2 truncate">
                <Paintbrush className="h-4 w-4 text-accent shrink-0" />
                <SelectValue placeholder="حالة التشطيب" />
              </div>
            </SelectTrigger>
            <SelectContent dir="rtl" className="rounded-xl">
              {FINISHING_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* ── 5. Action Row: Advanced Filters Toggle & Reset ── */}
      <div className="mt-4 pt-3.5 border-t border-border/50 flex flex-wrap items-center justify-between gap-2.5">
        <Button
          type="button"
          variant="outline"
          className="h-9 gap-2 rounded-xl border-accent/40 text-accent hover:bg-accent/10 text-xs font-bold"
          onClick={() => setAdvancedOpen((open) => !open)}
        >
          <SlidersHorizontal className="h-3.5 w-3.5" />
          <span>{advancedOpen ? "إخفاء الفلاتر المتقدمة" : "فلاتر متقدمة (السعر، المساحة، الغرف...)"}</span>
          <ChevronDown
            className={cn(
              "h-3.5 w-3.5 transition-transform duration-200",
              advancedOpen && "rotate-180"
            )}
          />
        </Button>

        {cityName && (
          <span className="text-xs font-semibold text-accent bg-accent/10 px-3 py-1 rounded-full border border-accent/20">
            📍 {cityName}
          </span>
        )}
      </div>

      {/* ── 6. Advanced Filters Expandable Section ── */}
      {advancedOpen && (
        <div className="mt-4 pt-4 border-t border-border/60 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 animate-in fade-in-50 duration-300">
          <fieldset className="space-y-1.5 text-xs font-medium">
            <legend className="text-muted-foreground font-bold mb-1">نطاق السعر (ج.م)</legend>
            <div className="grid grid-cols-2 gap-2">
              <Input
                className="h-9 rounded-xl text-xs"
                type="text"
                inputMode="decimal"
                dir="ltr"
                value={formatNumericInput(filters.minPrice)}
                onChange={(e) => update({ minPrice: formatNumericInput(e.target.value) })}
                placeholder="السعر من"
              />
              <Input
                className="h-9 rounded-xl text-xs"
                type="text"
                inputMode="decimal"
                dir="ltr"
                value={formatNumericInput(filters.maxPrice)}
                onChange={(e) => update({ maxPrice: formatNumericInput(e.target.value) })}
                placeholder="السعر إلى"
              />
            </div>
          </fieldset>

          <fieldset className="space-y-1.5 text-xs font-medium">
            <legend className="text-muted-foreground font-bold mb-1">المساحة (م²)</legend>
            <div className="grid grid-cols-2 gap-2">
              <Input
                className="h-9 rounded-xl text-xs"
                type="number"
                min="0"
                value={filters.minArea}
                onChange={(e) => update({ minArea: e.target.value })}
                placeholder="المساحة من"
              />
              <Input
                className="h-9 rounded-xl text-xs"
                type="number"
                min="0"
                value={filters.maxArea}
                onChange={(e) => update({ maxArea: e.target.value })}
                placeholder="المساحة إلى"
              />
            </div>
          </fieldset>

          <div className="space-y-1.5 text-xs font-medium">
            <span className="text-muted-foreground font-bold block mb-1">عدد الغرف</span>
            <Input
              className="h-9 rounded-xl text-xs"
              type="number"
              min="0"
              value={filters.beds}
              onChange={(e) => update({ beds: e.target.value })}
              placeholder="الحد الأدنى للغرف"
            />
          </div>

          <div className="space-y-1.5 text-xs font-medium">
            <span className="text-muted-foreground font-bold block mb-1">عدد الحمامات</span>
            <Input
              className="h-9 rounded-xl text-xs"
              type="number"
              min="0"
              value={filters.baths}
              onChange={(e) => update({ baths: e.target.value })}
              placeholder="الحد الأدنى للحمامات"
            />
          </div>

          <div className="space-y-1.5 text-xs font-medium">
            <span className="text-muted-foreground font-bold block mb-1">الموقع داخل المدينة</span>
            <Input
              className="h-9 rounded-xl text-xs"
              value={filters.location}
              onChange={(e) => update({ location: e.target.value })}
              placeholder="الحي، المجاورة، الكمباوند..."
            />
          </div>

          <div className="space-y-1.5 text-xs font-medium">
            <span className="text-muted-foreground font-bold block mb-1">الدور / الطابق</span>
            <Input
              className="h-9 rounded-xl text-xs"
              value={filters.floor}
              onChange={(e) => update({ floor: e.target.value })}
              placeholder="رقم الدور"
            />
          </div>

          <div className="space-y-1.5 text-xs font-medium">
            <span className="text-muted-foreground font-bold block mb-1">المصعد</span>
            <Select
              value={filters.elevator}
              onValueChange={(value) => update({ elevator: value })}
            >
              <SelectTrigger className="h-9 rounded-xl text-xs">
                <SelectValue placeholder="الكل" />
              </SelectTrigger>
              <SelectContent dir="rtl">
                <SelectItem value="all">الكل</SelectItem>
                <SelectItem value="نعم">يوجد مصعد</SelectItem>
                <SelectItem value="لا">بدون مصعد</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5 text-xs font-medium">
            <span className="text-muted-foreground font-bold block mb-1">موقف السيارات</span>
            <Select
              value={filters.parking}
              onValueChange={(value) => update({ parking: value })}
            >
              <SelectTrigger className="h-9 rounded-xl text-xs">
                <SelectValue placeholder="الكل" />
              </SelectTrigger>
              <SelectContent dir="rtl">
                <SelectItem value="all">الكل</SelectItem>
                <SelectItem value="يوجد">يوجد موقف سيارة</SelectItem>
                <SelectItem value="لا يوجد">لا يوجد موقف سيارة</SelectItem>
                <SelectItem value="خاص">موقف خاص</SelectItem>
                <SelectItem value="مشترك">موقف مشترك</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="col-span-1 sm:col-span-2 lg:col-span-4 flex items-center justify-end gap-2 pt-2">
            <Button
              type="button"
              className="h-9 px-5 rounded-xl gap-1.5 bg-accent text-accent-foreground font-bold hover:bg-accent/90"
              onClick={() => onApply(filters)}
            >
              <Search className="h-4 w-4" /> تطبيق الفلاتر
            </Button>
            <Button
              type="button"
              variant="outline"
              className="h-9 px-4 rounded-xl gap-1.5 text-xs"
              onClick={onReset}
            >
              <RotateCcw className="h-3.5 w-3.5" /> إعادة تعيين
            </Button>
          </div>
        </div>
      )}

      {/* ── 7. Bottom Sorting & Layout Bar ── */}
      <div className="mt-4 pt-3 flex flex-wrap items-center justify-between gap-2.5 border-t border-border/50 text-xs">
        <div className="flex items-center gap-2">
          <span className="text-muted-foreground font-medium">ترتيب حسب:</span>
          <Select
            value={filters.sort}
            onValueChange={(value) =>
              update({ sort: value as PropertyFilterState["sort"] }, true)
            }
          >
            <SelectTrigger className="h-8 w-36 rounded-lg text-xs font-medium bg-muted/40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent dir="rtl" className="rounded-xl">
              <SelectItem value="newest">الأحدث أولاً</SelectItem>
              <SelectItem value="priceAsc">السعر: من الأقل للأعلى</SelectItem>
              <SelectItem value="priceDesc">السعر: من الأعلى للأقل</SelectItem>
              <SelectItem value="areaDesc">المساحة: من الأكبر للأصغر</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-3">
          {resultCount !== undefined && (
            <span className="font-bold text-accent">
              {resultCount} {resultCount === 1 ? "عقار متاح" : "عقارات متاحة"}
              {showMatched ? " مطابق لبحثك" : ""}
            </span>
          )}

          <div className="flex items-center gap-1 rounded-lg border border-border/60 bg-muted/30 p-0.5">
            <button
              type="button"
              aria-label="عرض شبكي"
              title="عرض شبكي"
              className={cn(
                "rounded-md p-1.5 transition-colors cursor-pointer",
                filters.viewMode === "grid"
                  ? "bg-accent text-accent-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              )}
              onClick={() => update({ viewMode: "grid", cardSize: "medium" })}
            >
              <Grid2X2 className="h-4 w-4" />
            </button>
            <button
              type="button"
              aria-label="عرض قائمة"
              title="عرض قائمة"
              className={cn(
                "rounded-md p-1.5 transition-colors cursor-pointer",
                filters.viewMode === "list"
                  ? "bg-accent text-accent-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              )}
              onClick={() => update({ viewMode: "list", cardSize: "compact" })}
            >
              <List className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}