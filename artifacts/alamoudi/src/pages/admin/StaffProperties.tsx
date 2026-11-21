import { useState, useMemo } from "react";
import { Link, useLocation } from "wouter";
import {
  Building2, Search, Phone, MessageSquare, Copy, Check, ExternalLink,
  Pencil, Filter, ChevronLeft, MapPin, Sparkles, Home, Handshake,
  DollarSign, CheckCircle2, RefreshCw, Plus, ArrowUpDown, Layers,
  PhoneCall, ShieldAlert, Eye
} from "lucide-react";
import { useData, Property, PropertyStatus } from "@/context/DataContext";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { cn, formatNumber } from "@/lib/utils";
import { buildWaUrl } from "@/lib/phone";
import { WhatsAppIcon } from "@/components/icons/BrandIcons";

const listingTypeLabels: Record<string, string> = {
  sale: "للبيع",
  rent: "للإيجار",
  furnished: "مفروش",
};

const statusLabels: Record<PropertyStatus, { label: string; class: string }> = {
  active: { label: "نشط", class: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-500/30" },
  listed: { label: "معروض", class: "bg-blue-500/15 text-blue-700 dark:text-blue-400 border-blue-500/30" },
  draft: { label: "مسودة", class: "bg-muted text-muted-foreground border-border" },
  reserved: { label: "محجوز", class: "bg-amber-500/15 text-amber-700 dark:text-amber-400 border-amber-500/30" },
  sold: { label: "مباع", class: "bg-purple-500/15 text-purple-700 dark:text-purple-400 border-purple-500/30" },
  rented: { label: "مؤجر", class: "bg-orange-500/15 text-orange-700 dark:text-orange-400 border-orange-500/30" },
};

export default function StaffProperties() {
  const [, setLocation] = useLocation();
  const { properties, regions, propertyTypes, brokers, settings } = useData();
  const { currentUser } = useAuth();
  const { toast } = useToast();

  const [selectedRegionId, setSelectedRegionId] = useState<string>("all");
  const [sourceFilter, setSourceFilter] = useState<"all" | "direct" | "broker">("all");
  const [listingTypeFilter, setListingTypeFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("active_only");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [sortBy, setSortBy] = useState<"newest" | "price_asc" | "price_desc" | "area">("newest");
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  // Broker lookup map
  const brokerMap = useMemo(() => {
    const map = new Map<string, { name: string; phone: string; company?: string }>();
    brokers.forEach(b => {
      map.set(b.id, { name: b.name, phone: b.phone, company: b.company });
    });
    return map;
  }, [brokers]);

  // Region lookup map
  const regionMap = useMemo(() => {
    const map = new Map<string, string>();
    regions.forEach(r => map.set(r.id, r.name));
    return map;
  }, [regions]);

  // Property Type lookup map
  const typeMap = useMemo(() => {
    const map = new Map<string, string>();
    propertyTypes.forEach(t => map.set(t.id, t.name));
    return map;
  }, [propertyTypes]);

  // Filter properties
  const filteredProperties = useMemo(() => {
    return properties.filter(p => {
      // Status filter
      if (statusFilter === "active_only") {
        if (p.status !== "active" && p.status !== "listed") return false;
      } else if (statusFilter !== "all" && p.status !== statusFilter) {
        return false;
      }

      // Region filter
      if (selectedRegionId !== "all" && p.regionId !== selectedRegionId) {
        return false;
      }

      // Source filter (Direct vs Broker)
      if (sourceFilter === "direct" && p.agentType !== "direct") {
        return false;
      }
      if (sourceFilter === "broker") {
        if (p.agentType !== "broker" && !p.brokerId) return false;
      }

      // Listing type filter
      if (listingTypeFilter !== "all") {
        if (p.listingType !== listingTypeFilter && p.category !== listingTypeFilter) return false;
      }

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const code = (p.code || "").toLowerCase();
        const title = (p.title || "").toLowerCase();
        const desc = (p.description || "").toLowerCase();
        const subArea = (p.subArea || "").toLowerCase();
        const source = (p.source || "").toLowerCase();
        const rName = (regionMap.get(p.regionId) || "").toLowerCase();
        const tName = (typeMap.get(p.typeId) || "").toLowerCase();
        const brokerInfo = p.brokerId ? brokerMap.get(p.brokerId) : null;
        const bName = (brokerInfo?.name || "").toLowerCase();
        const bCompany = (brokerInfo?.company || "").toLowerCase();
        const phones = (p.sourcePhones || []).join(" ");

        const match = code.includes(q) ||
          title.includes(q) ||
          desc.includes(q) ||
          subArea.includes(q) ||
          source.includes(q) ||
          rName.includes(q) ||
          tName.includes(q) ||
          bName.includes(q) ||
          bCompany.includes(q) ||
          phones.includes(q);

        if (!match) return false;
      }

      return true;
    }).sort((a, b) => {
      if (sortBy === "price_asc") return a.price - b.price;
      if (sortBy === "price_desc") return b.price - a.price;
      if (sortBy === "area") return b.area - a.area;
      // Newest
      return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
    });
  }, [properties, selectedRegionId, sourceFilter, listingTypeFilter, statusFilter, searchQuery, sortBy, regionMap, typeMap, brokerMap]);

  // Group properties by region
  const groupedByRegion = useMemo(() => {
    const groups: { regionId: string; regionName: string; items: Property[] }[] = [];
    const map = new Map<string, Property[]>();

    filteredProperties.forEach(p => {
      const list = map.get(p.regionId) || [];
      list.push(p);
      map.set(p.regionId, list);
    });

    // Populate in order of regions
    regions.forEach(r => {
      const items = map.get(r.id);
      if (items && items.length > 0) {
        groups.push({ regionId: r.id, regionName: r.name, items });
        map.delete(r.id);
      }
    });

    // Any remaining items whose regionId is unknown/other
    map.forEach((items, regId) => {
      if (items.length > 0) {
        groups.push({ regionId: regId, regionName: "أخرى / غير محدد", items });
      }
    });

    return groups;
  }, [filteredProperties, regions]);

  // Stats calculation
  const totalDirect = useMemo(() => properties.filter(p => p.agentType === "direct").length, [properties]);
  const totalBroker = useMemo(() => properties.filter(p => p.agentType === "broker" || p.brokerId).length, [properties]);

  // Copy clean specs for customer (No broker or owner contacts)
  const handleCopyClientSpecs = (p: Property) => {
    const rName = regionMap.get(p.regionId) || "المنطقة";
    const tName = typeMap.get(p.typeId) || "عقار";
    const lType = listingTypeLabels[p.listingType || "sale"] || "للبيع";

    const specs: string[] = [];
    specs.push(`🏢 كود العقار: ${p.code}`);
    specs.push(`📍 الموقع: ${rName}${p.subArea ? ` - ${p.subArea}` : ""}`);
    specs.push(`🏷️ النوع: ${tName} (${lType})`);
    if (p.area) specs.push(`📐 المساحة: ${p.area} م²`);
    if (p.beds) specs.push(`🛏️ غرف النوم: ${p.beds}`);
    if (p.baths) specs.push(`🚿 الحمامات: ${p.baths}`);
    if (p.floor !== undefined && p.floor !== null && p.floor !== "") specs.push(`🪜 الدور: ${p.floor}`);
    if (p.finishing) specs.push(`✨ التشطيب: ${p.finishing}`);
    if (p.view) specs.push(`👁️ الإطلالة: ${p.view}`);
    if (p.elevator) specs.push(`🛗 المصعد: ${p.elevator}`);
    if (p.price) specs.push(`💰 السعر: ${formatNumber(p.price)} ج.م`);
    if (p.description) specs.push(`\n📝 التفاصيل:\n${p.description}`);

    const signature = `\n📞 للمعاينة وحجز موعد:\n${settings.companyName || "العمودي للتسويق العقاري"}\nهاتف / واتساب: ${settings.phone1 || settings.whatsapp || ""}`;
    const fullText = specs.join("\n") + signature;

    if (navigator.clipboard) {
      navigator.clipboard.writeText(fullText);
      setCopiedCode(p.code);
      setTimeout(() => setCopiedCode(null), 2500);
      toast({
        title: `تم نسخ مواصفات العقار (${p.code}) بنجاح`,
        description: "الرسالة منسقة وجاهزة للإرسال للعميل مباشرة في واتساب.",
        duration: 2500,
      });
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground pb-20 selection:bg-accent/20">
      {/* Top Header */}
      <header className="sticky top-0 z-40 bg-background/95 backdrop-blur-md border-b border-border shadow-xs">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 h-14 sm:h-16 flex items-center justify-between gap-2">
          {/* Right: Back button + Title */}
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <Link
              href="/"
              className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-muted/70 hover:bg-muted flex items-center justify-center transition active:scale-95 shrink-0"
              title="الرجوع للرئيسية"
            >
              <ChevronLeft className="h-4 w-4 sm:h-5 sm:w-5 rotate-180" />
            </Link>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 sm:gap-2">
                <Building2 className="h-4 w-4 sm:h-5 sm:w-5 text-accent shrink-0" />
                <h1 className="text-sm sm:text-base font-black truncate">دليل عقارات الموظفين</h1>
                <Badge variant="outline" className="hidden sm:inline-flex text-[10px] font-bold bg-accent/10 border-accent/30 text-accent px-1.5 py-0">
                  خاص بالفريق
                </Badge>
              </div>
              <p className="text-[10px] sm:text-xs text-muted-foreground truncate">
                بحث سريع ومفصل لمقارنة المباشر والبروكرات حسب المدينة
              </p>
            </div>
          </div>

          {/* Left: Quick actions */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            <Link
              href="/admin/properties/new"
              className="inline-flex items-center gap-1 px-2.5 sm:px-3 h-8 rounded-lg text-xs font-bold bg-accent text-accent-foreground hover:bg-accent/90 shadow-xs transition active:scale-95"
            >
              <Plus className="h-3.5 w-3.5" />
              <span className="hidden xs:inline">عقار جديد</span>
            </Link>
            <Link
              href="/admin"
              className="inline-flex items-center gap-1 px-2.5 h-8 rounded-lg text-xs font-bold bg-muted hover:bg-muted/80 text-foreground transition active:scale-95"
              title="لوحة التحكم"
            >
              <span>لوحة التحكم</span>
            </Link>
            <ThemeToggle />
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-3 sm:px-6 py-4 space-y-4">
        {/* Quick KPI Stats Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
          {/* Total Properties */}
          <div className="p-3 rounded-xl bg-card border border-border/80 shadow-xs flex items-center justify-between">
            <div>
              <p className="text-[11px] font-medium text-muted-foreground">إجمالي العقارات</p>
              <p className="text-lg sm:text-2xl font-black font-mono text-foreground mt-0.5">{properties.length}</p>
            </div>
            <div className="w-9 h-9 rounded-xl bg-accent/10 text-accent flex items-center justify-center shrink-0">
              <Building2 className="h-4 w-4" />
            </div>
          </div>

          {/* Direct (Owner) */}
          <button
            type="button"
            onClick={() => setSourceFilter(sourceFilter === "direct" ? "all" : "direct")}
            className={cn(
              "p-3 rounded-xl border text-right transition-all cursor-pointer shadow-xs flex items-center justify-between",
              sourceFilter === "direct"
                ? "bg-emerald-500/15 border-emerald-500 text-emerald-950 dark:text-emerald-100 ring-2 ring-emerald-500"
                : "bg-card border-border/80 hover:border-emerald-500/50"
            )}
          >
            <div>
              <p className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400">مباشر من المالك 🟢</p>
              <p className="text-lg sm:text-2xl font-black font-mono text-emerald-600 dark:text-emerald-400 mt-0.5">{totalDirect}</p>
            </div>
            <div className="w-9 h-9 rounded-xl bg-emerald-500/15 text-emerald-600 flex items-center justify-center shrink-0">
              <Home className="h-4 w-4" />
            </div>
          </button>

          {/* Broker */}
          <button
            type="button"
            onClick={() => setSourceFilter(sourceFilter === "broker" ? "all" : "broker")}
            className={cn(
              "p-3 rounded-xl border text-right transition-all cursor-pointer shadow-xs flex items-center justify-between",
              sourceFilter === "broker"
                ? "bg-purple-500/15 border-purple-500 text-purple-950 dark:text-purple-100 ring-2 ring-purple-500"
                : "bg-card border-border/80 hover:border-purple-500/50"
            )}
          >
            <div>
              <p className="text-[11px] font-bold text-purple-600 dark:text-purple-400">عبر وسيط / بروكر 🟣</p>
              <p className="text-lg sm:text-2xl font-black font-mono text-purple-600 dark:text-purple-400 mt-0.5">{totalBroker}</p>
            </div>
            <div className="w-9 h-9 rounded-xl bg-purple-500/15 text-purple-600 flex items-center justify-center shrink-0">
              <Handshake className="h-4 w-4" />
            </div>
          </button>

          {/* Regions Count */}
          <div className="p-3 rounded-xl bg-card border border-border/80 shadow-xs flex items-center justify-between">
            <div>
              <p className="text-[11px] font-medium text-muted-foreground">المدن والمناطق</p>
              <p className="text-lg sm:text-2xl font-black font-mono text-foreground mt-0.5">{regions.filter(r => r.active).length}</p>
            </div>
            <div className="w-9 h-9 rounded-xl bg-muted text-foreground flex items-center justify-center shrink-0">
              <MapPin className="h-4 w-4" />
            </div>
          </div>
        </div>

        {/* Filter Controls Card */}
        <div className="p-3 sm:p-4 rounded-xl bg-card border border-border shadow-xs space-y-3">
          {/* 1. Cities & Regions Tabs */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-bold text-foreground flex items-center gap-1.5">
                <MapPin className="h-3.5 w-3.5 text-accent" />
                <span>اختر المدينة / المنطقة:</span>
              </span>
              {selectedRegionId !== "all" && (
                <button
                  type="button"
                  onClick={() => setSelectedRegionId("all")}
                  className="text-[11px] text-accent font-bold hover:underline cursor-pointer"
                >
                  عرض كل المدن
                </button>
              )}
            </div>
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
              <button
                type="button"
                onClick={() => setSelectedRegionId("all")}
                className={cn(
                  "px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition cursor-pointer shrink-0 flex items-center gap-1.5",
                  selectedRegionId === "all"
                    ? "bg-accent text-accent-foreground shadow-xs"
                    : "bg-muted/70 hover:bg-muted text-muted-foreground"
                )}
              >
                <span>كل المدن</span>
                <span className="text-[10px] font-mono px-1.5 py-0.2 rounded-full bg-black/10 dark:bg-white/10">
                  {properties.length}
                </span>
              </button>

              {regions.filter(r => r.active).map(reg => {
                const count = properties.filter(p => p.regionId === reg.id).length;
                const isSel = selectedRegionId === reg.id;
                return (
                  <button
                    key={reg.id}
                    type="button"
                    onClick={() => setSelectedRegionId(reg.id)}
                    className={cn(
                      "px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition cursor-pointer shrink-0 flex items-center gap-1.5",
                      isSel
                        ? "bg-accent text-accent-foreground shadow-xs"
                        : "bg-muted/70 hover:bg-muted text-muted-foreground"
                    )}
                  >
                    <span>{reg.name}</span>
                    <span className="text-[10px] font-mono px-1.5 py-0.2 rounded-full bg-black/10 dark:bg-white/10">
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 2. Source & Listing Type Tabs */}
          <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-border/60">
            {/* Direct vs Broker */}
            <div className="flex items-center gap-1 bg-muted/60 p-0.5 rounded-lg border border-border/60">
              <button
                type="button"
                onClick={() => setSourceFilter("all")}
                className={cn(
                  "px-2.5 py-1 rounded-md text-xs font-bold transition cursor-pointer",
                  sourceFilter === "all" ? "bg-background text-foreground shadow-xs" : "text-muted-foreground"
                )}
              >
                الكل
              </button>
              <button
                type="button"
                onClick={() => setSourceFilter("direct")}
                className={cn(
                  "px-2.5 py-1 rounded-md text-xs font-bold transition cursor-pointer flex items-center gap-1",
                  sourceFilter === "direct" ? "bg-emerald-600 text-white shadow-xs" : "text-emerald-600 dark:text-emerald-400"
                )}
              >
                <Home className="h-3 w-3" />
                <span>مباشر فقط ({totalDirect})</span>
              </button>
              <button
                type="button"
                onClick={() => setSourceFilter("broker")}
                className={cn(
                  "px-2.5 py-1 rounded-md text-xs font-bold transition cursor-pointer flex items-center gap-1",
                  sourceFilter === "broker" ? "bg-purple-600 text-white shadow-xs" : "text-purple-600 dark:text-purple-400"
                )}
              >
                <Handshake className="h-3 w-3" />
                <span>بروكر فقط ({totalBroker})</span>
              </button>
            </div>

            {/* Listing Type (Sale / Rent / Furnished) */}
            <div className="flex items-center gap-1 bg-muted/60 p-0.5 rounded-lg border border-border/60">
              {["all", "sale", "rent", "furnished"].map(t => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setListingTypeFilter(t)}
                  className={cn(
                    "px-2.5 py-1 rounded-md text-xs font-bold transition cursor-pointer",
                    listingTypeFilter === t ? "bg-background text-foreground shadow-xs" : "text-muted-foreground"
                  )}
                >
                  {t === "all" ? "كل العروض" : listingTypeLabels[t]}
                </button>
              ))}
            </div>
          </div>

          {/* 3. Search input & Status & Sort */}
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-2 pt-2 border-t border-border/60">
            {/* Search Input */}
            <div className="sm:col-span-6 relative">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="ابحث بالكود (F39)، اسم البروكر، الحي، الهاتف، السعر..."
                className="pr-9 h-9 text-xs font-medium bg-background"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs text-muted-foreground hover:text-foreground"
                >
                  مسح
                </button>
              )}
            </div>

            {/* Status Selector */}
            <div className="sm:col-span-3">
              <select
                value={statusFilter}
                onChange={e => setStatusFilter(e.target.value)}
                className="w-full h-9 rounded-lg border border-input bg-background px-3 text-xs font-bold text-foreground focus:outline-hidden focus:ring-1 focus:ring-accent"
              >
                <option value="active_only">العقارات المعروضة والنشطة</option>
                <option value="all">كل الحالات (شامل المحجوز والمباع والمسودة)</option>
                <option value="active">نشط فقط</option>
                <option value="draft">مسودات فقط</option>
                <option value="reserved">محجوز فقط</option>
                <option value="sold">مباع فقط</option>
                <option value="rented">مؤجر فقط</option>
              </select>
            </div>

            {/* Sort Selector */}
            <div className="sm:col-span-3">
              <select
                value={sortBy}
                onChange={e => setSortBy(e.target.value as any)}
                className="w-full h-9 rounded-lg border border-input bg-background px-3 text-xs font-bold text-foreground focus:outline-hidden focus:ring-1 focus:ring-accent"
              >
                <option value="newest">الأحدث إضافة</option>
                <option value="price_asc">السعر: من الأقل للأعلى</option>
                <option value="price_desc">السعر: من الأعلى للأقل</option>
                <option value="area">المساحة: الأكبر أولاً</option>
              </select>
            </div>
          </div>
        </div>

        {/* Results Count Summary */}
        <div className="flex items-center justify-between text-xs font-bold text-muted-foreground px-1">
          <span>نتائج البحث: <strong className="text-foreground font-mono">{filteredProperties.length}</strong> عقار</span>
          {selectedRegionId !== "all" && (
            <span>المدينة الحالية: <strong className="text-accent">{regionMap.get(selectedRegionId)}</strong></span>
          )}
        </div>

        {/* Properties Listing */}
        {filteredProperties.length === 0 ? (
          <div className="p-12 text-center rounded-2xl bg-card border border-dashed border-border/80 space-y-3">
            <Building2 className="h-10 w-10 text-muted-foreground mx-auto" />
            <p className="text-sm font-bold text-foreground">لا توجد عقارات مطابقة للفلاتر المحددة</p>
            <p className="text-xs text-muted-foreground">جرب مسح البحث أو تغيير تبويب المدينة أو المصدر</p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setSelectedRegionId("all");
                setSourceFilter("all");
                setListingTypeFilter("all");
                setStatusFilter("active_only");
                setSearchQuery("");
              }}
              className="text-xs font-bold"
            >
              إعادة ضبط الفلاتر
            </Button>
          </div>
        ) : selectedRegionId === "all" ? (
          /* Grouped by City / Region */
          <div className="space-y-6">
            {groupedByRegion.map(group => (
              <div key={group.regionId} className="space-y-3">
                {/* City Section Header */}
                <div className="flex items-center justify-between p-2.5 rounded-xl bg-accent/10 border border-accent/25">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-accent" />
                    <h2 className="text-sm font-black text-foreground">{group.regionName}</h2>
                    <span className="text-[11px] font-mono font-bold bg-accent text-accent-foreground px-2 py-0.5 rounded-full">
                      {group.items.length} عقار
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => setSelectedRegionId(group.regionId)}
                    className="text-[11px] font-bold text-accent hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <span>تركيز على هذه المدينة</span>
                    <ChevronLeft className="h-3 w-3" />
                  </button>
                </div>

                {/* City Properties Grid (Compact Cards) */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2.5">
                  {group.items.map(p => (
                    <StaffPropertyCard
                      key={p.id}
                      property={p}
                      regionName={group.regionName}
                      typeName={typeMap.get(p.typeId) || "عقار"}
                      brokerInfo={p.brokerId ? brokerMap.get(p.brokerId) : null}
                      isCopied={copiedCode === p.code}
                      onCopySpecs={() => handleCopyClientSpecs(p)}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* Single City Grid */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2.5">
            {filteredProperties.map(p => (
              <StaffPropertyCard
                key={p.id}
                property={p}
                regionName={regionMap.get(p.regionId) || "المدينة"}
                typeName={typeMap.get(p.typeId) || "عقار"}
                brokerInfo={p.brokerId ? brokerMap.get(p.brokerId) : null}
                isCopied={copiedCode === p.code}
                onCopySpecs={() => handleCopyClientSpecs(p)}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

// Compact Staff Property Card Component
function StaffPropertyCard({
  property: p,
  regionName,
  typeName,
  brokerInfo,
  isCopied,
  onCopySpecs,
}: {
  property: Property;
  regionName: string;
  typeName: string;
  brokerInfo?: { name: string; phone: string; company?: string } | null;
  isCopied: boolean;
  onCopySpecs: () => void;
}) {
  const isDirect = p.agentType === "direct";
  const isBroker = p.agentType === "broker" || !!p.brokerId;
  const statusInfo = statusLabels[p.status] || { label: p.status, class: "bg-muted text-muted-foreground" };
  const coverImg = p.images && p.images.length > 0 ? p.images[0] : "";

  // Contact phones
  const contactPhone = (p.sourcePhones && p.sourcePhones.length > 0 && p.sourcePhones[0])
    ? p.sourcePhones[0]
    : brokerInfo?.phone || "";

  const contactWa = contactPhone ? buildWaUrl(contactPhone) : null;
  const brokerDisplayName = brokerInfo?.name || p.source || "بروكر";

  return (
    <div className={cn(
      "rounded-xl border bg-card p-3 shadow-xs hover:shadow-md transition-all space-y-2.5 flex flex-col justify-between",
      isDirect ? "border-emerald-500/30 hover:border-emerald-500/70" : isBroker ? "border-purple-500/30 hover:border-purple-500/70" : "border-border/80"
    )}>
      {/* Top Header: Code, Badges, Status */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between gap-1.5">
          {/* Code */}
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-mono font-black px-2 py-0.5 rounded-md bg-accent/15 text-accent border border-accent/30 tracking-wider">
              #{p.code}
            </span>
            <span className="text-[11px] font-bold text-foreground">
              {typeName} ({listingTypeLabels[p.listingType || "sale"] || "للبيع"})
            </span>
          </div>

          {/* Status Badge */}
          <span className={cn("text-[10px] font-bold px-2 py-0.5 rounded-full border", statusInfo.class)}>
            {statusInfo.label}
          </span>
        </div>

        {/* Source Badge (Direct vs Broker) - Prominent and Clear */}
        <div>
          {isDirect ? (
            <div className="flex items-center justify-between px-2 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-700 dark:text-emerald-400">
              <span className="flex items-center gap-1 text-[11px] font-black">
                <Home className="h-3.5 w-3.5 text-emerald-600" />
                <span>مباشر من المالك 🟢</span>
              </span>
              {p.source && (
                <span className="text-[10px] font-medium text-muted-foreground truncate max-w-[120px]">
                  {p.source}
                </span>
              )}
            </div>
          ) : isBroker ? (
            <div className="flex items-center justify-between px-2 py-1 rounded-lg bg-purple-500/10 border border-purple-500/30 text-purple-700 dark:text-purple-400">
              <span className="flex items-center gap-1 text-[11px] font-black truncate">
                <Handshake className="h-3.5 w-3.5 text-purple-600 shrink-0" />
                <span className="truncate">وسيط: <strong>{brokerDisplayName}</strong></span>
              </span>
              {brokerInfo?.company && (
                <span className="text-[10px] font-medium text-muted-foreground truncate max-w-[100px]">
                  ({brokerInfo.company})
                </span>
              )}
            </div>
          ) : (
            <div className="flex items-center justify-between px-2 py-1 rounded-lg bg-muted border border-border text-muted-foreground text-[10px]">
              <span>المصدر: {p.source || "غير محدد"}</span>
            </div>
          )}
        </div>
      </div>

      {/* Middle Specs Section */}
      <div className="flex items-start gap-2.5">
        {/* Thumbnail Image */}
        {coverImg ? (
          <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-lg overflow-hidden bg-muted shrink-0 border border-border/70 relative">
            <img src={coverImg} alt="" className="w-full h-full object-cover" />
            {p.images.length > 1 && (
              <span className="absolute bottom-0.5 right-0.5 text-[8px] font-mono font-bold bg-black/80 text-white px-1 rounded">
                +{p.images.length}
              </span>
            )}
          </div>
        ) : (
          <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-lg bg-muted shrink-0 border border-border/70 flex items-center justify-center text-muted-foreground">
            <Building2 className="h-5 w-5" />
          </div>
        )}

        {/* Specs Details */}
        <div className="min-w-0 flex-1 space-y-1">
          <p className="text-xs font-bold text-foreground truncate">
            {regionName} {p.subArea ? `• ${p.subArea}` : ""}
          </p>

          <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[11px] text-muted-foreground font-medium">
            {p.area ? <span>{p.area} م²</span> : null}
            {p.beds ? <span>{p.beds} غرف</span> : null}
            {p.baths ? <span>{p.baths} حمام</span> : null}
            {p.floor !== undefined && p.floor !== null && p.floor !== "" ? <span>الدور {p.floor}</span> : null}
            {p.finishing ? <span className="truncate">{p.finishing}</span> : null}
          </div>

          {/* Price */}
          <div className="pt-0.5">
            <span className="text-sm font-black font-mono text-accent">
              {formatNumber(p.price)} <span className="text-[10px] font-sans font-bold">ج.م</span>
            </span>
          </div>
        </div>
      </div>

      {/* Contact & Phone Section for Staff */}
      {contactPhone ? (
        <div className="p-1.5 rounded-lg bg-muted/60 border border-border/60 flex items-center justify-between gap-1 text-[11px]">
          <span className="font-mono font-bold text-foreground truncate dir-ltr">
            {contactPhone}
          </span>
          <div className="flex items-center gap-1 shrink-0">
            <a
              href={`tel:${contactPhone}`}
              className="p-1 rounded-md bg-background hover:bg-emerald-500 hover:text-white border border-border text-emerald-600 transition"
              title="اتصال هاتفي"
            >
              <Phone className="h-3.5 w-3.5" />
            </a>
            {contactWa && (
              <a
                href={contactWa}
                target="_blank"
                rel="noopener noreferrer"
                className="p-1 rounded-md bg-background hover:bg-green-600 hover:text-white border border-border text-green-600 transition"
                title="مراسلة واتساب"
              >
                <WhatsAppIcon className="h-3.5 w-3.5" />
              </a>
            )}
          </div>
        </div>
      ) : null}

      {/* Bottom Actions Bar */}
      <div className="pt-2 border-t border-border/70 flex items-center justify-between gap-1">
        {/* Copy Specs Button */}
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={onCopySpecs}
          className={cn(
            "h-7 text-[10.5px] font-bold px-2 flex-1 flex items-center justify-center gap-1 transition active:scale-95",
            isCopied ? "bg-emerald-500/15 text-emerald-600 border-emerald-500" : ""
          )}
          title="نسخ مواصفات العقار بدون بيانات المالك أو البروكر لإرسالها للعميل"
        >
          {isCopied ? (
            <>
              <Check className="h-3 w-3 text-emerald-600" />
              <span>تم النسخ ✓</span>
            </>
          ) : (
            <>
              <Copy className="h-3 w-3 text-muted-foreground" />
              <span>نسخ للعميل</span>
            </>
          )}
        </Button>

        {/* View Details Link */}
        <Link
          href={`/properties/${p.id}`}
          target="_blank"
          className="h-7 px-2 rounded-md border border-border hover:bg-muted text-muted-foreground hover:text-foreground text-[10.5px] font-bold flex items-center gap-1 transition"
          title="معاينة بطاقة العقار الكاملة"
        >
          <Eye className="h-3 w-3" />
          <span className="hidden sm:inline">معاينة</span>
        </Link>

        {/* Edit Link */}
        <Link
          href={`/admin/properties/${p.id}/edit`}
          className="h-7 px-2 rounded-md border border-border hover:bg-accent/10 hover:text-accent hover:border-accent/30 text-muted-foreground text-[10.5px] font-bold flex items-center gap-1 transition"
          title="تعديل بيانات العقار"
        >
          <Pencil className="h-3 w-3" />
          <span className="hidden sm:inline">تعديل</span>
        </Link>
      </div>
    </div>
  );
}
