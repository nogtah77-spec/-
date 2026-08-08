import { Card, CardContent, CardFooter } from "./card";
import { Badge } from "./badge";
import { Button } from "./button";
import { Heart, Scale, Bed, Bath, Square, Share2, Phone, Copy, Camera, Play, Video, ExternalLink, MapPin } from "lucide-react";
import { WhatsAppIcon, TikTokIcon } from "../icons/BrandIcons";
import { Skeleton } from "./skeleton";
import type { Property } from "@/context/DataContext";
import { useData } from "@/context/DataContext";
import { getTiktokUrl, getTiktokName } from "@/lib/socials";
import { normalizePhoneForWa } from "@/lib/phone";
import { useUserPrefs } from "@/context/UserPrefsContext";
import { useToast } from "@/hooks/use-toast";
import { cn, formatNumber } from "@/lib/utils";
import { getVideoThumbnailUrl, hasVideo } from "@/lib/videoThumbnail";
import { useLocation } from "wouter";
import { useState, useEffect } from "react";

export type CardSize = "large" | "medium" | "compact";

interface PropertyCardProps {
  isLoading?: boolean;
  property?: Property & { typeName?: string; regionName?: string };
  size?: CardSize;
  layout?: "grid" | "list";
  emphasized?: boolean;
  detailsScale?: "home" | "city";
}

const categoryLabels: Record<string, string> = {
  sale: "للبيع", rent: "للإيجار", furnished: "مفروش",
  administrative: "إداري", medical: "طبي", commercial: "تجاري",
};

export function PropertyCard({
  isLoading = false,
  property,
  size = "large",
  layout = "grid",
  emphasized = false,
  detailsScale = "home",
}: PropertyCardProps) {
  const { settings } = useData();
  const { compare, toggleFavorite, isFavorite, toggleCompare, isInCompare } = useUserPrefs();
  const { toast } = useToast();
  const [, navigate] = useLocation();
  const [thumbFailed, setThumbFailed] = useState(false);
  const compactHomeCard = size === "compact" && layout === "list" && detailsScale === "home";

  useEffect(() => { setThumbFailed(false); }, [property?.id]);

  if (isLoading || !property) {
    if (size === "compact") {
      return (
        <Card className="flex flex-row h-28 overflow-hidden border-border shadow-sm">
          <Skeleton className="w-28 h-full rounded-none flex-shrink-0" />
          <div className="flex-1 p-3 space-y-2"><Skeleton className="h-4 w-3/4" /><Skeleton className="h-5 w-1/2" /><Skeleton className="h-3 w-full" /></div>
        </Card>
      );
    }
    return (
      <Card className="overflow-hidden border-border shadow-sm flex flex-col h-full">
        <Skeleton className={cn("w-full rounded-none flex-shrink-0", size === "medium" ? "h-36" : "h-52")} />
        <CardContent className="p-4 flex-1 space-y-3"><Skeleton className="h-4 w-3/4" /><Skeleton className="h-6 w-1/2" /><Skeleton className="h-3 w-full" /></CardContent>
        <CardFooter className="p-4 pt-0 flex gap-2"><Skeleton className="h-8 flex-1" /><Skeleton className="h-8 w-8" /></CardFooter>
      </Card>
    );
  }

  const heroImg = property.images?.[0];
  const propHasVideo = hasVideo(property.videoUrl);
  const videoFirst = property.coverPriority === "video" && propHasVideo;
  const videoThumb = (videoFirst || !heroImg) ? getVideoThumbnailUrl(property.videoUrl) : null;
  const showVideoCover = videoFirst
    ? !!videoThumb && !thumbFailed
    : !heroImg && !!videoThumb && !thumbFailed;
  const showVideoPoster = videoFirst
    ? (!videoThumb || thumbFailed)
    : !heroImg && propHasVideo && (!videoThumb || thumbFailed);
  const coverImg = videoFirst ? null : heroImg;
  const imageCount = property.images?.length || 0;
  const isNew = () => { try { return Date.now() - new Date(property.createdAt).getTime() < 7 * 86400000; } catch { return false; } };
  const goToDetails = () => navigate(`/properties/${property.id}`);
  const highlightedDetails = [
    property.parking ? `موقف: ${property.parking}` : "",
    property.additionalFeatures || "",
  ].filter(Boolean).slice(0, 2);
  const detailTextClass = detailsScale === "city" ? "text-sm" : "text-xs";
  const detailIconClass = detailsScale === "city" ? "h-4 w-4" : "h-3.5 w-3.5";
  const detailItemClass = detailsScale === "city"
    ? "h-8 rounded-md border border-accent/30 bg-accent/10 px-2 py-1"
    : "h-7 rounded-md border border-accent/20 bg-accent/5 px-1.5 py-0.5";
  const detailLabelClass = detailsScale === "city" ? "text-[10px]" : "text-[9px]";

  const handleShare = async (e: React.MouseEvent) => {
    e.stopPropagation();
    const url = `${window.location.origin}/properties/${property.id}`;
    if (navigator.share) { try { await navigator.share({ title: property.title, url }); return; } catch {} }
    await navigator.clipboard.writeText(url);
    toast({ title: "تم نسخ رابط العقار" });
  };

  const handleWhatsApp = (e: React.MouseEvent) => {
    e.stopPropagation();
    const num = normalizePhoneForWa(settings.whatsapp || settings.phone1);
    const text = encodeURIComponent(`السلام عليكم، أرغب بالاستفسار عن العقار رقم (${property.code}).`);
    if (num) window.open(`https://wa.me/${num}?text=${text}`, "_blank");
    else toast({ title: "لم يتم إعداد واتساب", variant: "destructive" });
  };

  const handleCall = (e: React.MouseEvent) => {
    e.stopPropagation();
    const num = settings.phone1.replace(/\s/g, "");
    if (num) window.location.href = `tel:${num}`;
    else toast({ title: "لم يتم إعداد رقم الهاتف", variant: "destructive" });
  };

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(property.code);
    toast({ title: "تم نسخ الكود", description: property.code });
  };

  const handleFavorite = (e: React.MouseEvent) => {
    e.stopPropagation();
    const wasFav = isFavorite(property.id);
    toggleFavorite(property.id);
    toast({ title: wasFav ? "تمت الإزالة من المفضلة" : "تمت الإضافة للمفضلة" });
  };

  const handleCompare = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isInCompare(property.id) && compare.length >= 3) {
      toast({ title: "الحد الأقصى 3 عقارات للمقارنة", variant: "destructive" });
      return;
    }
    const wasIn = isInCompare(property.id);
    toggleCompare(property.id);
    toast({ title: wasIn ? "تمت الإزالة من المقارنة" : "تمت الإضافة للمقارنة" });
  };

  if (size === "compact" && layout === "list") {
    return (
      <Card
        dir="rtl"
        onClick={goToDetails}
        className={cn(
          "relative flex flex-col overflow-hidden group cursor-pointer card-luxury rounded-2xl transition-all duration-300",
          emphasized
            ? compactHomeCard ? "min-h-[212px] border-accent/30 bg-card shadow-[0_10px_28px_rgba(16,32,45,0.15)] hover:-translate-y-1 hover:border-accent/60" : "min-h-[220px] border-accent/30 bg-card shadow-[0_10px_28px_rgba(16,32,45,0.15)] hover:-translate-y-1 hover:border-accent/60"
            : compactHomeCard ? "min-h-[192px] border-card-border shadow-[0_6px_18px_rgba(16,32,45,0.08)] hover:-translate-y-0.5 hover:shadow-[0_12px_24px_rgba(16,32,45,0.12)]" : "min-h-[200px] border-card-border shadow-[0_6px_18px_rgba(16,32,45,0.08)] hover:-translate-y-0.5 hover:shadow-[0_12px_24px_rgba(16,32,45,0.12)]",
        )}
      >
        <div dir="ltr" className="pointer-events-none absolute inset-x-2 top-2 z-30 flex items-start justify-between gap-1">
          {property.typeName ? (
            <span className="inline-flex max-w-[52%] truncate rounded-full border border-accent/35 bg-accent/10 px-2.5 py-1 text-[10px] font-extrabold text-accent shadow-sm">
              {property.typeName}
            </span>
          ) : <span />}
          <Badge className="rounded-full bg-accent text-white border-none text-[11px] px-2.5 py-1 font-extrabold shadow-sm">
            {categoryLabels[property.category] || "للبيع"}
          </Badge>
        </div>
        <div className="flex min-h-0 flex-1 flex-row">
        <div className={cn("relative flex-shrink-0 overflow-hidden bg-muted", emphasized ? "w-32 sm:w-40" : "w-32")}>
          {showVideoCover
            ? <img src={videoThumb!} alt={property.title} loading="lazy" decoding="async" fetchPriority="low" sizes="128px" onError={() => setThumbFailed(true)} className="w-full h-full object-cover" />
            : coverImg
              ? <img src={coverImg} alt={property.title} loading="lazy" decoding="async" fetchPriority="low" sizes="128px" className="w-full h-full object-cover" />
              : <div className="w-full h-full bg-gradient-to-br from-muted to-muted/50" />}
          <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-black/10" />
          <div className="absolute bottom-2 inset-x-2 flex flex-wrap items-center gap-1">
            {propHasVideo && (
              <span className="flex items-center gap-0.5 rounded-full bg-black/65 px-2 py-0.5 text-[9px] text-white backdrop-blur-sm">
                <Play className="h-2.5 w-2.5 fill-white" />فيديو
              </span>
            )}
            {property.featured && <Badge className="rounded-full border-none bg-yellow-500 px-2 py-0.5 text-[9px] text-white">مميز</Badge>}
            {isNew() && <Badge className="rounded-full border-none bg-emerald-500 px-2 py-0.5 text-[9px] text-white">جديد</Badge>}
          </div>
        </div>

        <div className={cn(
          "flex min-w-0 flex-1 flex-col pb-1",
          compactHomeCard ? "justify-start" : "justify-between",
          emphasized ? "px-4 pb-1 pt-2.5" : "px-3.5 pb-1 pt-2.5",
        )}>
          <div className="min-w-0">
            <div className="mb-1.5 flex items-center justify-between gap-2">
              <div dir="ltr" className={cn(
                "relative -top-0.5 inline-flex min-w-0 items-center justify-center gap-1 rounded-md border border-accent/45 bg-gradient-to-br from-accent/15 via-accent/10 to-transparent px-1.5 py-0.5 text-center shadow-[0_3px_10px_rgba(180,152,107,0.14),inset_0_1px_0_rgba(255,255,255,0.08)]",
                emphasized ? "sm:px-2 sm:py-1" : "",
              )}>
                <span className={cn(
                  "inline-flex h-5 min-w-[3.25rem] shrink-0 items-center justify-center rounded-sm bg-accent/20 px-1 text-center font-black tracking-[0.12em] text-accent uppercase leading-none",
                  emphasized ? "text-[10px]" : "text-[9px]",
                )}>CODE</span>
                <h3 className={cn(
                  "flex h-5 items-center truncate text-center font-black font-mono tracking-[0.12em] text-accent group-hover:text-foreground transition-colors",
                  emphasized ? "text-base" : "text-xs",
                )}>{property.code}</h3>
              </div>
            </div>
            <p className={cn("flex min-w-0 flex-nowrap items-center gap-1 whitespace-nowrap text-[11px] font-medium text-foreground/85", compactHomeCard ? "mt-2.5" : "mt-3")}>
              <MapPin className="h-3 w-3 shrink-0 text-accent" />
              <span className="min-w-0 truncate">{[property.regionName, property.subArea].filter(Boolean).join(" - ") || "موقع العقار"}</span>
            </p>
            {property.finishing && (
              <p dir="rtl" className={cn("inline-flex max-w-[72%] truncate rounded-full border border-accent/25 bg-accent/10 px-2 py-0.5 text-[10px] font-semibold text-accent", compactHomeCard ? "mt-2.5" : "mt-4 translate-y-0.5")}>
                {property.finishing}
              </p>
            )}
          </div>

          <div className={cn(compactHomeCard ? "mt-1 space-y-1 pt-1" : "mt-auto space-y-1.5 pt-2")}>
            <div dir="ltr" className="flex items-center justify-end gap-1 border-t border-border/70 pt-2">
              <span className={cn("shrink-0 whitespace-nowrap font-extrabold leading-tight text-accent", emphasized ? "text-base sm:text-xl" : "text-base")}>{formatNumber(property.price)}</span>
              <span className="shrink-0 text-[10px] font-bold tracking-widest text-foreground/75">EGP</span>
            </div>
            <div dir="rtl" className={cn("grid grid-cols-3 gap-1.5 text-center font-bold text-foreground/90", detailTextClass)}>
              {property.beds > 0 ? (
                <span className={cn("inline-flex items-center justify-center gap-1 whitespace-nowrap", detailItemClass)}>
                  <span className={cn("font-semibold text-muted-foreground", detailLabelClass)}>غرف</span>
                  <Bed className={cn(detailIconClass, "text-accent")} />
                  <strong>{property.beds}</strong>
                </span>
              ) : <span />}
              {property.baths > 0 ? (
                <span className={cn("inline-flex items-center justify-center gap-1 whitespace-nowrap", detailItemClass)}>
                  <span className={cn("font-semibold text-muted-foreground", detailLabelClass)}>حمام</span>
                  <Bath className={cn(detailIconClass, "text-accent")} />
                  <strong>{property.baths}</strong>
                </span>
              ) : <span />}
              <span dir="ltr" className={cn("inline-flex items-center justify-center gap-1 whitespace-nowrap", detailItemClass)}>
                <strong>{property.area}</strong>
                <span className={cn("font-semibold text-muted-foreground", detailLabelClass)}>م²</span>
                <Square className={cn(detailIconClass, "text-accent")} />
              </span>
            </div>
          </div>
        </div>
        </div>
      </Card>
    );
  }

  const imageHeight = emphasized
    ? size === "large" ? "aspect-[1.55] min-h-64" : size === "medium" ? "aspect-[1.55] min-h-48" : "aspect-[1.75] min-h-36"
    : size === "large" ? "aspect-[1.55] min-h-52" : size === "medium" ? "aspect-[1.55] min-h-36" : "aspect-[1.75] min-h-28";
  const listMode = layout === "list";

  return (
    <Card dir="rtl" onClick={goToDetails} className={cn(
      "overflow-hidden group cursor-pointer card-luxury h-full rounded-[1.25rem] transition-all duration-300",
      emphasized
        ? "border-accent/30 shadow-[0_14px_36px_rgba(16,32,45,0.16)] hover:-translate-y-1.5 hover:border-accent/60"
        : "border-card-border shadow-[0_8px_24px_rgba(16,32,45,0.09)] hover:-translate-y-1 hover:shadow-[0_16px_34px_rgba(16,32,45,0.14)]",
      listMode
        ? "flex flex-row flex-wrap sm:flex-nowrap"
        : "flex flex-col",
    )}>
      {listMode && (
        <div dir="ltr" className="pointer-events-none absolute inset-x-3 top-2 z-30 flex items-start justify-between gap-2">
          {property.typeName ? (
            <span dir="rtl" className="inline-flex max-w-[42%] truncate rounded-full border border-accent/35 bg-accent/10 px-3 py-1 text-[11px] font-extrabold text-accent shadow-sm">
              {property.typeName}
            </span>
          ) : <span />}
          <Badge className="rounded-full bg-accent text-white border-none text-[12px] px-3 py-1 font-extrabold shadow-sm">
            {categoryLabels[property.category] || "للبيع"}
          </Badge>
        </div>
      )}
      {!listMode && (
        <div dir="ltr" className="flex min-h-9 items-center justify-between gap-2 px-3 pt-2">
          {property.typeName ? (
            <span dir="rtl" className="inline-flex max-w-[42%] truncate rounded-full border border-accent/35 bg-accent/10 px-3 py-1 text-[11px] font-extrabold text-accent shadow-sm">
              {property.typeName}
            </span>
          ) : <span />}
          <Badge className="rounded-full bg-accent text-white border-none text-[12px] px-3 py-1 font-extrabold shadow-sm">
            {categoryLabels[property.category] || "للبيع"}
          </Badge>
        </div>
      )}
      <div className={cn(
         "relative overflow-hidden bg-muted flex-shrink-0",
        listMode ? "w-32 min-h-[160px] sm:w-48 md:w-56" : imageHeight,
        listMode && "sm:min-h-0 sm:self-stretch",
      )}>
        {showVideoCover
          ? <img src={videoThumb!} alt={property.title} loading="lazy" decoding="async" fetchPriority="low" sizes="(max-width: 640px) 88vw, (max-width: 1024px) 54vw, 400px" onError={() => setThumbFailed(true)} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
          : coverImg
            ? <img src={coverImg} alt={property.title} loading="lazy" decoding="async" fetchPriority="low" sizes="(max-width: 640px) 88vw, (max-width: 1024px) 54vw, (max-width: 1024px) 380px, 400px" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
            : showVideoPoster
              ? <div className="w-full h-full bg-gradient-to-br from-accent/20 via-muted to-muted/40 flex items-center justify-center"><Video className="h-10 w-10 text-accent/50" /></div>
              : <div className="w-full h-full bg-gradient-to-br from-muted to-muted/30 flex items-center justify-center"><Camera className="h-10 w-10 text-muted-foreground/30" /></div>
        }
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent z-[5]" />

          <div className="absolute inset-x-3 top-3 z-20">
            <div className="absolute right-0 top-0 flex shrink-0 gap-1.5">
             <Button
               variant="outline"
               size="icon"
               className={cn(
                 "h-8 w-8 rounded-lg border-white/70 bg-white/90 text-slate-600 shadow-sm backdrop-blur hover:border-accent hover:bg-white hover:text-accent",
                 isFavorite(property.id) && "border-red-200 bg-red-50 text-red-500 hover:border-red-300 hover:bg-red-50 hover:text-red-600",
               )}
               onClick={handleFavorite}
               title="المفضلة"
             >
               <Heart className={cn("h-3.5 w-3.5", isFavorite(property.id) && "fill-current")} />
             </Button>
             <Button
               variant="outline"
               size="icon"
               className="h-8 w-8 rounded-lg border-white/70 bg-white/90 text-slate-600 shadow-sm backdrop-blur hover:border-accent hover:bg-white hover:text-accent"
               onClick={handleShare}
               title="مشاركة"
             >
               <Share2 className="h-3.5 w-3.5" />
             </Button>
          </div>
        </div>

         <div className="absolute bottom-3 left-3 z-20 flex flex-wrap justify-end gap-1.5 max-w-[68%]">
          {propHasVideo && (
             <span className="rounded-full bg-black/65 text-white backdrop-blur-sm text-[10px] px-2.5 py-1 flex items-center gap-1 shadow">
              <Play className="h-2.5 w-2.5 fill-white flex-shrink-0" />فيديو
            </span>
          )}
           {property.featured && <Badge className="rounded-full bg-yellow-500 text-white border-none text-[10px] px-2.5 py-1">مميز</Badge>}
           {isNew() && <Badge className="rounded-full bg-emerald-500 text-white border-none text-[10px] px-2.5 py-1">جديد</Badge>}
           {property.status === "reserved" && <Badge className="rounded-full bg-amber-500 text-white border-none text-[10px] px-2.5 py-1">محجوز</Badge>}
        </div>

        <div className="absolute bottom-3 right-3 z-20">
          {property.regionName && (
             <span className="flex items-center gap-1 rounded-full bg-black/45 px-2.5 py-1 text-xs font-medium text-white/95 backdrop-blur-sm">
               <MapPin className="h-3 w-3 text-accent" />{property.regionName}
             </span>
          )}
        </div>

        <div className="absolute bottom-3 left-3 z-20 flex items-center gap-1.5">
          {imageCount > 0 && (
             <span className="text-white/90 bg-black/45 backdrop-blur-sm px-2.5 py-1 rounded-full text-xs flex items-center gap-1">
              <Camera className="h-3 w-3" />{imageCount}
            </span>
          )}
          {property.externalUrl && (
             <span className="text-white/90 bg-black/45 backdrop-blur-sm px-2 py-1 rounded-full text-xs flex items-center gap-1" title="رابط خارجي">
              <ExternalLink className="h-3 w-3" />
            </span>
          )}
        </div>
      </div>

      <CardContent className={cn(
        "flex-1 flex flex-col min-w-0",
        listMode ? "px-3 pb-1 pt-2 sm:px-4" : emphasized ? "px-5 pb-1 pt-3 sm:px-6 sm:pt-4" : size === "large" ? "px-5 pb-1 pt-3" : "px-3 pb-1 pt-2.5 sm:px-4",
        "pb-1",
      )}>
        <div className={cn("min-w-0", emphasized ? "mb-3" : "mb-4")}>
          <div className="min-w-0">
             <div className="mb-2 flex items-center gap-2">
              <div dir="ltr" className={cn(
                "relative -top-0.5 inline-flex min-w-0 items-center justify-center gap-1.5 rounded-lg border border-accent/50 bg-gradient-to-br from-accent/15 via-accent/10 to-transparent px-2 py-1 text-center shadow-[0_5px_16px_rgba(180,152,107,0.16),inset_0_1px_0_rgba(255,255,255,0.1)]",
                emphasized ? "sm:px-2.5 sm:py-1.5" : "",
              )}>
                <span className={cn(
                  "inline-flex h-6 min-w-[3.75rem] shrink-0 items-center justify-center rounded bg-accent/20 px-1 text-center font-black tracking-[0.12em] text-accent uppercase leading-none",
                  emphasized ? "text-[11px]" : "text-[10px]",
                )}>CODE</span>
                <h3 className={cn(
                  "flex h-6 items-center truncate text-center font-black font-mono tracking-[0.14em] text-accent group-hover:text-foreground transition-colors",
                  emphasized ? "text-xl" : size === "large" ? "text-base" : size === "medium" ? "text-sm" : "text-xs",
                )}>
                  {property.code}
                </h3>
             </div>
            </div>
            <p className={cn("mt-3 flex min-w-0 flex-nowrap items-center gap-1.5 whitespace-nowrap font-medium text-foreground/85", emphasized ? "text-sm" : "text-xs")}>
              <MapPin className="h-3.5 w-3.5 shrink-0 text-accent" />
              <span className="min-w-0 truncate">{[property.regionName, property.subArea].filter(Boolean).join(" - ") || "موقع العقار"}</span>
            </p>
          </div>
        </div>
        <div className="mt-auto">
          {((property.finishing || property.view) || highlightedDetails.length > 0) && (
            <div className={cn("translate-y-1 flex flex-wrap items-center gap-1.5", emphasized ? "pb-3" : "pb-2")}>
              {emphasized
                ? highlightedDetails.map((detail) => (
                    <span key={detail} className="max-w-full truncate rounded-full border border-accent/25 bg-accent/10 px-2.5 py-1 text-[11px] font-semibold text-accent">
                      {detail}
                    </span>
                  ))
                : <>
                    {property.finishing && property.finishing !== (categoryLabels[property.category] ?? "") && <span dir="rtl" className="rounded-full border border-accent/25 bg-accent/10 px-2.5 py-1 text-[11px] font-semibold text-accent line-clamp-1">{property.finishing}</span>}
                    {property.view && <span className="rounded-full border border-border bg-muted px-2.5 py-1 text-[11px] font-semibold text-muted-foreground line-clamp-1 max-w-[55%]">{property.view}</span>}
                  </>
              }
            </div>
          )}
          <div className="space-y-2">
            <div dir="ltr" className="flex items-center justify-end gap-1 border-t border-border/70 pt-3">
              <span className={cn("shrink-0 whitespace-nowrap font-extrabold leading-none text-accent", emphasized ? "text-xl sm:text-2xl" : size === "large" ? "text-xl" : size === "medium" ? "text-lg" : "text-base")}>{formatNumber(property.price)}</span>
              <span className="shrink-0 text-[10px] font-bold tracking-[0.16em] text-foreground/75">EGP</span>
            </div>
            <div dir="rtl" className={cn("grid grid-cols-3 gap-2 text-center font-bold text-foreground/90", detailTextClass)}>
              {property.beds > 0 ? (
                <span className={cn("inline-flex items-center justify-center gap-1 whitespace-nowrap", detailItemClass)}>
                  <span className={cn("font-semibold text-muted-foreground", detailLabelClass)}>غرف</span>
                  <Bed className={cn(detailIconClass, "text-accent")} />
                  <strong>{property.beds}</strong>
                </span>
              ) : <span />}
              {property.baths > 0 ? (
                <span className={cn("inline-flex items-center justify-center gap-1 whitespace-nowrap", detailItemClass)}>
                  <span className={cn("font-semibold text-muted-foreground", detailLabelClass)}>حمام</span>
                  <Bath className={cn(detailIconClass, "text-accent")} />
                  <strong>{property.baths}</strong>
                </span>
              ) : <span />}
              <span dir="ltr" className={cn("inline-flex items-center justify-center gap-1 whitespace-nowrap", detailItemClass)}>
                <strong>{property.area}</strong>
                <span className={cn("font-semibold text-muted-foreground", detailLabelClass)}>م²</span>
                <Square className={cn(detailIconClass, "text-accent")} />
              </span>
            </div>
          </div>
        </div>
      </CardContent>

      <CardFooter className={cn(
        "flex-shrink-0 flex flex-col gap-2",
        listMode
          ? "w-full border-t border-border p-3 sm:w-48 sm:border-t-0 sm:border-r sm:p-3 md:w-56"
          : emphasized ? "p-5 sm:p-6 pt-0" : size === "large" ? "p-5 pt-0" : "p-3 sm:p-4 pt-0",
      )}>
         <Button onClick={(e) => { e.stopPropagation(); goToDetails(); }} className="w-full h-10 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 text-sm font-bold shadow-sm">
             عرض تفاصيل العقار
         </Button>
         <div className="flex gap-1.5 w-full">
           <Button variant="outline" size="sm" className="flex-1 h-9 rounded-lg text-green-600 dark:text-green-400 border-green-200 bg-green-50/50 dark:bg-green-950/20 dark:border-green-800 hover:bg-green-50 dark:hover:bg-green-950/30 hover:border-green-400 dark:hover:border-green-700 text-xs gap-1 transition-colors" onClick={handleWhatsApp}>
             <WhatsAppIcon className="h-3.5 w-3.5" />واتساب
          </Button>
           <Button variant="outline" size="sm" className="flex-1 h-9 rounded-lg text-blue-600 dark:text-blue-400 border-blue-200 bg-blue-50/50 dark:bg-blue-950/20 dark:border-blue-800 hover:bg-blue-50 dark:hover:bg-blue-950/30 hover:border-blue-400 dark:hover:border-blue-700 text-xs gap-1 transition-colors" onClick={handleCall}>
             <Phone className="h-3.5 w-3.5" />اتصال
          </Button>
           <Button variant="outline" size="icon" className="h-9 w-10 rounded-lg text-muted-foreground border-border hover:text-accent" onClick={handleCopy} title="نسخ الكود">
             <Copy className="h-3.5 w-3.5" />
          </Button>
        </div>
         <Button variant="outline" size="icon"
           className={cn("h-9 w-full rounded-lg border-accent/30 text-accent hover:bg-accent/10", isInCompare(property.id) && "bg-accent/10")}
           onClick={handleCompare} title="مقارنة">
           <Scale className="h-3.5 w-3.5" />
           <span className="mr-1 text-xs font-semibold">مقارنة العقار</span>
         </Button>
        <a
          href={getTiktokUrl(settings)}
          target="_blank"
          rel="noopener noreferrer"
          onClick={(e) => e.stopPropagation()}
          className="flex items-center justify-center gap-1.5 w-full text-[11px] text-muted-foreground hover:text-accent transition-colors"
          title="حساب تيك توك"
        >
          <TikTokIcon className="h-3 w-3 flex-shrink-0" />
          <span className="truncate">{getTiktokName(settings)}</span>
        </a>
      </CardFooter>
    </Card>
  );
}
